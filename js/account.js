// 가계부 관련 기능들

// 가계부 데이터
let budgetData = [];
let filteredData = [];
let currentFilter = 'all';
let editingIndex = -1;

// 가계부 초기화
function initAccount() {
  console.log('가계부 시스템 초기화');
  
  // 폼 이벤트 리스너 설정
  setupFormEventListeners();
  
  // 테이블 이벤트 리스너 설정
  setupTableEventListeners();
  
  // 데이터 로드
  loadBudgetData();
  
  // 통계 업데이트
  updateStatistics();
}

// 폼 이벤트 리스너 설정
function setupFormEventListeners() {
  const form = getElement('expenseForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  // 날짜 기본값 설정
  const dateInput = getElement('expenseDate');
  if (dateInput) {
    dateInput.value = formatDate(new Date());
  }
  
  // 금액 입력 시 포맷팅
  const amountInput = getElement('expenseAmount');
  if (amountInput) {
    amountInput.addEventListener('input', formatAmountInput);
  }
}

// 테이블 이벤트 리스너 설정
function setupTableEventListeners() {
  const tableBody = getElement('budgetTableBody');
  if (tableBody) {
    // 테이블 클릭 이벤트 (편집용)
    tableBody.addEventListener('click', handleTableClick);
  }
}

// 폼 제출 처리
function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = {
    date: getElement('expenseDate').value,
    category: getElement('expenseCategory').value,
    description: getElement('expenseDescription').value,
    payment: getElement('expensePayment').value,
    amount: parseFloat(getElement('expenseAmount').value),
    currency: getElement('expenseCurrency').value,
    timestamp: new Date().toISOString()
  };
  
  // 유효성 검사
  if (!validateExpenseData(formData)) {
    return;
  }
  
  if (editingIndex >= 0) {
    // 편집 모드
    budgetData[editingIndex] = formData;
    editingIndex = -1;
    showNotification('지출 내역을 수정했습니다.', 'success');
  } else {
    // 추가 모드
    budgetData.push(formData);
    showNotification('지출 내역을 추가했습니다.', 'success');
  }
  
  // 데이터 저장
  saveBudgetData();
  
  // 테이블 업데이트
  updateBudgetTable();
  
  // 통계 업데이트
  updateStatistics();
  
  // 폼 초기화
  resetForm();
  
  // 모달 닫기
  closeExpenseModal();
}

// 지출 데이터 유효성 검사
function validateExpenseData(data) {
  if (!data.date) {
    showNotification('날짜를 선택해주세요.', 'error');
    return false;
  }
  
  if (!data.category) {
    showNotification('항목을 선택해주세요.', 'error');
    return false;
  }
  
  if (!data.description.trim()) {
    showNotification('내용을 입력해주세요.', 'error');
    return false;
  }
  
  if (!data.payment) {
    showNotification('결제방법을 선택해주세요.', 'error');
    return false;
  }
  
  if (!data.amount || data.amount <= 0) {
    showNotification('올바른 금액을 입력해주세요.', 'error');
    return false;
  }
  
  return true;
}

// 테이블 클릭 처리
function handleTableClick(event) {
  const row = event.target.closest('tr');
  if (!row) return;
  
  const index = parseInt(row.dataset.index);
  if (isNaN(index)) return;
  
  // 편집 모드로 전환
  editExpense(index);
}

// 지출 편집
function editExpense(index) {
  if (index < 0 || index >= budgetData.length) return;
  
  const expense = budgetData[index];
  editingIndex = index;
  
  // 폼에 데이터 채우기
  getElement('expenseDate').value = expense.date;
  getElement('expenseCategory').value = expense.category;
  getElement('expenseDescription').value = expense.description;
  getElement('expensePayment').value = expense.payment;
  getElement('expenseAmount').value = expense.amount;
  getElement('expenseCurrency').value = expense.currency;
  
  // 모달 제목 변경
  const modalTitle = getElement('modalTitle');
  if (modalTitle) {
    modalTitle.textContent = '지출 편집';
  }
  
  // 모달 열기
  openExpenseModal();
}

// 지출 삭제
function deleteExpense(index) {
  if (index < 0 || index >= budgetData.length) return;
  
  if (confirm('정말로 이 지출 내역을 삭제하시겠습니까?')) {
    budgetData.splice(index, 1);
    saveBudgetData();
    updateBudgetTable();
    updateStatistics();
    showNotification('지출 내역을 삭제했습니다.', 'success');
  }
}

