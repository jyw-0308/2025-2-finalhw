// main.js - 학생 페이지(student.html)에서 이차함수 그래프 그리기 및 제출 관리

const PROBLEM_TEXTS = {
  // (-3.5, -3.5) ~ (3.5, 3.5) 범위 내에서 꼭짓점, 축, 절편이 모두 정수로 포함되도록 설계
  'free-fall':
    '오른쪽 좌표평면에 \\(y = x^{2}\\) 의 그래프를 그려라.',
  'inclined-plane':
    '오른쪽 좌표평면에 \\(y = -(x - 1)^{2} + 1\\) 의 그래프를 그려라.',
  'air-resistance':
    '오른쪽 좌표평면에 \\(y = (x + 1)^{2} - 1\\) 의 그래프를 그려라.',
  'spring-oscillation':
    '오른쪽 좌표평면에 \\(y = -x^{2} + 2x\\) 의 그래프를 그려라.',
};

const PROBLEM_LABELS = {
  'free-fall': '기본형 그래프 y = x^2',
  'inclined-plane': '아래로 볼록 그래프 y = -(x - 1)^2 + 1',
  'air-resistance': '위로 볼록 그래프 y = (x + 1)^2 - 1',
  'spring-oscillation': '일반형 그래프 y = -x^2 + 2x',
};

function loadSession() {
  const raw = localStorage.getItem('fbd-current-session');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('세션 정보를 파싱하는 데 실패했습니다.', e);
    return null;
  }
}

