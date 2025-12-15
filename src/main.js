// main.js - 학생 페이지(student.html)에서 이차함수 그래프 그리기 및 제출 관리

/**
 * 랜덤 이차함수 문제 생성
 * 규칙:
 * 1. 최고차항이 1 또는 -1 (a = 1 또는 -1)
 * 2. 꼭짓점이 (-2, -2) ~ (2, 2) 사이의 정수쌍 25개 중 하나 (단, x좌표 h ≠ 0, 즉 y축 위는 제외)
 * 3. y절편값은 -3~3 사이의 정수
 * 4. y = a(x-h)² + k 형태
 */
function generateRandomProblem() {
  // 꼭짓점이 y축 위에 있지 않도록 h에서 0을 제외
  const possibleH = [-2, -1, 1, 2];
  const possibleK = [-2, -1, 0, 1, 2];
  const possibleA = [1, -1];
  
  let validProblem = null;
  let attempts = 0;
  const maxAttempts = 100;
  
  while (!validProblem && attempts < maxAttempts) {
    attempts++;
    
    // 랜덤으로 a, h, k 선택
    const a = possibleA[Math.floor(Math.random() * possibleA.length)];
    const h = possibleH[Math.floor(Math.random() * possibleH.length)];
    const k = possibleK[Math.floor(Math.random() * possibleK.length)];
    
    // y절편 계산: y = a(0-h)² + k = a·h² + k
    const yIntercept = a * h * h + k;
    
    // y절편이 -3~3 사이 정수인지 확인
    // y=x²와 y=-x² 제외 (h=0, k=0인 경우 제외)
    if (yIntercept >= -3 && yIntercept <= 3 && Number.isInteger(yIntercept)) {
      if (h === 0 && k === 0) {
        continue; // y=x² 또는 y=-x² 제외
      }
      validProblem = { a, h, k, yIntercept };
      break;
    }
  }
  
  // 최대 시도 횟수 내에 찾지 못한 경우 기본값 반환
  if (!validProblem) {
    validProblem = { a: 1, h: 0, k: 0, yIntercept: 0 };
  }
  
  return validProblem;
}

/**
 * 문제 객체를 LaTeX 수식 문자열로 변환 (전개된 형태)
 */
function formatProblemText(problem) {
  const { a, h, k } = problem;
  
  // y = a(x-h)² + k 를 y = ax² + bx + c 형태로 전개
  const b = -2 * a * h; // x의 계수
  const c = a * h * h + k; // 상수항
  
  let expression = '';
  
  // ax² 항
  if (a === 1) {
    expression += 'x^{2}';
  } else if (a === -1) {
    expression += '-x^{2}';
  } else {
    expression += `${a}x^{2}`;
  }
  
  // bx 항
  if (b > 0) {
    expression += ` + ${b}x`;
  } else if (b < 0) {
    expression += ` - ${Math.abs(b)}x`;
  }
  
  // c 항
  if (c > 0) {
    expression += ` + ${c}`;
  } else if (c < 0) {
    expression += ` - ${Math.abs(c)}`;
  }
  
  return `순서에 따라 \\(y = ${expression}\\) 의 그래프를 그려봅시다.`;
}

/**
 * 문제 객체를 라벨 문자열로 변환
 */
