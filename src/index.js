// index.js - 메인 페이지(학생 정보 + 문제 선택) 로직

// 사용 가능한 문제 목록
const PROBLEM_IDS = ['free-fall', 'inclined-plane', 'air-resistance', 'spring-oscillation'];

/**
 * 랜덤으로 문제를 선택하여 반환
 */
function getRandomProblem() {
  const randomIndex = Math.floor(Math.random() * PROBLEM_IDS.length);
  return PROBLEM_IDS[randomIndex];
}

/**
 * 학생 정보를 입력받고 랜덤 문제를 생성하여
 * localStorage에 저장하고 학생 페이지로 이동한다.
 */
function handleStudentFormSubmit(event) {
  event.preventDefault();

  const studentIdInput = document.getElementById('student-id');
  const studentNameInput = document.getElementById('student-name');

  if (!studentIdInput || !studentNameInput) {
    console.error('필수 입력 요소를 찾을 수 없습니다.');
    return;
  }

  const studentId = studentIdInput.value.trim();
  const studentName = studentNameInput.value.trim();

  if (!studentId || !studentName) {
    alert('학번과 이름을 모두 입력해 주세요.');
    return;
  }

  // 랜덤으로 문제 선택
  const problemId = getRandomProblem();

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