// 데이터 필터링
function filterData(category) {
  currentFilter = category;
  
  // 필터 버튼 상태 업데이트
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === getCategoryName(category)) {
      btn.classList.add('active');
    }
  });
  
  // 데이터 필터링
  if (category === 'all') {
    filteredData = [...budgetData];
  } else {
    filteredData = budgetData.filter(item => item.category === category);
  }
  
  // 테이블 업데이트
  updateBudgetTable();
}

// 카테고리 이름 가져오기
function getCategoryName(category) {
  const names = {
    'all': '전체',
    'transportation': '교통',
    'accommodation': '숙박',
    'food': '식사',
    'shopping': '쇼핑',
    'activity': '활동',
    'other': '기타'
  };
  return names[category] || category;
}

// 테이블 업데이트
function updateBudgetTable() {
  const tableBody = getElement('budgetTableBody');
  const noData = getElement('noData');
  
  if (!tableBody) return;
  
  // 테이블 내용 초기화
  tableBody.innerHTML = '';
  
  if (filteredData.length === 0) {
    if (noData) {
      noData.style.display = 'block';
    }
    return;
  }
  
  if (noData) {
    noData.style.display = 'none';
  }
  
  // 데이터를 날짜순으로 정렬 (최신순)
  const sortedData = [...filteredData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 테이블 행 생성
  sortedData.forEach((expense, index) => {
    const row = createExpenseRow(expense, index);
    tableBody.appendChild(row);
  });
}

// 지출 행 생성
function createExpenseRow(expense, index) {
  const row = document.createElement('tr');
  row.dataset.index = index;
  
  // 날짜 셀
  const dateCell = document.createElement('td');
  dateCell.className = 'date-cell';
  dateCell.textContent = formatDate(new Date(expense.date));
  
  // 항목 셀
  const categoryCell = document.createElement('td');
  categoryCell.className = 'editable-cell';
  categoryCell.textContent = getCategoryName(expense.category);
  categoryCell.onclick = () => editExpense(index);
  
  // 내용 셀
  const descriptionCell = document.createElement('td');
  descriptionCell.className = 'content-cell editable-cell';
  descriptionCell.textContent = expense.description;
  descriptionCell.onclick = () => editExpense(index);
  
  // 결제방법 셀
  const paymentCell = document.createElement('td');
  paymentCell.className = 'editable-cell';
  const paymentBadge = document.createElement('span');
  paymentBadge.className = `payment-badge payment-${expense.payment}`;
  paymentBadge.textContent = expense.payment === 'card' ? '카드' : '현금';
  paymentCell.appendChild(paymentBadge);
  paymentCell.onclick = () => editExpense(index);
  
  // 금액 셀
  const amountCell = document.createElement('td');
  amountCell.className = `amount-cell amount-${expense.currency.toLowerCase()}`;
  amountCell.textContent = formatCurrency(expense.amount, expense.currency);
  
  // 삭제 버튼 셀
  const deleteCell = document.createElement('td');
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '삭제';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteExpense(index);
  };
  deleteCell.appendChild(deleteBtn);
  
  // 행에 셀들 추가
  row.appendChild(dateCell);
  row.appendChild(categoryCell);
  row.appendChild(descriptionCell);
  row.appendChild(paymentCell);
  row.appendChild(amountCell);
  row.appendChild(deleteCell);
  
  return row;
}

// 통계 업데이트
function updateStatistics() {
  const stats = calculateStatistics();
  updateStatsDisplay(stats);
}