function initProblemPanel(session) {
  const infoEl = document.getElementById('student-info');
  const visualEl = document.getElementById('problem-visual');
  const textEl = document.getElementById('problem-text');

  if (!infoEl || !visualEl || !textEl) return;

  if (!session) {
    infoEl.textContent = '세션 정보를 찾을 수 없습니다. 메인 화면에서 다시 시작해 주세요.';
    textEl.textContent = '';
    return;
  }

  const problemId = session.problemId;

  infoEl.textContent = `학번 ${session.studentId} / 이름 ${session.studentName}`;

  textEl.innerHTML = PROBLEM_TEXTS[problemId] || '선택된 문제 정보를 불러올 수 없습니다.';

  // MathJax로 수식 렌더링 - MathJax가 준비될 때까지 기다림
  const renderMath = () => {
    console.log('renderMath called');
    console.log('window.MathJax:', window.MathJax);
    
    if (window.MathJax && window.MathJax.typesetPromise) {
      console.log('MathJax.typesetPromise exists, rendering...');
      window.MathJax.typesetPromise([textEl]).then(() => {
        console.log('MathJax rendering completed');
      }).catch((err) => {
        console.error('MathJax 렌더링 오류:', err);
      });
    } else if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
      console.log('Waiting for MathJax to be ready...');
      // MathJax가 아직 로드 중이면 준비될 때까지 기다림
      window.MathJax.startup.promise.then(() => {
        console.log('MathJax startup promise resolved');
        if (window.MathJax && window.MathJax.typesetPromise) {
          console.log('Rendering after startup...');
          window.MathJax.typesetPromise([textEl]).then(() => {
            console.log('MathJax rendering completed after startup');
          }).catch((err) => {
            console.error('MathJax 렌더링 오류:', err);
          });
        }
      }).catch((err) => {
        console.error('MathJax 시작 오류:', err);
      });
    } else {
      console.log('MathJax not ready, retrying in 100ms...');
      // MathJax가 아직 로드되지 않았으면 잠시 후 다시 시도 (최대 5초)
      let retryCount = 0;
      const maxRetries = 50;
      const retry = () => {
        retryCount++;
        if (retryCount > maxRetries) {
          console.error('MathJax 로드 실패: 최대 재시도 횟수 초과');
          return;
        }
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([textEl]).then(() => {
            console.log('MathJax rendering completed after retry');
          }).catch((err) => {
            console.error('MathJax 렌더링 오류:', err);
          });
        } else if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
          window.MathJax.startup.promise.then(() => {
            if (window.MathJax && window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise([textEl]).catch((err) => {
                console.error('MathJax 렌더링 오류:', err);
              });
            }
          });
        } else {
          setTimeout(retry, 100);
        }
      };
      setTimeout(retry, 100);
    }
  };
  
  renderMath();

  // 간단한 도식(placeholder)을 CSS와 함께 표현
  visualEl.innerHTML = '';
}
function drawCoordinateGrid(ctx, canvas) {
  const width = canvas.width;
  const height = canvas.height;

  // 배경 흰색
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // 좌표 범위: (-3.5, -3.5) ~ (3.5, 3.5)
  const xMin = -3.5;
  const xMax = 3.5;
  const yMin = -3.5;
  const yMax = 3.5;
  const xRange = xMax - xMin; // 6
  const yRange = yMax - yMin; // 6

  // 픽셀당 좌표 단위
  const pixelPerUnitX = width / xRange;
  const pixelPerUnitY = height / yRange;

  // 좌표를 픽셀로 변환하는 함수
  const toPixelX = (x) => (x - xMin) * pixelPerUnitX;
  const toPixelY = (y) => height - (y - yMin) * pixelPerUnitY; // y축은 위아래 반전

  // 📌 격자선 (연한 회색) - 정수 좌표에만
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  // 정수 좌표에만 격자선 그리기
  const minIntX = Math.ceil(xMin);
  const maxIntX = Math.floor(xMax);
  for (let x = minIntX; x <= maxIntX; x++) {
    const px = toPixelX(x);
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();
  }

  const minIntY = Math.ceil(yMin);
  const maxIntY = Math.floor(yMax);
  for (let y = minIntY; y <= maxIntY; y++) {
    const py = toPixelY(y);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(width, py);
    ctx.stroke();
  }

  // 📌 축 (진한 검정)
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  // y축 (x = 0)
  const yAxisX = toPixelX(0);
  ctx.beginPath();
  ctx.moveTo(yAxisX, 0);
  ctx.lineTo(yAxisX, height);
  ctx.stroke();

  // x축 (y = 0)
  const xAxisY = toPixelY(0);
  ctx.beginPath();
  ctx.moveTo(0, xAxisY);
  ctx.lineTo(width, xAxisY);
  ctx.stroke();

  // 📌 축 레이블 (숫자 표시) - 정수 좌표에만
  ctx.fillStyle = "#000";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // x축 레이블 (정수만) - 위에서 선언한 minIntX, maxIntX 재사용
  for (let x = minIntX; x <= maxIntX; x++) {
    if (x === 0) continue; // 원점은 건너뛰기
    const px = toPixelX(x);
    ctx.fillText(x.toString(), px, xAxisY + 15);
  }

  // y축 레이블 (정수만) - 위에서 선언한 minIntY, maxIntY 재사용
  ctx.textAlign = "right";
  for (let y = minIntY; y <= maxIntY; y++) {
    if (y === 0) continue; // 원점은 건너뛰기
    const py = toPixelY(y);
    ctx.fillText(y.toString(), yAxisX - 8, py);
  }

  // 원점 표시
  ctx.textAlign = "center";
  ctx.fillText("O", yAxisX - 8, xAxisY - 12);
}

// 좌표 변환 함수 (전역으로 사용)
function getCoordinateSystem(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const xMin = -3.5;
  const xMax = 3.5;
  const yMin = -3.5;
  const yMax = 3.5;
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const pixelPerUnitX = width / xRange;
  const pixelPerUnitY = height / yRange;

  return {
    toPixelX: (x) => (x - xMin) * pixelPerUnitX,
    toPixelY: (y) => height - (y - yMin) * pixelPerUnitY,
    toMathX: (px) => (px / pixelPerUnitX) + xMin,
    toMathY: (py) => yMax - (py / pixelPerUnitY),
    xMin, xMax, yMin, yMax
  };
}

