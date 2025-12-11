// index.js - 메인 페이지(학생 정보 + 문제 선택) 로직

/**
 * 선택된 학생 정보와 문제를 localStorage에 저장하고
 * 학생 페이지로 이동한다.
 */
function handleStudentFormSubmit(event) {
  event.preventDefault();

  const studentIdInput = document.getElementById('student-id');
  const studentNameInput = document.getElementById('student-name');
  const problemSelect = document.getElementById('problem-select');

  if (!studentIdInput || !studentNameInput || !problemSelect) {
    console.error('필수 입력 요소를 찾을 수 없습니다.');
    return;
  }

  const studentId = studentIdInput.value.trim();
  const studentName = studentNameInput.value.trim();
  const problemId = problemSelect.value;

  if (!studentId || !studentName || !problemId) {
    alert('학번, 이름, 문제를 모두 입력/선택해 주세요.');
    return;
  }

  const sessionData = {
    studentId,
    studentName,
    problemId,
    startedAt: new Date().toISOString(),
  };

  // 학생용 세션 정보 저장
  localStorage.setItem('fbd-current-session', JSON.stringify(sessionData));

  // 학생 페이지로 이동
  window.location.href = './student.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('student-form');
  if (form) {
    form.addEventListener('submit', handleStudentFormSubmit);
  }
});





