// admin.js - 교사용 모니터링 페이지 로직

const PROBLEM_LABELS = {
  'free-fall': '자유낙하하는 물체',
  'inclined-plane': '빗면을 따라 내려오는 물체',
  'air-resistance': '공기저항을 받으며 낙하하는 물체',
  'spring-oscillation': '용수철에 매달려 연직으로 진동하는 물체',
};

function loadSubmissions() {
  const raw = localStorage.getItem('fbd-submissions');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('제출 데이터를 파싱하는 데 실패했습니다.', e);
    return [];
  }
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

function renderSubmissionsList() {
  const tbody = document.getElementById('submissions-table-body');
  const emptyText = document.getElementById('no-submissions');
  if (!tbody || !emptyText) return [];

  const submissions = loadSubmissions().sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  tbody.innerHTML = '';

  if (submissions.length === 0) {
    emptyText.style.display = 'block';
    return [];
  }

  emptyText.style.display = 'none';

  submissions.forEach((sub, index) => {
    const tr = document.createElement('tr');
    tr.dataset.submissionId = sub.id;
    tr.innerHTML = `
      <td>${formatDate(sub.submittedAt)}</td>
      <td>${sub.studentId}</td>
      <td>${sub.studentName}</td>
      <td>${PROBLEM_LABELS[sub.problemId] || sub.problemLabel || sub.problemId}</td>
    `;
    tr.addEventListener('click', () => {
      renderSubmissionDetail(sub);
      // 선택 표시
      tbody.querySelectorAll('tr').forEach((row) => row.classList.remove('selected'));
      tr.classList.add('selected');
    });
    if (index === 0) {
      tr.classList.add('selected');
    }
    tbody.appendChild(tr);
  });

  // 첫 번째 제출 자동 선택
  if (submissions[0]) {
    renderSubmissionDetail(submissions[0]);
  }

  return submissions;
}

function renderSubmissionDetail(submission) {
  const container = document.getElementById('submission-detail');
  if (!container) return;

  if (!submission) {
    container.innerHTML = '<p class="empty-text">제출 정보를 찾을 수 없습니다.</p>';
    return;
  }

  const feedback = submission.gptFeedback || {};

  container.innerHTML = `
    <div class="detail-section">
      <h3>학생 정보</h3>
      <p><strong>학번:</strong> ${submission.studentId}</p>
      <p><strong>이름:</strong> ${submission.studentName}</p>
      <p><strong>문제:</strong> ${
        PROBLEM_LABELS[submission.problemId] || submission.problemLabel || submission.problemId
      }</p>
      <p><strong>제출 시각:</strong> ${formatDate(submission.submittedAt)}</p>
    </div>

    <div class="detail-section">
      <h3>학생 답안</h3>
      <div class="detail-canvas-preview">
        ${
          submission.imageDataUrl
            ? `<img src="${submission.imageDataUrl}" alt="학생 자유물체도" />`
            : '<p class="empty-text">저장된 그림이 없습니다.</p>'
        }
      </div>
      <p><strong>보충 설명:</strong></p>
      <p class="detail-description">${submission.description || '(보충 설명 없음)'}</p>
    </div>

    <div class="detail-section">
      <h3>AI 피드백</h3>
      ${
        feedback && (feedback.score || feedback.feedback)
          ? `
            <p><strong>점수:</strong> ${feedback.score ?? '-'} / ${feedback.maxScore ?? '-'}</p>
            <p class="detail-feedback">${feedback.feedback || '(피드백 없음)'}</p>
          `
          : '<p class="empty-text">저장된 AI 피드백이 없습니다.</p>'
      }
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.getElementById('refresh-submissions');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      renderSubmissionsList();
    });
  }

  renderSubmissionsList();
});