// 마우스 커서에 가장 가까운 정수 좌표 찾기
function findNearestIntegerCoord(mathX, mathY, mode, coordSystem, pixelX, pixelY) {
  let candidates = [];
  
  // 모드별 후보 좌표 생성
  switch (mode) {
    case 'vertex':
    case 'point':
      // 주변 정수 좌표들 확인 (3x3 영역)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = Math.round(mathX) + dx;
          const y = Math.round(mathY) + dy;
          if (x >= coordSystem.xMin && x <= coordSystem.xMax &&
              y >= coordSystem.yMin && y <= coordSystem.yMax) {
            const px = coordSystem.toPixelX(x);
            const py = coordSystem.toPixelY(y);
            const dist = Math.sqrt((pixelX - px) ** 2 + (pixelY - py) ** 2);
            candidates.push({ x, y, dist });
          }
        }
      }
      break;
  }
  
  // 가장 가까운 좌표 선택
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.dist - b.dist);
    const nearest = candidates[0];
    const px = coordSystem.toPixelX(nearest.x);
    const py = coordSystem.toPixelY(nearest.y);
    return { x: nearest.x, y: nearest.y, valid: true, pixelX: px, pixelY: py };
  }
  
  return { x: Math.round(mathX), y: Math.round(mathY), valid: false, pixelX, pixelY };
}

// 축 모드에서 가장 가까운 직선 찾기
function findNearestAxisLine(mathX, mathY, coordSystem, pixelX, pixelY) {
  // 수직선 후보들 (x = 정수, y축 포함)
  const verticalCandidates = [];
  for (let x = coordSystem.xMin; x <= coordSystem.xMax; x++) {
    const px = coordSystem.toPixelX(x);
    const dist = Math.abs(pixelX - px);
    // x축(y=0)과 y축(x=0)에 가중치를 주어 더 쉽게 선택되도록 함
    let weightedDist = dist;
    if (x === 0) {
      // y축(x=0)에 가중치 적용
      weightedDist = dist * 0.7;
    }
    verticalCandidates.push({ type: 'vertical', x, dist: weightedDist, originalDist: dist });
  }
  
  // 수평선 후보들 (y = 정수, x축 포함)
  const horizontalCandidates = [];
  for (let y = coordSystem.yMin; y <= coordSystem.yMax; y++) {
    const py = coordSystem.toPixelY(y);
    const dist = Math.abs(pixelY - py);
    // x축(y=0)과 y축(x=0)에 가중치를 주어 더 쉽게 선택되도록 함
    let weightedDist = dist;
    if (y === 0) {
      // x축(y=0)에 가중치 적용
      weightedDist = dist * 0.7;
    }
    horizontalCandidates.push({ type: 'horizontal', y, dist: weightedDist, originalDist: dist });
  }
  
  // 가장 가까운 수직선과 수평선 찾기
  verticalCandidates.sort((a, b) => a.dist - b.dist);
  horizontalCandidates.sort((a, b) => a.dist - b.dist);
  
  const nearestVertical = verticalCandidates[0];
  const nearestHorizontal = horizontalCandidates[0];
  
  // 더 가까운 것 선택 (가중치 적용된 거리로 비교)
  if (nearestVertical.dist < nearestHorizontal.dist) {
    return {
      type: 'vertical',
      x: nearestVertical.x,
      valid: true,
      pixelX: coordSystem.toPixelX(nearestVertical.x),
      isAxis: nearestVertical.x === 0 // y축인지 표시
    };
  } else {
    return {
      type: 'horizontal',
      y: nearestHorizontal.y,
      valid: true,
      pixelY: coordSystem.toPixelY(nearestHorizontal.y),
      isAxis: nearestHorizontal.y === 0 // x축인지 표시
    };
  }
}