function formatProblemLabel(problem) {
  const { a, h, k } = problem;
  
  let expression = '';
  
  if (h === 0) {
    if (a === 1) {
      if (k === 0) {
        expression = 'x²';
      } else if (k > 0) {
        expression = `x² + ${k}`;
      } else {
        expression = `x² - ${Math.abs(k)}`;
      }
    } else {
      if (k === 0) {
        expression = '-x²';
      } else if (k > 0) {
        expression = `-x² + ${k}`;
      } else {
        expression = `-x² - ${Math.abs(k)}`;
      }
    }
  } else {
    // h ≠ 0인 경우
    const hPart = h < 0 ? `(x + ${Math.abs(h)})` : `(x - ${h})`;
    
    if (a === 1) {
      if (k === 0) {
        expression = `${hPart}²`;
      } else if (k > 0) {
        expression = `${hPart}² + ${k}`;
      } else {
        expression = `${hPart}² - ${Math.abs(k)}`;
      }
    } else {
      if (k === 0) {
        expression = `-${hPart}²`;
      } else if (k > 0) {
        expression = `-${hPart}² + ${k}`;
      } else {
        expression = `-${hPart}² - ${Math.abs(k)}`;
      }
    }
  }
  
  return `y = ${expression}`;
}

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

  // 랜덤 문제 생성
  const problem = generateRandomProblem();
  const problemText = formatProblemText(problem);
  const problemLabel = formatProblemLabel(problem);
  
  // 세션에 문제 정보 저장 (나중에 제출 시 사용)
  session.generatedProblem = problem;
  session.problemLabel = problemLabel;
  localStorage.setItem('fbd-current-session', JSON.stringify(session));

  infoEl.textContent = `학번 ${session.studentId} / 이름 ${session.studentName}`;

  textEl.innerHTML = problemText;

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

  // 3단계를 오른쪽 단서 영역으로 이동하는 애니메이션 함수 (2단계와 동일한 방식)
  const animateStep3ToRight = (step3Section, answerText, callback) => {
    const drawingPanel = document.querySelector('.drawing-panel');
    if (!drawingPanel) {
      callback();
      return;
    }
    
    const clueList = drawingPanel.querySelector('#clue-list');
    const targetContainer = clueList || drawingPanel;
    
    const originalRect = step3Section.getBoundingClientRect();
    const originalParent = step3Section.parentElement;
    const originalStyle = {
      position: step3Section.style.position,
      top: step3Section.style.top,
      left: step3Section.style.left,
      width: step3Section.style.width,
      height: step3Section.style.height,
      margin: step3Section.style.margin,
      zIndex: step3Section.style.zIndex,
    };
    
    // 절대 위치로 고정
    step3Section.style.position = 'fixed';
    step3Section.style.top = `${originalRect.top}px`;
    step3Section.style.left = `${originalRect.left}px`;
    step3Section.style.width = `${originalRect.width}px`;
    step3Section.style.height = `${originalRect.height}px`;
    step3Section.style.margin = '0';
    step3Section.style.zIndex = '1000';
    step3Section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // 원본 자리 확보
    const placeholder = document.createElement('div');
    placeholder.style.width = `${originalRect.width}px`;
    placeholder.style.height = `${originalRect.height}px`;
    placeholder.style.visibility = 'hidden';
    originalParent.insertBefore(placeholder, step3Section);
    
    // 목표 위치 계산
    const targetRect = targetContainer.getBoundingClientRect();
    const targetTop = targetRect.top + 20;
    const targetLeft = targetRect.left + (targetRect.width / 2) - (originalRect.width / 2);
    
    requestAnimationFrame(() => {
      step3Section.style.top = `${targetTop}px`;
      step3Section.style.left = `${targetLeft}px`;
      step3Section.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        // 스타일 복원
        Object.keys(originalStyle).forEach(key => {
          step3Section.style[key] = originalStyle[key];
        });
        step3Section.style.transition = '';
        step3Section.style.transform = '';
        placeholder.remove();
        
        // 단서 배지 추가
        addStep3Badge(answerText);
        // 원래 3단계 섹션 제거하여 오른쪽 이동 효과 마무리
        step3Section.remove();
        callback();
      }, 800);
    });
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
  const checkGraphBtn = document.getElementById('check-graph');
  const toolButtons = document.querySelectorAll('.tool-btn');
  const vertexBtn = document.getElementById('tool-vertex');
  const pointBtn = document.getElementById('tool-point');
  
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
  let pointBtnVisible = false;
  // 꼭짓점과 지나는 점을 각각 별도로 저장
  let vertexPoint = null;
  let passingPoint = null;

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
    if (element.type === 'point' || element.type === 'pointWithCurve') {
      const { pixelX, pixelY, x, y } = element;
      
      // pointWithCurve 타입일 때는, 현재 꼭짓점과 이 지나는 점을 이용해
      // 희미한 이차함수 곡선을 미리 보여준다.
      if (element.type === 'pointWithCurve' && vertexPoint) {
        const h = vertexPoint.x;
        const k = vertexPoint.y;
        const denom = (x - h) ** 2;
        if (Math.abs(denom) >= 0.001) {
          const a = (y - k) / denom;
          if (!isNaN(a) && isFinite(a)) {
            ctx.save();
            ctx.strokeStyle = 'rgba(37, 99, 235, 0.45)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            let first = true;
            const step = 0.1;
            for (let xx = coordSystem.xMin; xx <= coordSystem.xMax; xx += step) {
              const yy = a * (xx - h) ** 2 + k;
              if (yy >= coordSystem.yMin && yy <= coordSystem.yMax) {
                const px = coordSystem.toPixelX(xx);
                const py = coordSystem.toPixelY(yy);
                if (first) {
                  ctx.moveTo(px, py);
                  first = false;
                } else {
                  ctx.lineTo(px, py);
                }
              }
            }
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      
      // 더 크고 굵은 반투명한 원으로 표시 (기존 포인트 미리보기)
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

  // 점 버튼 숨김 (꼭짓점 선택 후 노출)
  if (pointBtn) {
    pointBtn.style.display = 'none';
  }

  const activateMode = (modeBtn) => {
    toolButtons.forEach(b => b.classList.remove('active'));
    if (modeBtn) {
      modeBtn.classList.add('active');
      currentMode = modeBtn.dataset.mode;
    }
  };

  const showPointButton = () => {
    if (pointBtn && !pointBtnVisible) {
      pointBtn.style.display = 'inline-block';
      pointBtnVisible = true;
      // 자동으로 지나는 점 모드로 전환
      activateMode(pointBtn);
    }
  };

  // 모드 버튼 이벤트
  toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 숨겨진 버튼 클릭 방지
      if (btn === pointBtn && !pointBtnVisible) return;
      activateMode(btn);
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
      // 꼭짓점 모드일 때는 기존과 동일하게 점만 미리보기
      if (currentMode === 'vertex') {
        previewElement = {
          type: 'point',
          x: nearest.x,
          y: nearest.y,
          pixelX: nearest.pixelX,
          pixelY: nearest.pixelY
        };
      } else if (currentMode === 'point') {
        // 지나는 점 모드이고, 꼭짓점이 이미 있을 때는
        // 해당 점을 지나는 이차함수 곡선까지 함께 미리 보기
        previewElement = {
          type: vertexPoint ? 'pointWithCurve' : 'point',
          x: nearest.x,
          y: nearest.y,
          pixelX: nearest.pixelX,
          pixelY: nearest.pixelY
        };
      }
    } else {
      previewElement = null;
    }
    
    redraw();
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const pos = getMathPos(event);
    
    // 꼭짓점이 이미 있고, 여전히 꼭짓점 모드라면 더 이상 덮어쓰지 않음 (대신 지나는 점 버튼만 노출)
    if (vertexPoint && currentMode === 'vertex') {
      showPointButton();
      return;
    }
    
    // 점 모드: 가장 가까운 점 찾아서 찍기
    const nearest = findNearestIntegerCoord(pos.mathX, pos.mathY, currentMode, coordSystem, pos.pixelX, pos.pixelY);
    
    if (nearest.valid) {
      // 범위 체크
      if (nearest.x >= coordSystem.xMin && nearest.x <= coordSystem.xMax &&
          nearest.y >= coordSystem.yMin && nearest.y <= coordSystem.yMax) {
        
        if (currentMode === 'vertex') {
          // 꼭짓점은 한 번만: 이미 있으면 무시
          if (vertexPoint) {
            return;
          }
          vertexPoint = { x: nearest.x, y: nearest.y };
          // 꼭짓점을 찍으면 지나는 점 선택 버튼을 노출
          showPointButton();
          
          // drawnElements에 꼭짓점 포인트 동기화
          drawnElements = drawnElements.filter(e => !(e.type === 'point' && e.mode === 'vertex'));
          drawnElements.push({
            type: 'point',
            mode: 'vertex',
            x: vertexPoint.x,
            y: vertexPoint.y
          });
        } else if (currentMode === 'point') {
          // 꼭짓점이 먼저 있어야 지나는 점 입력 허용
          if (!vertexPoint) return;
          
          // 꼭짓점과 동일한 좌표는 무시 (꼭짓점이 움직이지 않도록)
          if (nearest.x === vertexPoint.x && nearest.y === vertexPoint.y) {
            return;
          }
          
          passingPoint = { x: nearest.x, y: nearest.y };
          
          // 지나는 점은 1개만 유지
          drawnElements = drawnElements.filter(e => !(e.type === 'point' && e.mode === 'point'));
          drawnElements.push({
            type: 'point',
            mode: 'point',
            x: passingPoint.x,
            y: passingPoint.y
          });
        }
        
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
    vertexPoint = null;
    passingPoint = null;
    // 꼭짓점을 다시 먼저 찍도록 초기화
    pointBtnVisible = false;
    if (pointBtn) pointBtn.style.display = 'none';
    if (vertexBtn) activateMode(vertexBtn);
    redraw();
  };

  // 이차함수 그래프 그리기 함수
  const drawQuadraticGraph = () => {
    console.log('drawQuadraticGraph called');
    console.log('drawnElements:', drawnElements);
    
    // 별도 상태로 저장된 꼭짓점/지나는 점 사용
    if (!vertexPoint || !passingPoint) {
      alert('그래프를 그리기 위한 정보가 부족합니다.\n꼭짓점과 꼭짓점 외에 지나는 점을 모두 입력해주세요.');
      return;
    }

    // 꼭짓점과 지나는 점이 같은 경우
    if (vertexPoint.x === passingPoint.x && vertexPoint.y === passingPoint.y) {
      alert('꼭짓점과 지나는 점이 같을 수 없습니다.\n다른 점을 선택해주세요.');
      return;
    }

    // 이차함수 계산: y = a(x-h)^2 + k 형태
    // 꼭짓점이 (h, k)
    const h = vertexPoint.x;
    const k = vertexPoint.y;

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
      a,
      h,
      k,
      vertex: { x: vertexPoint.x, y: vertexPoint.y },
      passingPoint: { x: passingPoint.x, y: passingPoint.y }
    };

    // 기존 그래프 제거
    drawnElements = drawnElements.filter(e => e.type !== 'quadratic');
    drawnElements.push(graphElement);
    redraw();
  };

  clearBtn.addEventListener('click', clearCanvas);
  
  // 그래프 정답 확인 함수
  const checkGraphAnswer = () => {
    // 점이 둘 다 찍혀야 확인 가능
    if (!vertexPoint || !passingPoint) {
      if (window.shapeShowModal) {
        window.shapeShowModal(false, '먼저 꼭짓점과 꼭짓점 외에 지나는 점을 모두 찍어주세요.', '');
      } else {
        alert('먼저 꼭짓점과 꼭짓점 외에 지나는 점을 모두 찍어주세요.');
      }
      return;
    }
    
    // 세션에서 정답 함수 정보 가져오기
    const session = loadSession();
    const problem = session?.generatedProblem;
    if (!problem) {
      if (window.shapeShowModal) {
        window.shapeShowModal(false, '문제 정보를 불러오지 못했습니다.', '');
      } else {
        alert('문제 정보를 불러오지 못했습니다.');
      }
      return;
    }
    
    const { a, h, k } = problem;
    
    // 1단계: 꼭짓점 검사
    const isVertexCorrect =
      vertexPoint.x === h &&
      vertexPoint.y === k;
    
    // 2단계: 지나는 점 검사 (이차함수 위의 점인지)
    const expectedY = a * (passingPoint.x - h) ** 2 + k;
    const isPassingPointCorrect = passingPoint.y === expectedY;
    
    if (isVertexCorrect && isPassingPointCorrect) {
      const message = '잘했어요 👏';
      const explanation = '꼭짓점과 꼭짓점 외에 지나는 점이 모두 올바르게 선택되었습니다.';
      
      // 설명 입력 영역(그래프에 대한 설명)을 노출
      const answerForm = document.getElementById('answer-form');
      if (answerForm) {
        answerForm.classList.remove('hidden');
        // 살짝 스크롤하여 학생이 보기 쉽게
        answerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      if (window.shapeShowModal) {
        window.shapeShowModal(true, message, explanation);
      } else {
        alert('잘했어요! 꼭짓점과 지나는 점이 모두 올바릅니다.');
      }
    } else {
      const message = '오른쪽 영역의 단서를 잘 확인하세요.';
      if (window.shapeShowModal) {
        window.shapeShowModal(false, message, '');
      } else {
        alert(message);
      }
    }
  };
  
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
  
  // 확인 버튼 이벤트 바인딩
  if (checkGraphBtn) {
    checkGraphBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      checkGraphAnswer();
    });
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

    // 세션에서 생성된 문제 정보 가져오기
    const generatedProblem = session.generatedProblem || generateRandomProblem();
    const problemText = formatProblemText(generatedProblem);
    const problemLabel = session.problemLabel || formatProblemLabel(generatedProblem);
    
    const submission = {
      id: `${session.studentId}-${Date.now()}`,
      studentId: session.studentId,
      studentName: session.studentName,
      problemId: session.problemId || 'random',
      problemLabel: problemLabel,
      problem: generatedProblem, // 문제 객체 저장
      description,
      imageDataUrl,
      submittedAt: new Date().toISOString(),
    };

    feedbackSection.classList.remove('hidden');
    feedbackContent.textContent = 'AI가 이차함수 그래프를 분석하고 있습니다...';

    // GPT API(모의) 호출
    
    const gptResult = await callGptVisionApi({
      problemId: submission.problemId,
      problemText: problemText,
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

/**
 * 그래프 모양 선택 버튼 초기화
 */
function initShapeButtons(session) {
  const convexUpBtn = document.getElementById('shape-convex-up');
  const convexDownBtn = document.getElementById('shape-convex-down');
  
  if (!convexUpBtn || !convexDownBtn) return;
  
  // 세션에서 생성된 문제 정보 가져오기
  const problem = session?.generatedProblem;
  if (!problem) {
    console.warn('생성된 문제 정보를 찾을 수 없습니다.');
    return;
  }
  
  const { a } = problem;
  // a > 0이면 아래로 볼록, a < 0이면 위로 볼록
  const correctAnswer = a > 0 ? 'down' : 'up'; // 'down' = 아래로 볼록, 'up' = 위로 볼록
  
  // 커스텀 모달 표시 함수
  const showModal = (isCorrect, message, explanation, onClose) => {
    const modal = document.getElementById('shape-modal');
    const modalIcon = modal.querySelector('.shape-modal-icon');
    const modalTitle = modal.querySelector('.shape-modal-title');
    const modalMessage = modal.querySelector('.shape-modal-message');
    const closeBtn = modal.querySelector('.shape-modal-close');
    
    if (isCorrect) {
      modalIcon.innerHTML = '✅';
      modalIcon.className = 'shape-modal-icon correct';
      modalTitle.textContent = '정답입니다!';
      modalMessage.innerHTML = message + (explanation ? `<br><br>${explanation}` : '');
    } else {
      modalIcon.innerHTML = '💡';
      modalIcon.className = 'shape-modal-icon incorrect';
      modalTitle.textContent = '힌트';
      modalMessage.innerHTML = message + (explanation ? `<br><br>${explanation}` : '');
    }
    
    modal.classList.add('active');
    
    // MathJax 렌더링
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([modalMessage]).catch((err) => {
        console.error('MathJax 렌더링 오류:', err);
      });
    }
    
    // 닫기 버튼 클릭
    const closeHandler = () => {
      modal.classList.remove('active');
      if (onClose) {
        setTimeout(onClose, 300);
      }
    };
    
    closeBtn.onclick = closeHandler;
    
    // 오버레이 클릭
    modal.querySelector('.shape-modal-overlay').onclick = closeHandler;
  };
  
  // 다른 모듈(예: 캔버스 확인 버튼)에서도 동일한 모달을 사용할 수 있도록 전역에 노출
  if (typeof window !== 'undefined') {
    window.shapeShowModal = showModal;
  }
  
  // 버튼을 오른쪽 영역으로 이동하는 애니메이션 함수
  const animateButtonToRight = (button, callback) => {
    const drawingPanel = document.querySelector('.drawing-panel');
    if (!drawingPanel) {
      callback();
      return;
    }
    
    // 애니메이션 전에 아이콘과 라벨 정보 미리 저장
    const shapeLabel = button.querySelector('.shape-label');
    const shapeIcon = button.querySelector('.shape-icon');
    const labelText = shapeLabel?.textContent || '';
    const iconHTML = shapeIcon ? shapeIcon.outerHTML : '';
    
    // 버튼의 원래 위치 저장
    const originalRect = button.getBoundingClientRect();
    const originalParent = button.parentElement;
    const originalStyle = {
      position: button.style.position,
      top: button.style.top,
      left: button.style.left,
      width: button.style.width,
      height: button.style.height,
      margin: button.style.margin,
      zIndex: button.style.zIndex,
    };
    
    // 버튼을 절대 위치로 변경하고 원래 위치에 고정
    button.style.position = 'fixed';
    button.style.top = `${originalRect.top}px`;
    button.style.left = `${originalRect.left}px`;
    button.style.width = `${originalRect.width}px`;
    button.style.height = `${originalRect.height}px`;
    button.style.margin = '0';
    button.style.zIndex = '1000';
    button.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // 원본 버튼을 숨김 (레이아웃 유지)
    const placeholder = document.createElement('div');
    placeholder.style.width = `${originalRect.width}px`;
    placeholder.style.height = `${originalRect.height}px`;
    placeholder.style.visibility = 'hidden';
    originalParent.insertBefore(placeholder, button);
    
    // 오른쪽 영역의 상단 위치 계산
    const targetRect = drawingPanel.getBoundingClientRect();
    const targetTop = targetRect.top + 20;
    const targetLeft = targetRect.left + (targetRect.width / 2) - (originalRect.width / 2);
    
    // 애니메이션 시작
    requestAnimationFrame(() => {
      button.style.top = `${targetTop}px`;
      button.style.left = `${targetLeft}px`;
      button.style.transform = 'scale(0.9)';
      
      // 애니메이션 완료 후
      setTimeout(() => {
        // 원래 위치로 복원
        Object.keys(originalStyle).forEach(key => {
          button.style[key] = originalStyle[key];
        });
        button.style.transition = '';
        button.style.transform = '';
        placeholder.remove();
        
        // 오른쪽 영역에 작은 버튼 추가 (선택 표시)
        const successBadge = document.createElement('div');
        successBadge.className = 'shape-success-badge';
        successBadge.innerHTML = `
          <div class="shape-success-label">그래프의 모양 : ${labelText}</div>
        `;
        
        // 단서 보드(clue-list)에 배치
        const clueList = drawingPanel.querySelector('#clue-list');
        if (clueList) {
          clueList.appendChild(successBadge);
        } else {
          drawingPanel.insertBefore(successBadge, drawingPanel.firstChild);
        }
        
        callback();
      }, 800);
    });
  };
  
  // 2단계 정답을 오른쪽 영역으로 이동하는 애니메이션 함수
  const animateStep2ToRight = (step2Section, answerText, callback) => {
    const drawingPanel = document.querySelector('.drawing-panel');
    if (!drawingPanel) {
      callback();
      return;
    }
    
    // 2단계 섹션의 원래 위치 저장
    const originalRect = step2Section.getBoundingClientRect();
    const originalParent = step2Section.parentElement;
    const originalStyle = {
      position: step2Section.style.position,
      top: step2Section.style.top,
      left: step2Section.style.left,
      width: step2Section.style.width,
      height: step2Section.style.height,
      margin: step2Section.style.margin,
      zIndex: step2Section.style.zIndex,
    };
    
    // 섹션을 절대 위치로 변경하고 원래 위치에 고정
    step2Section.style.position = 'fixed';
    step2Section.style.top = `${originalRect.top}px`;
    step2Section.style.left = `${originalRect.left}px`;
    step2Section.style.width = `${originalRect.width}px`;
    step2Section.style.height = `${originalRect.height}px`;
    step2Section.style.margin = '0';
    step2Section.style.zIndex = '1000';
    step2Section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // 원본 섹션을 숨김 (레이아웃 유지)
    const placeholder = document.createElement('div');
    placeholder.style.width = `${originalRect.width}px`;
    placeholder.style.height = `${originalRect.height}px`;
    placeholder.style.visibility = 'hidden';
    originalParent.insertBefore(placeholder, step2Section);
    
    // 오른쪽 영역의 위치 계산 (1단계 badge 아래)
    const existingBadge = drawingPanel.querySelector('.shape-success-badge');
    let targetTop = drawingPanel.getBoundingClientRect().top + 20;
    
    if (existingBadge) {
      const badgeRect = existingBadge.getBoundingClientRect();
      targetTop = badgeRect.bottom + 20;
    }
    
    const targetLeft = drawingPanel.getBoundingClientRect().left + (drawingPanel.getBoundingClientRect().width / 2) - (originalRect.width / 2);
    
    // 애니메이션 시작
    requestAnimationFrame(() => {
      step2Section.style.top = `${targetTop}px`;
      step2Section.style.left = `${targetLeft}px`;
      step2Section.style.transform = 'scale(0.9)';
      
      // 애니메이션 완료 후
      setTimeout(() => {
        // 원래 위치로 복원
        Object.keys(originalStyle).forEach(key => {
          step2Section.style[key] = originalStyle[key];
        });
        step2Section.style.transition = '';
        step2Section.style.transform = '';
        placeholder.remove();
        
        // 오른쪽 영역에 2단계 정답 badge 추가
        const step2Badge = document.createElement('div');
        step2Badge.className = 'shape-success-badge step2-badge';
        step2Badge.innerHTML = `
          <div class="shape-success-label">그래프의 꼭짓점의 좌표 : \\(${answerText}\\)</div>
        `;
        
        // 1단계 badge 다음에 추가
        if (existingBadge) {
          existingBadge.insertAdjacentElement('afterend', step2Badge);
        } else {
          // 1단계 badge가 없으면 h2 다음에 추가
          const h2Element = drawingPanel.querySelector('h2');
          if (h2Element) {
            h2Element.insertAdjacentElement('afterend', step2Badge);
          } else {
            drawingPanel.insertBefore(step2Badge, drawingPanel.firstChild);
          }
        }
        
        // MathJax 렌더링
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([step2Badge]).catch((err) => {
            console.error('MathJax 렌더링 오류:', err);
          });
        }
        
        callback();
      }, 800);
    });
  };
  
  // 3단계 정답을 오른쪽 영역으로 수집
  const addStep3Badge = (answerText) => {
    const drawingPanel = document.querySelector('.drawing-panel');
    if (!drawingPanel) return;
    
    const existing = drawingPanel.querySelector('.step3-badge');
    if (existing) {
      const answerEl = existing.querySelector('.step3-answer-text');
      if (answerEl) answerEl.textContent = answerText;
      return;
    }
    
    const badge = document.createElement('div');
    badge.className = 'shape-success-badge step3-badge';
    badge.innerHTML = `
      <div class="shape-success-label">그래프의 y절편 : ${answerText}</div>
    `;
    
    const clueList = drawingPanel.querySelector('#clue-list');
    if (clueList) {
      clueList.appendChild(badge);
    } else {
      drawingPanel.insertBefore(badge, drawingPanel.firstChild);
    }
  };

  // 3단계를 오른쪽 단서 영역으로 이동하는 애니메이션 함수 (로컬)
  const animateStep3ToRightLocal = (step3Section, answerText, callback) => {
    const drawingPanel = document.querySelector('.drawing-panel');
    if (!drawingPanel) {
      callback();
      return;
    }
    
    const clueList = drawingPanel.querySelector('#clue-list');
    const targetContainer = clueList || drawingPanel;
    
    const originalRect = step3Section.getBoundingClientRect();
    const originalParent = step3Section.parentElement;
    const originalStyle = {
      position: step3Section.style.position,
      top: step3Section.style.top,
      left: step3Section.style.left,
      width: step3Section.style.width,
      height: step3Section.style.height,
      margin: step3Section.style.margin,
      zIndex: step3Section.style.zIndex,
    };
    
    step3Section.style.position = 'fixed';
    step3Section.style.top = `${originalRect.top}px`;
    step3Section.style.left = `${originalRect.left}px`;
    step3Section.style.width = `${originalRect.width}px`;
    step3Section.style.height = `${originalRect.height}px`;
    step3Section.style.margin = '0';
    step3Section.style.zIndex = '1000';
    step3Section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    const placeholder = document.createElement('div');
    placeholder.style.width = `${originalRect.width}px`;
    placeholder.style.height = `${originalRect.height}px`;
    placeholder.style.visibility = 'hidden';
    originalParent.insertBefore(placeholder, step3Section);
    
    const targetRect = targetContainer.getBoundingClientRect();
    const targetTop = targetRect.top + 20;
    const targetLeft = targetRect.left + (targetRect.width / 2) - (originalRect.width / 2);
    
    requestAnimationFrame(() => {
      step3Section.style.top = `${targetTop}px`;
      step3Section.style.left = `${targetLeft}px`;
      step3Section.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        Object.keys(originalStyle).forEach(key => {
          step3Section.style[key] = originalStyle[key];
        });
        step3Section.style.transition = '';
        step3Section.style.transform = '';
        placeholder.remove();
        
        addStep3Badge(answerText);
        step3Section.remove();
        callback();
      }, 800);
    });
  };

  // 4단계 표시 함수 (그리기 도구/좌표평면 공개)
  const showStep4 = () => {
    const problemPanel = document.querySelector('.problem-panel');
    const contentGrid = document.querySelector('.content-two-columns');
    const drawingPanel = document.querySelector('.drawing-panel');
    const clueBoard = drawingPanel ? drawingPanel.querySelector('.clue-board') : null;
    
    if (problemPanel && !problemPanel.querySelector('.step4-section')) {
      const step4Section = document.createElement('div');
      step4Section.className = 'step3-section';
      step4Section.innerHTML = `
        <p class="step3-question">4단계. 이제 주어진 단서를 이용해 그래프를 그려봅시다.</p>
      `;
      problemPanel.appendChild(step4Section);
    }
    
    if (drawingPanel) {
      drawingPanel.classList.remove('locked');
      drawingPanel.classList.remove('embed-left');
      // 왼쪽 문제 패널 아래로 이동
      if (problemPanel && drawingPanel.parentElement !== problemPanel) {
        problemPanel.appendChild(drawingPanel);
      }
    }
    
    // 단서 보드를 오른쪽 전용 패널로 분리 (그리기 패널을 왼쪽으로 옮겨도 단서가 오른쪽에 남도록)
    if (contentGrid && clueBoard) {
      let cluePanel = document.querySelector('.clue-panel');
      if (!cluePanel) {
        cluePanel = document.createElement('section');
        cluePanel.className = 'card clue-panel';
        const header = document.createElement('h2');
        header.textContent = '그래프 단서 모음';
        cluePanel.appendChild(header);
        contentGrid.appendChild(cluePanel);
      }
      // clue-board를 오른쪽 패널로 이동
      cluePanel.appendChild(clueBoard);
    }
  };

  // 3단계 표시 함수
  const showStep3 = () => {
    const step2Section = document.querySelector('.step2-section');
    if (step2Section) {
      step2Section.style.display = 'none';
    }
    
    // 왼쪽 영역(problem-panel)에 3단계 표시
    const problemPanel = document.querySelector('.problem-panel');
    if (problemPanel && !problemPanel.querySelector('.step3-section')) {
      const problem = session?.generatedProblem;
      if (!problem) return;
      
      const step3Section = document.createElement('div');
      step3Section.className = 'step3-section';
      step3Section.innerHTML = `
        <p class="step3-question">3단계. 그래프가 y축과 만나는 점의 y좌표를 구해봅시다. (예: 3)</p>
        <div class="step3-input-section">
          <input type="text" id="step3-answer" class="step3-input" placeholder="예: 3" />
          <button id="step3-submit" class="btn primary step3-submit-btn" type="button">확인</button>
        </div>
      `;
      
      problemPanel.appendChild(step3Section);
      
      // MathJax 렌더링
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([step3Section]).catch((err) => {
          console.error('MathJax 렌더링 오류:', err);
        });
      }
      
      // 확인 버튼 이벤트
      const submitBtn = document.getElementById('step3-submit');
      const answerInput = document.getElementById('step3-answer');
      
      if (submitBtn && answerInput) {
        submitBtn.addEventListener('click', () => {
          const userAnswer = answerInput.value.trim();
          
          if (!userAnswer) {
            showModal(false, '답을 입력해주세요.', 'y축과 만나는 점의 좌표를 (0, ?) 형태로 입력해주세요.');
            return;
          }
          
          // 정답: y절편 값
          const correctY = problem.yIntercept;
          
          // 입력 정규화
          const userAnswerClean = userAnswer.replace(/\s+/g, '');
          
          // 허용 형식: 숫자만 입력 (예: 3, -2, +1) 또는 (0, 숫자)
          const numericOnly = /^([+-]?\d+)$/;
          const tuplePattern = /^\(0\s*,\s*([+-]?\d+)\)$/;
          
          let userY = null;
          if (numericOnly.test(userAnswerClean)) {
            userY = parseInt(userAnswerClean, 10);
          } else {
            const match = userAnswerClean.match(tuplePattern);
            if (match) {
              userY = parseInt(match[1], 10);
            }
          }
          
          if (userY === null) {
            showModal(false, '다시 생각해보세요.', 'y축과 만나는 점은 x좌표가 0입니다. y좌표만 입력하거나 (0, ?) 형태로 입력해주세요.');
            return;
          }
          
          const isCorrect = userY === problem.yIntercept;
          
          if (isCorrect) {
            const message = '잘했어요 👏';
            const explanation = `그래프가 y축과 만나는 점을 y절편이라고 합니다. y좌표는 \\(${problem.yIntercept}\\)입니다.`;
            const answerText = `(0, ${problem.yIntercept})`;
            
            const step3Section = document.querySelector('.step3-section');
            
            const afterAnimation = () => {
              showModal(true, message, explanation, () => {
                answerInput.disabled = true;
                submitBtn.disabled = true;
                showStep4();
              });
            };
            
            // 애니메이션을 먼저 실행 (2단계와 동일한 흐름)
            if (step3Section) {
              animateStep3ToRightLocal(step3Section, answerText, afterAnimation);
            } else {
              addStep3Badge(answerText);
              afterAnimation();
            }
          } else {
            showModal(false, '다시 생각해보세요.', 'y절편을 구하려면 주어진 식에 \\(x=0\\)을 대입해보세요.');
          }
        });
        
        // Enter 키로도 제출 가능
        answerInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            submitBtn.click();
          }
        });
      }
    }
  };
  
  const handleShapeClick = (selectedShape) => {
    const isCorrect = selectedShape === correctAnswer;
    const clickedButton = selectedShape === 'up' ? convexUpBtn : convexDownBtn;
    
    if (isCorrect) {
      const message = '잘하셨어요!';
      const explanation = '이차함수에서 최고차항의 계수가 양수이면 아래로 볼록이고, 음수이면 위로 볼록입니다.';
      
      // 왼쪽 문항 fade out
      const questionSection = document.querySelector('.shape-question-section');
      if (questionSection) {
        questionSection.style.transition = 'opacity 0.5s ease';
        questionSection.style.opacity = '0';
      }
      
      // 버튼을 오른쪽 영역으로 이동하는 애니메이션
      animateButtonToRight(clickedButton, () => {
        showModal(true, message, explanation, () => {
          showStep2();
        });
      });
    } else {
      // 문제 정보 가져오기
      let a;
      try {
        const problemDataStr = sessionStorage.getItem('generatedProblem');
        if (problemDataStr) {
          const problemData = JSON.parse(problemDataStr);
          a = problemData.a;
        } else {
          // session에서 직접 가져오기
          const session = loadSession();
          a = session?.generatedProblem?.a;
        }
      } catch (e) {
        console.error('문제 정보를 가져오는 중 오류:', e);
        // 기본값 사용
        a = problem?.a;
      }
      
      // a 값이 없으면 함수 내부의 problem 사용
      if (a === undefined) {
        a = problem?.a;
      }
      
      const message = '다시 생각해보세요.';
      const explanation = '최고차항의 계수가 양인가요, 음인가요? 그에 따라 어떤 모양이 나오는지 다시 한번 확인해볼까요?';
      
      showModal(false, message, explanation);
    }
  };
  
  // 2단계 표시 함수
  const showStep2 = () => {
    const questionSection = document.querySelector('.shape-question-section');
    if (questionSection) {
      questionSection.style.display = 'none';
    }
    
    // 왼쪽 영역(problem-panel)에 2단계 표시
    const problemPanel = document.querySelector('.problem-panel');
    if (problemPanel && !problemPanel.querySelector('.step2-section')) {
      const problem = session?.generatedProblem;
      if (!problem) return;
      
      const { a, h, k } = problem;
      // 최고차항 계수에 따라 부호 결정: +1이면 부호 없음, -1이면 -, 그 외는 + 또는 -
      let sign = '';
      if (a === -1) {
        sign = '-';
      } else if (a !== 1) {
        sign = a > 0 ? '+' : '-';
      }
      
      const step2Section = document.createElement('div');
      step2Section.className = 'step2-section';
      step2Section.innerHTML = `
        <p class="step2-question">2단계. 주어진 식을 완전 제곱식으로 표현하면 \\(y = ${sign}(x-a)^{2}+b\\)입니다. \\(a, b\\)에 들어갈 숫자를 찾아 \\((a, b)\\)와 같은 순서쌍 형태로 표현하세요.</p>
        <div class="step2-input-section">
          <input type="text" id="step2-answer" class="step2-input" placeholder="예: (1, 2)" />
          <button id="step2-submit" class="btn primary step2-submit-btn" type="button">확인</button>
        </div>
      `;
      
      problemPanel.appendChild(step2Section);
      
      // MathJax 렌더링
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([step2Section]).catch((err) => {
          console.error('MathJax 렌더링 오류:', err);
        });
      }
      
      
      // 확인 버튼 이벤트
      const submitBtn = document.getElementById('step2-submit');
      const answerInput = document.getElementById('step2-answer');
      
      if (submitBtn && answerInput) {
        submitBtn.addEventListener('click', () => {
          const userAnswer = answerInput.value.trim();
          const correctAnswer = `(${h}, ${k})`;
          
          // 정답 확인 (공백 무시, + 부호 허용)
          // + 부호를 제거하고 비교 (예: (+1, +2) → (1, 2), (+1, -2) → (1, -2))
          const normalizedUser = userAnswer.replace(/\s/g, '').replace(/\+/g, '');
          const normalizedCorrect = correctAnswer.replace(/\s/g, '').replace(/\+/g, '');
          
          if (normalizedUser === normalizedCorrect) {
            // 정답일 때
            const sign = a === -1 ? '-' : (a === 1 ? '' : (a > 0 ? '+' : '-'));
            const message = '잘했어요 👏';
            
            // 사용자가 입력한 정답 형식 그대로 사용 (원본 userAnswer에서 공백만 제거)
            const userAnswerClean = userAnswer.replace(/\s/g, '');
            
            // 완전제곱식 표기: h와 k가 음수일 때 -- 방지
            let completeSquareForm = '';
            
            // (x-h) 부분 처리: h가 음수면 (x+abs(h)), 양수면 (x-h)
            let hPart = '';
            if (h < 0) {
              hPart = `(x+${Math.abs(h)})`;
            } else {
              hPart = `(x-${h})`;
            }
            
            // +k 부분 처리: k가 음수면 -abs(k), 양수면 +k
            let kPart = '';
            if (k < 0) {
              kPart = `-${Math.abs(k)}`;
            } else {
              kPart = `+${k}`;
            }
            
            if (a === 1) {
              completeSquareForm = `y = ${hPart}^{2}${kPart}`;
            } else if (a === -1) {
              completeSquareForm = `y = -${hPart}^{2}${kPart}`;
            } else {
              completeSquareForm = `y = ${a}${hPart}^{2}${kPart}`;
            }
            
            const explanation = `주어진 식을 완전제곱식으로 고쳐 쓰면 \\(${completeSquareForm}\\) 과 같고, 이때 \\((a, b)\\)에 해당하는 것은 \\(${userAnswerClean}\\)입니다.`;
            
            // 2단계 입력 섹션을 오른쪽 영역으로 이동
            const step2Section = document.querySelector('.step2-section');
            if (step2Section) {
              animateStep2ToRight(step2Section, userAnswerClean, () => {
                showModal(true, message, explanation, () => {
                  showStep3();
                });
              });
            } else {
              showModal(true, message, explanation);
              answerInput.disabled = true;
              submitBtn.disabled = true;
            }
          } else {
            // 오답일 때 - 힌트 제공
            const message = '다시 생각해보세요.';
            
            // 전개된 식을 다시 계산
            const b = -2 * a * h;
            const c = a * h * h + k;
            
            let expandedExpression = '';
            if (a === 1) {
              expandedExpression = 'x^{2}';
            } else if (a === -1) {
              expandedExpression = '-x^{2}';
            } else {
              expandedExpression = `${a}x^{2}`;
            }
            
            if (b > 0) {
              expandedExpression += ` + ${b}x`;
            } else if (b < 0) {
              expandedExpression += ` - ${Math.abs(b)}x`;
            }
            
            if (c > 0) {
              expandedExpression += ` + ${c}`;
            } else if (c < 0) {
              expandedExpression += ` - ${Math.abs(c)}`;
            }
            
            // 완전제곱식 표기: a 값에 따라 부호 결정
            let hintSign = '';
            if (a === -1) {
              hintSign = '-';
            } else if (a === 1) {
              hintSign = ''; // +1일 때는 부호 없음
            } else {
              hintSign = a > 0 ? '+' : '-';
            }
            
            const explanation = `완전제곱식 \\(y = ${hintSign}(x-a)^{2}+b\\) 형태로 고쳐써야 합니다. 완전제곱식으로 만드는 것이 어렵다면, 위의 식을 전개하여 원래의 식과 비교해보세요.`;
            
            showModal(false, message, explanation);
          }
        });
        
        // Enter 키로도 제출 가능
        answerInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            submitBtn.click();
          }
        });
      }
    }
  };
  
  // 버튼 클릭 이벤트 (내부 요소 클릭도 처리)
  const handleUpClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleShapeClick('up');
  };
  
  const handleDownClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleShapeClick('down');
  };
  
  convexUpBtn.addEventListener('click', handleUpClick);
  convexDownBtn.addEventListener('click', handleDownClick);
  
  // 내부 요소 클릭도 버튼 클릭으로 처리
  const upContent = convexUpBtn.querySelector('.shape-btn-content');
  const downContent = convexDownBtn.querySelector('.shape-btn-content');
  
  if (upContent) {
    upContent.addEventListener('click', handleUpClick);
  }
  
  if (downContent) {
    downContent.addEventListener('click', handleDownClick);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const session = loadSession();
  initProblemPanel(session);
  initCanvas();
  initSubmitForm(session);
  initShapeButtons(session);
  
  // 4단계 이전에는 그리기 도구/좌표평면을 잠금
  const drawingPanel = document.querySelector('.drawing-panel');
  if (drawingPanel) {
    drawingPanel.classList.add('locked');
  }
  
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