// 통계 계산
function calculateStatistics() {
  const stats = {
    totalExpenses: 0,
    totalByCategory: {},
    totalByCurrency: {},
    averageDaily: 0,
    totalDays: 0
  };
  
  if (budgetData.length === 0) {
    return stats;
  }
  
  // 날짜 범위 계산
  const dates = budgetData.map(item => new Date(item.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  stats.totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // 통계 계산
  budgetData.forEach(expense => {
    // 카테고리별 합계
    if (!stats.totalByCategory[expense.category]) {
      stats.totalByCategory[expense.category] = 0;
    }
    stats.totalByCategory[expense.category] += expense.amount;
    
    // 통화별 합계
    if (!stats.totalByCurrency[expense.currency]) {
      stats.totalByCurrency[expense.currency] = 0;
    }
    stats.totalByCurrency[expense.currency] += expense.amount;
    
    // 전체 합계 (KRW 기준으로 환산)
    if (expense.currency === 'JPY') {
      // 1 JPY = 8.5 KRW (예시 환율)
      stats.totalExpenses += expense.amount * 8.5;
    } else {
      stats.totalExpenses += expense.amount;
    }
  });
  
  // 일평균 계산
  stats.averageDaily = stats.totalDays > 0 ? stats.totalExpenses / stats.totalDays : 0;
  
  return stats;
}

// 통계 표시 업데이트
function updateStatsDisplay(stats) {
  const statsGrid = getElement('statsGrid');
  if (!statsGrid) return;
  
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="emoji">💰</div>
      <h3>총 지출</h3>
      <div class="amount">${formatCurrency(stats.totalExpenses, 'KRW')}</div>
    </div>
    <div class="stat-card">
      <div class="emoji">📅</div>
      <h3>여행 일수</h3>
      <div class="amount">${stats.totalDays}일</div>
    </div>
    <div class="stat-card">
      <div class="emoji">📊</div>
      <h3>일평균</h3>
      <div class="amount">${formatCurrency(stats.averageDaily, 'KRW')}</div>
    </div>
  `;
}

// 모달 관련 함수들
function openExpenseModal() {
  const modal = getElement('expenseModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeExpenseModal() {
  const modal = getElement('expenseModal');
  if (modal) {
    modal.style.display = 'none';
  }
  resetForm();
  editingIndex = -1;
}

function openStatsModal() {
  const modal = getElement('statsModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeStatsModal() {
  const modal = getElement('statsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 폼 초기화
function resetForm() {
  const form = getElement('expenseForm');
  if (form) {
    form.reset();
    getElement('expenseDate').value = formatDate(new Date());
  }
  
  const modalTitle = getElement('modalTitle');
  if (modalTitle) {
    modalTitle.textContent = '지출 추가';
  }
}

// 금액 입력 포맷팅
function formatAmountInput(event) {
  const input = event.target;
  let value = input.value.replace(/[^0-9.]/g, '');
  
  // 소수점이 여러 개 있는 경우 제거
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  input.value = value;
}

// 데이터 저장
function saveBudgetData() {
  saveToLocalStorage('budgetData', budgetData);
}

// 데이터 로드
function loadBudgetData() {
  const savedData = loadFromLocalStorage('budgetData');
  if (savedData) {
    budgetData = savedData;
    filteredData = [...budgetData];
    updateBudgetTable();
    updateStatistics();
  }
}

// CSV 내보내기
function exportToCSV() {
  if (budgetData.length === 0) {
    showNotification('내보낼 데이터가 없습니다.', 'error');
    return;
  }
  
  const headers = ['날짜', '항목', '내용', '결제방법', '금액', '통화'];
  const csvData = budgetData.map(expense => ({
    '날짜': expense.date,
    '항목': getCategoryName(expense.category),
    '내용': expense.description,
    '결제방법': expense.payment === 'card' ? '카드' : '현금',
    '금액': expense.amount,
    '통화': expense.currency
  }));
  
  const csvContent = createCSV(csvData, headers);
  const filename = `홋카이도_여행_가계부_${formatDate(new Date())}.csv`;
  
  downloadFile(csvContent, filename, 'text/csv');
  showNotification('CSV 파일을 다운로드했습니다.', 'success');
}

// Firebase 관련 함수들
function initFirebase() {
  console.log('Firebase 가계부 모듈 초기화');
  
  if (window.firebase && window.firebase.db) {
    // Firebase 데이터 동기화
    syncWithFirebase();
  }
}

function syncWithFirebase() {
  if (!window.firebase || !window.firebase.db) return;
  
  // Firebase에서 데이터 로드
  loadBudgetDataFromFirebase();
}

function loadBudgetDataFromFirebase() {
  if (!window.firebase || !window.firebase.db) return;
  
  // Firebase 로드 로직 구현
  console.log('Firebase에서 가계부 데이터 로드');
}

function saveBudgetDataToFirebase() {
  if (!window.firebase || !window.firebase.db) return;
  
  // Firebase 저장 로직 구현
  console.log('Firebase에 가계부 데이터 저장');
}

// 전역으로 내보내기
window.AccountModule = {
  initAccount,
  loadBudgetData,
  saveBudgetData,
  filterData,
  updateBudgetTable,
  updateStatistics,
  openExpenseModal,
  closeExpenseModal,
  openStatsModal,
  closeStatsModal,
  editExpense,
  deleteExpense,
  exportToCSV,
  initFirebase,
  syncWithFirebase,
  loadBudgetDataFromFirebase,
  saveBudgetDataToFirebase
};