// 모드별 그리기 캔버스
function initCanvas() {
  const canvas = document.getElementById('fbd-canvas');
  const clearBtn = document.getElementById('clear-canvas');
  const drawGraphBtn = document.getElementById('draw-graph');
  const toolButtons = document.querySelectorAll('.tool-btn');
  
  console.log('initCanvas called');
  console.log('canvas:', canvas);
  console.log('clearBtn:', clearBtn);
  console.log('drawGraphBtn:', drawGraphBtn);
  console.log('toolButtons:', toolButtons);
  
  if (!canvas || !clearBtn || !drawGraphBtn || !toolButtons.length) {
    console.error('Required elements not found!');
    return;
  }

  const ctx = canvas.getContext('2d');
  let currentMode = 'vertex'; // 기본 모드
  let drawing = false;
  let startPoint = null;
  let drawnElements = []; // 그려진 요소들 저장
  let previewElement = null; // 미리보기 요소

  // 좌표계 설정
  const coordSystem = getCoordinateSystem(canvas);

  // 그리드 다시 그리기
  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCoordinateGrid(ctx, canvas);
    
    // 저장된 요소들 다시 그리기
    drawnElements.forEach(element => {
      drawElement(ctx, element, coordSystem);
    });
    
    // 미리보기 그리기
    if (previewElement) {
      drawPreview(ctx, previewElement, coordSystem);
    }
  };

  // 이차함수 그래프 그리기 함수
  const drawQuadraticCurve = (ctx, element, coordSystem) => {
    const { a, h, k } = element;
    const xMin = coordSystem.xMin;
    const xMax = coordSystem.xMax;

    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let firstPoint = true;
    const step = 0.1; // x값 증가량

    for (let x = xMin; x <= xMax; x += step) {
      const y = a * (x - h) ** 2 + k;
      
      if (y >= coordSystem.yMin && y <= coordSystem.yMax) {
        const px = coordSystem.toPixelX(x);
        const py = coordSystem.toPixelY(y);
        
        if (firstPoint) {
          ctx.moveTo(px, py);
          firstPoint = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }

    ctx.stroke();
  };

  // 요소 그리기 함수
  const drawElement = (ctx, element, coordSystem) => {
    const { type } = element;
    
    if (type === 'quadratic') {
      drawQuadraticCurve(ctx, element, coordSystem);
    } else if (type === 'point') {
      const { x, y } = element;
      const px = coordSystem.toPixelX(x);
      const py = coordSystem.toPixelY(y);
      // 더 크고 굵은 점으로 표시
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      // 테두리 추가
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      // 좌표 표시 (배경 추가로 가독성 향상)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(px + 10, py - 18, 50, 14);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`(${x}, ${y})`, px + 12, py - 6);
    } else if (type === 'line') {
      const { x, y, x2, y2 } = element;
      const px1 = coordSystem.toPixelX(x);
      const py1 = coordSystem.toPixelY(y);
      const px2 = coordSystem.toPixelX(x2);
      const py2 = coordSystem.toPixelY(y2);
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);
      ctx.stroke();
    }
  };

  // 미리보기 그리기 함수
  const drawPreview = (ctx, element, coordSystem) => {
    if (element.type === 'point') {
      const { pixelX, pixelY, x, y } = element;
      // 더 크고 굵은 반투명한 원으로 표시
      ctx.fillStyle = 'rgba(29, 78, 216, 0.6)';
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, 10, 0, Math.PI * 2);
      ctx.fill();
      // 더 굵은 테두리
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 4;
      ctx.stroke();
      // 좌표 표시 (배경 추가로 가독성 향상)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(pixelX + 8, pixelY - 18, 50, 14);
      ctx.fillStyle = '#1d4ed8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`(${x}, ${y})`, pixelX + 10, pixelY - 6);
    } else if (element.type === 'line') {
      const { pixelX1, pixelY1, pixelX2, pixelY2 } = element;
      // 더 굵은 반투명한 선으로 표시
      ctx.strokeStyle = 'rgba(29, 78, 216, 0.7)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(pixelX1, pixelY1);
      ctx.lineTo(pixelX2, pixelY2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (element.type === 'axis-preview') {
      const { axisType } = element;
      // 더 굵은 반투명한 선으로 표시
      ctx.strokeStyle = 'rgba(29, 78, 216, 0.7)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      if (axisType === 'vertical' && element.pixelX !== undefined) {
        ctx.moveTo(element.pixelX, 0);
        ctx.lineTo(element.pixelX, canvas.height);
      } else if (axisType === 'horizontal' && element.pixelY !== undefined) {
        ctx.moveTo(0, element.pixelY);
        ctx.lineTo(canvas.width, element.pixelY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  // 모드 버튼 이벤트
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toolButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
    });
  });

  // 픽셀 좌표를 수학 좌표로 변환
  const getMathPos = (event) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // 캔버스의 실제 렌더링 크기와 내부 좌표계 비율 계산
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 클라이언트 좌표를 캔버스 내부 좌표로 변환
    const pixelX = (clientX - rect.left) * scaleX;
    const pixelY = (clientY - rect.top) * scaleY;
    
    const mathX = coordSystem.toMathX(pixelX);
    const mathY = coordSystem.toMathY(pixelY);
    
    return { mathX, mathY, pixelX, pixelY };
  };

  // 미리보기 업데이트
  const updatePreview = (event) => {
    const pos = getMathPos(event);
    
    // 점 모드: 가장 가까운 점 미리보기
    const nearest = findNearestIntegerCoord(pos.mathX, pos.mathY, currentMode, coordSystem, pos.pixelX, pos.pixelY);
    if (nearest.valid) {
      previewElement = {
        type: 'point',
        x: nearest.x,
        y: nearest.y,
        pixelX: nearest.pixelX,
        pixelY: nearest.pixelY
      };
    } else {
      previewElement = null;
    }
    
    redraw();
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const pos = getMathPos(event);
    
    // 점 모드: 가장 가까운 점 찾아서 찍기
    const nearest = findNearestIntegerCoord(pos.mathX, pos.mathY, currentMode, coordSystem, pos.pixelX, pos.pixelY);
    
    if (nearest.valid) {
      // 범위 체크
      if (nearest.x >= coordSystem.xMin && nearest.x <= coordSystem.xMax &&
          nearest.y >= coordSystem.yMin && nearest.y <= coordSystem.yMax) {
        
        // 점 개수 제한: 꼭짓점 1개, 지나는 점 1개
        const vertices = drawnElements.filter(e => e.type === 'point' && e.mode === 'vertex');
        const points = drawnElements.filter(e => e.type === 'point' && e.mode === 'point');
        
        if (currentMode === 'vertex') {
          // 꼭짓점은 1개만
          if (vertices.length >= 1) {
            // 기존 꼭짓점 제거
            drawnElements = drawnElements.filter(e => !(e.type === 'point' && e.mode === 'vertex'));
          }
        } else if (currentMode === 'point') {
          // 지나는 점은 1개만
          if (points.length >= 1) {
            // 기존 지나는 점 제거
            drawnElements = drawnElements.filter(e => !(e.type === 'point' && e.mode === 'point'));
          }
        }
        
        drawnElements.push({
          type: 'point',
          mode: currentMode,
          x: nearest.x,
          y: nearest.y
        });
        redraw();
      }
    }
  };

  // 마우스 이동 시 미리보기 업데이트
  const handleMouseMove = (event) => {
    updatePreview(event);
  };

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', handleMouseMove);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', (event) => {
    updatePreview(event);
  }, { passive: false });
  
  // 캔버스 밖으로 나갈 때 미리보기 제거
  canvas.addEventListener('mouseleave', () => {
    previewElement = null;
    redraw();
  });

  const clearCanvas = () => {
    drawnElements = [];
    redraw();
  };

  // 이차함수 그래프 그리기 함수
  const drawQuadraticGraph = () => {
    console.log('drawQuadraticGraph called');
    console.log('drawnElements:', drawnElements);
    
    // 입력된 요소들에서 정보 추출
    const vertices = drawnElements.filter(e => e.type === 'point' && e.mode === 'vertex');
    const points = drawnElements.filter(e => e.type === 'point' && e.mode === 'point');
    
    console.log('vertices:', vertices);
    console.log('points:', points);

    // 꼭짓점 찾기
    let vertex = null;
    if (vertices.length > 0) {
      vertex = { x: vertices[0].x, y: vertices[0].y };
    }

    // 지나는 점 찾기
    let passingPoint = null;
    if (points.length > 0) {
      passingPoint = { x: points[0].x, y: points[0].y };
    }

    // 꼭짓점과 지나는 점이 모두 있어야 함
    if (!vertex || !passingPoint) {
      alert('그래프를 그리기 위한 정보가 부족합니다.\n꼭짓점과 꼭짓점 외에 지나는 점을 모두 입력해주세요.');
      return;
    }

    // 꼭짓점과 지나는 점이 같은 경우
    if (vertex.x === passingPoint.x && vertex.y === passingPoint.y) {
      alert('꼭짓점과 지나는 점이 같을 수 없습니다.\n다른 점을 선택해주세요.');
      return;
    }

    // 이차함수 계산: y = a(x-h)^2 + k 형태
    // 꼭짓점이 (h, k)
    const h = vertex.x;
    const k = vertex.y;

    // 지나는 점 (x₁, y₁)을 이용하여 a 계산
    // y₁ = a(x₁ - h)² + k
    // a = (y₁ - k) / (x₁ - h)²
    const denominator = (passingPoint.x - h) ** 2;
    
    if (Math.abs(denominator) < 0.001) {
      alert('지나는 점이 꼭짓점의 x좌표와 같을 수 없습니다.\n다른 점을 선택해주세요.');
      return;
    }

    const a = (passingPoint.y - k) / denominator;

    // 그래프 그리기
    if (isNaN(a) || !isFinite(a)) {
      alert('그래프를 그리기 위한 정보가 부족합니다.');
      return;
    }

    // 그래프 요소 추가
    const graphElement = {
      type: 'quadratic',
      a: a,
      h: h,
      k: k,
      vertex: vertex,
      passingPoint: passingPoint
    };

    // 기존 그래프 제거
    drawnElements = drawnElements.filter(e => e.type !== 'quadratic');
    drawnElements.push(graphElement);
    redraw();
  };

  clearBtn.addEventListener('click', clearCanvas);
  
  // 그래프 그리기 버튼 이벤트 핸들러
  const handleDrawGraph = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('=== 그래프 그리기 버튼 클릭됨 ===');
    console.log('drawnElements:', drawnElements);
    
    try {
      drawQuadraticGraph();
    } catch (error) {
      console.error('Error in drawQuadraticGraph:', error);
      console.error('Error stack:', error.stack);
      alert('그래프를 그리는 중 오류가 발생했습니다: ' + error.message);
    }
  };
  
  // 버튼이 존재하는지 확인 후 이벤트 바인딩
  if (drawGraphBtn) {
    console.log('drawGraphBtn found, binding events');
    drawGraphBtn.onclick = handleDrawGraph;
    drawGraphBtn.addEventListener('click', handleDrawGraph, { capture: true });
    drawGraphBtn.addEventListener('click', handleDrawGraph, { capture: false });
  } else {
    console.error('drawGraphBtn is null!');
  }
  
  // 이벤트 위임 (버튼이 나중에 생성될 경우 대비)
  document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'draw-graph' || e.target.closest('#draw-graph'))) {
      console.log('Event delegation caught click on draw-graph');
      handleDrawGraph(e);
    }
  }, true);
  
  // 초기 그리기
  redraw();
}
// GPT Vision API 호출 함수
async function callGptVisionApi(payload) {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error("❌ OpenAI API Key가 설정되지 않았습니다.");
    throw new Error("OpenAI API Key가 없습니다 (.env 확인 필요)");
  }

  // 문제 텍스트에서 LaTeX 수식 제거하고 일반 텍스트로 변환
  // \\(y = x^{2}\\) -> y = x^2 형태로 변환
  let problemTextClean = payload.problemText
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\^{([^}]+)}/g, '^$1')  // ^{2} -> ^2
    .replace(/\{([^}]+)\}/g, '$1');  // {x} -> x
  
  const prompt = `
너는 고등학교 수학 교사이며 학생의 이차함수 그래프 과제를 채점한다.
문제: ${problemTextClean}

다음 체크리스트를 기준으로 각 항목을 평가하라. 각 항목은 통과(1점) 또는 실패(0점)로 평가한다.

채점 체크리스트:
1. 포물선이 정답과 일치하는가? (1점)
2. 그래프 설명에서 꼭짓점의 위치를 잘 설명했는가? (1점)
3. 그래프 설명에서 y절편을 잘 설명했는가? (1점)
4. 그래프 설명에서 축을 잘 설명했는가? (1점)

만점 답변 예시:
"완전제곱식으로 표현하면 y=-(x-1)+1이므로 꼭짓점의 위치는 (1,1)임을 알 수 있다. x=0을 대입했을 때 y=0이므로, y절편은 0이다. 완전제곱식을 보면 축이 x=1임을 알 수 있다. 따라서 그래프의 모양은 위와 같다."

학생이 입력한 추가 설명:
"${payload.answerDescription || '없음'}"

반드시 순수 JSON만 출력하라.
마크다운 코드블록(\`\`\`)이나 설명 문장은 절대 쓰지 마라.

출력 형식:
{
  "checklist": {
    "graphMatch": {"passed": true/false, "score": 0 또는 1, "comment": "평가 코멘트"},
    "vertexDesc": {"passed": true/false, "score": 0 또는 1, "comment": "평가 코멘트"},
    "yInterceptDesc": {"passed": true/false, "score": 0 또는 1, "comment": "평가 코멘트"},
    "axisDesc": {"passed": true/false, "score": 0 또는 1, "comment": "평가 코멘트"}
  },
  "score": 0~4 정수 (checklist의 모든 score 합계),
  "maxScore": 4,
  "feedback": "전체적인 피드백과 개선 사항을 친절히 서술"
}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "당신은 고등학교 수학 교사입니다. 이차함수 그래프를 정확하게 채점하고 체크리스트 형식으로 평가합니다." },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: payload.imageDataUrl   // 문자열을 url 필드 안으로 넣어야 함
                }
              }
            ],
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ OpenAI API HTTP 오류:", response.status, errText);
      return {
        checklist: {
          graphMatch: { passed: false, score: 0, comment: "채점 불가" },
          vertexDesc: { passed: false, score: 0, comment: "채점 불가" },
          yInterceptDesc: { passed: false, score: 0, comment: "채점 불가" },
          axisDesc: { passed: false, score: 0, comment: "채점 불가" },
        },
        score: 0,
        maxScore: 4,
        feedback: `⚠️ OpenAI API 요청이 실패했습니다. (HTTP ${response.status})\n${errText}`,
      };
    }

    const data = await response.json();
    console.log("✅ OpenAI 응답:", data);
    const rawContent = data.choices[0].message.content.trim();
    console.log("🧾 GPT 원본 content:", rawContent);
    
    let parsedFeedback;
    try {
      // ```json ... ``` 같은 코드 블록 제거
      let jsonText = rawContent;
    
      if (jsonText.startsWith("```")) {
        // 앞부분의 ```json 또는 ``` 제거
        jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "");
        // 끝부분의 ``` 제거
        jsonText = jsonText.replace(/```$/, "").trim();
      }
    
      parsedFeedback = JSON.parse(jsonText);
      
      // 체크리스트가 없는 경우 기본값 설정
      if (!parsedFeedback.checklist) {
        parsedFeedback.checklist = {
          graphMatch: { passed: false, score: 0, comment: "체크리스트 항목 없음" },
          vertexDesc: { passed: false, score: 0, comment: "체크리스트 항목 없음" },
          yInterceptDesc: { passed: false, score: 0, comment: "체크리스트 항목 없음" },
          axisDesc: { passed: false, score: 0, comment: "체크리스트 항목 없음" },
        };
      }
      
      // 체크리스트에서 점수 계산 (score가 없거나 잘못된 경우)
      if (!parsedFeedback.score && parsedFeedback.checklist) {
        parsedFeedback.score = Object.values(parsedFeedback.checklist).reduce(
          (sum, item) => sum + (item.score || 0), 0
        );
      }
      
      // maxScore 기본값 설정
      if (!parsedFeedback.maxScore) {
        parsedFeedback.maxScore = 4;
      }
      
    } catch (e) {
      console.warn("⚠️ JSON 파싱 실패, 원본 content:", rawContent, "에러:", e);
      parsedFeedback = {
        checklist: {
          graphMatch: { passed: false, score: 0, comment: "채점 불가 - 응답 파싱 실패" },
          vertexDesc: { passed: false, score: 0, comment: "채점 불가 - 응답 파싱 실패" },
          yInterceptDesc: { passed: false, score: 0, comment: "채점 불가 - 응답 파싱 실패" },
          axisDesc: { passed: false, score: 0, comment: "채점 불가 - 응답 파싱 실패" },
        },
        score: 0,
        maxScore: 4,
        feedback:
          "⚠️ GPT의 응답이 예상한 JSON 형식이 아니었습니다.\n\n원본 응답:\n" +
          rawContent,
      };
    }
    

    return parsedFeedback;
  } catch (err) {
    console.error("❌ GPT Vision 호출 중 네트워크/기타 오류:", err);
    return {
      checklist: {
        graphMatch: { passed: false, score: 0, comment: "채점 불가 - 네트워크 오류" },
        vertexDesc: { passed: false, score: 0, comment: "채점 불가 - 네트워크 오류" },
        yInterceptDesc: { passed: false, score: 0, comment: "채점 불가 - 네트워크 오류" },
        axisDesc: { passed: false, score: 0, comment: "채점 불가 - 네트워크 오류" },
      },
      score: 0,
      maxScore: 4,
      feedback:
        "⚠️ GPT Vision 호출 중 오류가 발생했습니다.\n" +
        (err.message || err.toString()),
    };
  }
}

function initSubmitForm(session) {
  const form = document.getElementById('answer-form');
  const canvas = document.getElementById('fbd-canvas');
  const feedbackSection = document.getElementById('feedback-section');
  const feedbackContent = document.getElementById('feedback-content');

  if (!form || !canvas || !feedbackSection || !feedbackContent) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!session) {
      alert('세션 정보를 찾을 수 없습니다. 메인 화면에서 다시 시작해 주세요.');
      return;
    }

    const descriptionEl = document.getElementById('answer-description');
    const description = descriptionEl ? descriptionEl.value.trim() : '';

    // 캔버스 이미지를 base64 데이터 URL로 변환
    const imageDataUrl = canvas.toDataURL('image/png');

    const submission = {
      id: `${session.studentId}-${Date.now()}`,
      studentId: session.studentId,
      studentName: session.studentName,
      problemId: session.problemId,
      problemLabel: PROBLEM_LABELS[session.problemId] || session.problemId,
      description,
      imageDataUrl,
      submittedAt: new Date().toISOString(),
    };

    feedbackSection.classList.remove('hidden');
    feedbackContent.textContent = 'AI가 이차함수 그래프를 분석하고 있습니다...';

    // GPT API(모의) 호출
    
    const gptResult = await callGptVisionApi({
      problemId: submission.problemId,
      problemText: PROBLEM_TEXTS[submission.problemId],
      studentInfo: {
        id: submission.studentId,
        name: submission.studentName,
      },
      answerDescription: submission.description,
      imageDataUrl: submission.imageDataUrl,
    });

    submission.gptFeedback = gptResult;

    // 로컬 스토리지에 제출 결과 저장 (교사용 페이지에서 읽어감)
    const existingRaw = localStorage.getItem('fbd-submissions');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(submission);
    localStorage.setItem('fbd-submissions', JSON.stringify(existing));

    // 체크리스트 형태로 피드백 표시
    let checklistHTML = '';
    if (gptResult.checklist) {
      const checklistItems = [
        { key: 'graphMatch', label: '포물선이 정답과 일치' },
        { key: 'vertexDesc', label: '설명: 꼭짓점 위치' },
        { key: 'yInterceptDesc', label: '설명: y절편' },
        { key: 'axisDesc', label: '설명: 축' },
      ];
      
      checklistHTML = '<div class="checklist-container"><h4>채점 체크리스트</h4><ul class="checklist">';
      checklistItems.forEach(item => {
        const checkItem = gptResult.checklist[item.key];
        if (checkItem) {
          const icon = checkItem.passed ? '✅' : '❌';
          const scoreText = checkItem.passed ? `(${checkItem.score}점)` : `(0점)`;
          checklistHTML += `
            <li class="checklist-item ${checkItem.passed ? 'passed' : 'failed'}">
              <span class="check-icon">${icon}</span>
              <div class="check-content">
                <span class="check-label">${item.label} ${scoreText}</span>
                ${checkItem.comment ? `<span class="check-comment">${checkItem.comment}</span>` : ''}
              </div>
            </li>
          `;
        }
      });
      checklistHTML += '</ul></div>';
    }

    feedbackContent.innerHTML = `
      <p><strong>점수:</strong> ${gptResult.score} / ${gptResult.maxScore}</p>
      ${checklistHTML}
      <div class="feedback-summary">
        <h4>전체 피드백</h4>
        <p class="feedback-text">${gptResult.feedback || '피드백이 제공되지 않았습니다.'}</p>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const session = loadSession();
  initProblemPanel(session);
  initCanvas();
  initSubmitForm(session);
  
  // MathJax가 나중에 로드될 경우를 대비하여 추가 렌더링 시도
  if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(() => {
      const problemTextEl = document.getElementById('problem-text');
      if (problemTextEl && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([problemTextEl]).catch((err) => {
          console.error('MathJax 추가 렌더링 오류:', err);
        });
      }
    });
  }
});

