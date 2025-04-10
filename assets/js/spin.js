let eventData = {};
let prizes = [];
let participants = [];
let winners = [];
let currentPrize = null;
let currentTurn = null;
let isSpinning = false;
let tempSelectedCode = [];
let randomCodes = [];
let spinHistory = JSON.parse(localStorage.getItem('spinHistory')) || [];
let currentHistoryPage = 1;
const historyPerPage = 10; 
const EVENT_ID_KEY = "currentEventId";
const STORAGE_KEY_PREFIX = "event_";

document.addEventListener("DOMContentLoaded", function () {
  loadEventData();
  setupEventListeners();
  loadSpinHistory();
});
document.getElementById('historyPagination').addEventListener('click', function (e) {
  e.preventDefault();
  const target = e.target.closest('.page-link');
  if (target) {
      const page = parseInt(target.getAttribute('data-page'));
      if (page && page !== currentHistoryPage) {
          currentHistoryPage = page;
          loadSpinHistory();
      }
  }
});
function loadEventData() {
  const eventId = localStorage.getItem(EVENT_ID_KEY);
  if (!eventId) {
    showToast("Không tìm thấy thông tin sự kiện", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
    return;
  }
  winners = JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];

}
// Lưu lịch sử quay vào localStorage


function saveSpinHistory(number, prize, turn) {
  const timestamp = new Date().toLocaleString('vi-VN');
  spinHistory.push({ number: number, prize: prize, turn: turn, timestamp: timestamp });
  localStorage.setItem('spinHistory', JSON.stringify(spinHistory));
  loadSpinHistory(); // Cập nhật bảng lịch sử
}

function loadSpinHistory() {
  const tableBody = document.getElementById('historyTableBody');
  const emptyState = document.getElementById('historyEmptyState');

  if (spinHistory.length === 0) {
    emptyState.style.display = 'block';
    tableBody.innerHTML = '';
    document.querySelector('.pagination-info').textContent = '';
    document.getElementById('historyPagination').innerHTML = '';
    return;
}

  emptyState.style.display = 'none';
  tableBody.innerHTML = '';

  // Tính toán các bản ghi cần hiển thị trên trang hiện tại
  const start = (currentHistoryPage - 1) * historyPerPage;
  const end = start + historyPerPage;
  const historyToShow = spinHistory.slice(start, end);

  // Hiển thị các bản ghi trên trang hiện tại
  historyToShow.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${start + index + 1}</td>
          <td>${entry.prize}</td>
          <td>${entry.turn}</td>
          <td>${entry.number}</td>
          <td>${entry.timestamp}</td>
      `;
      tableBody.appendChild(row);
  });

  // Hiển thị phân trang
  renderHistoryPagination(spinHistory.length, historyPerPage);
}
/**
 * Chọn giải thưởng và lượt quay
 */

/**
 * Tạo dropdown lần quay
 * */
function populateTurnSelect(prizeIndex) {
  const turnSelect = document.getElementById("turnSelect");
  turnSelect.innerHTML =
    '<option value="" selected disabled>Chọn lần quay</option>';

  if (prizeIndex === null || prizeIndex === undefined) return;

  const prize = prizes[prizeIndex];
  const totalTurns = prize.turns || 1;
  const eventId = localStorage.getItem(EVENT_ID_KEY);

  const eventWinners =
    JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];

  const completedTurns = eventWinners
    .filter((winner) => winner.prizeIndex == prizeIndex)
    .map((winner) => winner.turn);

  const uniqueCompletedTurns = [...new Set(completedTurns)];

  let hasAvailableTurns = false;

  for (let i = 1; i <= totalTurns; i++) {
    if (!uniqueCompletedTurns.includes(i)) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Lần ${i}`;
      turnSelect.appendChild(option);
      hasAvailableTurns = true;
    }
  }

  if (!hasAvailableTurns) {
    showToast("Đã quay đủ số lần cho giải này", "info");
  }

  turnSelect.disabled = !hasAvailableTurns;
  document.getElementById("spinBtn").disabled = true;
}

function setupEventListeners() {
  const prizeSelect = document.getElementById("prizeSelect");
  const turnSelect = document.getElementById("turnSelect");
  const spinBtn = document.getElementById("spinBtn");
  const spinAgainBtn = document.getElementById("spinAgainBtn");
  const saveWinnersBtn = document.getElementById("saveWinnersBtn");
  const confirmSpinAgainBtn = document.getElementById("confirmSpinAgainBtn");

  // prizeSelect.addEventListener("change", function () {
  //   const prizeIndex = parseInt(this.value);
  //   currentPrize = prizes[prizeIndex];
  //   currentTurn = null;

  //   document.getElementById("currentPrize").textContent = currentPrize.name;
  //   document.getElementById("currentTurn").textContent = "";

  //   populateTurnSelect(prizeIndex);
  //   spinBtn.disabled = true;
  //   spinAgainBtn.style.display = "none";
  // });

  // turnSelect.addEventListener("change", function () {
  //   currentTurn = parseInt(this.value);
  //   document.getElementById(
  //     "currentTurn"
  //   ).textContent = `Lần quay: ${currentTurn}`;
  //   spinBtn.disabled = false;
  //   spinAgainBtn.style.display = "none";
  // });

  spinBtn.addEventListener("click", startSpin);
  // spinAgainBtn.addEventListener("click", function () {
  //   const confirmModal = new bootstrap.Modal(
  //     document.getElementById("confirmModal")
  //   );
  //   confirmModal.show();
  // });

  // confirmSpinAgainBtn.addEventListener("click", function () {
  //   const confirmModal = bootstrap.Modal.getInstance(
  //     document.getElementById("confirmModal")
  //   );
  //   confirmModal.hide();
  //   startSpin();
  // });

  // saveWinnersBtn.addEventListener("click", function () {
  //   if (tempSelectedWinners.length > 0) {
  //     savePermanentWinners(tempSelectedWinners);
  //     const winnerModal = bootstrap.Modal.getInstance(
  //       document.getElementById("winnerModal")
  //     );
  //     winnerModal.hide();
  //     showToast("Đã lưu kết quả quay thành công!", "success");
  //   }
  // });

  document
    .getElementById("winnerModal")
    .addEventListener("hidden.bs.modal", function () {
      if (tempSelectedWinners.length > 0) {
        spinBtn.disabled = true;
        spinAgainBtn.style.display = "inline-block";
      }
    });
}

/**
 * Bắt đầu quay số
 * Kiểm tra người tham gia khả dụng
 * Kích hoạt animation các chữ số
 * */
function startSpin() {
  if (isSpinning) return;

  isSpinning = true;
  const spinBtn = document.getElementById("spinBtn");
  const spinAgainBtn = document.getElementById("spinAgainBtn");
  // Lấy giá trị từ dropdown
  const selectedPrize = document.getElementById("prizeSelect").value;
  const selectedTurn = document.getElementById("turnSelect").value;

  spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2 spinning-icon"></i>Đang quay...';
  spinBtn.disabled = true;
  // spinAgainBtn.style.display = "none";

  tempSelectedWinners = [];

  const digitElements = [
      document.getElementById("digit1"),
      document.getElementById("digit2"),
      document.getElementById("digit3"),
      document.getElementById("digit4"),
      document.getElementById("digit5"),
  ];

  // Tạo số ngẫu nhiên 5 chữ số (00000-99999)
  const finalNumber = Math.floor(Math.random() * 100000);
  const finalDigits = String(finalNumber).padStart(5, '0').split('').map(Number);

  // Bắt đầu animation cho các ô số
  digitElements.forEach((digit) => {
      digit.textContent = "0";
      startDigitAnimation(digit); // Bắt đầu lật số
  });

  const spinDuration = 3000 + Math.random() * 2000; // Thời gian quay (3-5 giây)
  const spinsPerDigit = 20; // Số lần lật mỗi ô số
  let currentSpin = 0;

  // Quay số ngẫu nhiên
  const spinInterval = setInterval(() => {
      digitElements.forEach((digit) => {
          const randomDigit = Math.floor(Math.random() * 10);
          digit.textContent = randomDigit;
          // Không cần gọi lại startDigitAnimation vì nó đã chạy liên tục
      });

      currentSpin++;

      if (currentSpin >= spinsPerDigit) {
          clearInterval(spinInterval);
          // Dừng tất cả animation và hiển thị số cuối cùng
          setTimeout(() => {
              digitElements.forEach((digit, index) => {
                  stopDigitAnimation(digit); // Dừng animation lật số
                  digit.textContent = finalDigits[index]; // Hiển thị số cuối cùng
              });
              isSpinning = false;
              spinBtn.innerHTML = '<span>🎲</span> BẮT ĐẦU QUAY';
              spinBtn.disabled = false;
              // Lưu số vừa quay vào lịch sử
              const finalNumberString = finalDigits.join('');
              saveSpinHistory(finalNumberString, selectedPrize, selectedTurn);
          }, 200); // Delay nhỏ để hiệu ứng lật cuối cùng hoàn thành
      }
  }, spinDuration / spinsPerDigit);
}

/**
 * Tạo hiệu ứng chạy số
 */
function startDigitAnimation(digitElement) {
  let counter = 0;
  digitElement.animationInterval = setInterval(() => {
    counter = (counter + 1) % 10;
    digitElement.textContent = counter;
  }, 50);
}

function stopDigitAnimation(digitElement) {
  clearInterval(digitElement.animationInterval);
}

function generateRandomCodes(count = 1) {
  const codes = new Set();
  while (codes.size < count) {
    const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
    codes.add(randomCode);
  }
  return Array.from(codes);
}

/**
 * Kết thúc quay số
 * Chọn ngẫu nhiên người trúng giải
 */
function endSpin(winnersCount) {
  const randomNumbers = generateRandomCodes(winnersCount);
  const selectedWinners = randomNumbers.map((number) => ({
    code: number,
    name: `Số trúng thưởng ${number}`,
  }));

  tempSelectedWinners = selectedWinners;

  const firstWinner = selectedWinners[0];
  const winnerCode = firstWinner.code;
  const codeDigits = winnerCode.split("");

  const digitElements = [
    document.getElementById("digit1"),
    document.getElementById("digit2"),
    document.getElementById("digit3"),
    document.getElementById("digit4"),
    document.getElementById("digit5"),
  ];

  const prizeIndex = parseInt(document.getElementById("prizeSelect").value);
  const currentPrize = prizes[prizeIndex];

  // Nếu giải chỉ có 1 lần quay
  if (currentPrize.turns === 1) {
    let currentDigitIndex = 0;
    const winnerCode = selectedWinners[0].code;
    const codeDigits = winnerCode.split("");

    function revealNextDigit() {
      if (currentDigitIndex < digitElements.length) {
        const digit = digitElements[currentDigitIndex];
        stopDigitAnimation(digit);
        digit.textContent = codeDigits[currentDigitIndex];
        playTickSound();

        currentDigitIndex++;
        if (currentDigitIndex < digitElements.length) {
          setTimeout(revealNextDigit, 800);
        } else {
          setTimeout(() => {
            displayWinnersTable(selectedWinners);
            isSpinning = false;
            updateSpinButtonState();
          }, 500);
        }
      }
    }
    revealNextDigit();
  }
  // Nếu giải có nhiều lần quay
  else {
    for (let i = 0; i < digitElements.length; i++) {
      setTimeout(() => {
        stopDigitAnimation(digitElements[i]);
        digitElements[i].textContent = codeDigits[i] || "0";
        playTickSound();

        if (i === digitElements.length - 1) {
          setTimeout(() => {
            displayWinnersTable(selectedWinners);
            isSpinning = false;
            updateSpinButtonState();
          }, 500);
        }
      }, i * 300);
    }
  }
}

/**
 * Hiển thị danh sách người trúng giải
 */
function displayWinnersTable(winners) {
  const spinBtn = document.getElementById("spinBtn");
  spinBtn.disabled = false;
  spinBtn.innerHTML = '<i class="fas fa-random me-2"></i>Bắt đầu quay';

  if (winners.length > 1) {
    document.getElementById(
      "winnerModalLabel"
    ).textContent = `Chúc mừng ${winners.length} người trúng giải!`;
  } else {
    document.getElementById("winnerModalLabel").textContent =
      "Chúc mừng người trúng giải!";
  }

  const tableBody = document.getElementById("winnersTableBody");
  tableBody.innerHTML = "";

  winners.forEach((winner, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${winner.code}</td>
                    <td>${winner.name}</td>
                      <td>${new Date().toLocaleTimeString()}</td> 
                `;
    tableBody.appendChild(row);
  });

  const winnerModal = new bootstrap.Modal(
    document.getElementById("winnerModal")
  );

  winnerModal.show();

  playConfettiEffect();
}

/**
 * Lưu danh sách người trúng giải vào localStorage
 * Cập nhật trạng thái giải thưởng
 * */
function savePermanentWinners(winnersList) {
  const prizeIndex = parseInt(document.getElementById("prizeSelect").value);
  const eventId = localStorage.getItem(EVENT_ID_KEY);
  const currentDate = new Date().toLocaleDateString();

  let eventWinners =
    JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];
  let eventPrizes = JSON.parse(localStorage.getItem(`prizes_${eventId}`)) || [];

  winnersList.forEach((winner) => {
    const newWinner = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: currentDate,
      prize: prizes[prizeIndex].name,
      prizeIndex: prizeIndex,
      turn: currentTurn,
      name: winner.name,
      code: winner.code,
    };

    eventWinners.push(newWinner);
  });

  localStorage.setItem(`winners_${eventId}`, JSON.stringify(eventWinners));
  winners = eventWinners;

  const prize = eventPrizes[prizeIndex];
  const uniqueCompletedTurns = new Set(
    eventWinners.filter((w) => w.prizeIndex == prizeIndex).map((w) => w.turn)
  );
  const remainingTurns = prize.turns - uniqueCompletedTurns.size;

  prize.remainingTurns = remainingTurns;

  if (remainingTurns <= 0) {
    prize.status = "Đã quay";
  }

  eventPrizes[prizeIndex] = prize;
  localStorage.setItem(`prizes_${eventId}`, JSON.stringify(eventPrizes));
  prizes = eventPrizes;

  tempSelectedWinners = [];

  populateTurnSelect(prizeIndex);
  document.getElementById("spinAgainBtn").style.display = "none";
  document.getElementById("spinBtn").disabled = true;

  if (remainingTurns > 0) {
    showToast(
      `Còn lại ${remainingTurns} lượt quay cho giải ${prize.name}`,
      "info"
    );
  } else {
    showToast(`Đã hết lượt quay cho giải ${prize.name}`, "warning");
  }
}

/**
 * Cập nhật trạng thái nút quay số
 */
function updateSpinButtonState() {
  const spinBtn = document.getElementById("spinBtn");
  spinBtn.innerHTML = '<i class="fas fa-random me-2"></i>Bắt đầu quay';
  spinBtn.disabled = false;
}

function playTickSound() {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = 800;
  gainNode.gain.value = 0.1;

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
  }, 100);
}

function goToConfig() {
  window.location.href =
    "config_spin.html?id=" + localStorage.getItem(EVENT_ID_KEY);
}

/**
 * Hiệu ứng pháo hoa khi quay xong
 */
function playConfettiEffect() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );

    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
}
function renderHistoryPagination(totalItems, perPage) {
  const totalPages = Math.ceil(totalItems / perPage);
  const pagination = document.getElementById('historyPagination');
  pagination.innerHTML = '';

  if (totalPages <= 1) {
      document.querySelector('.pagination-info').textContent = '';
      return;
  }

  if (currentHistoryPage < 1) currentHistoryPage = 1;
  if (currentHistoryPage > totalPages) currentHistoryPage = totalPages;

  // Nút "Trước"
  if (currentHistoryPage > 1) {
      pagination.innerHTML += `
          <li class="page-item">
              <a class="page-link" href="#" data-page="${currentHistoryPage - 1}">Trước</a>
          </li>
      `;
  }

  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `
          <li class="page-item ${currentHistoryPage === i ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
      `;
  }

  // Nút "Tiếp theo"
  if (currentHistoryPage < totalPages) {
      pagination.innerHTML += `
          <li class="page-item">
              <a class="page-link" href="#" data-page="${currentHistoryPage + 1}">Tiếp theo</a>
          </li>
      `;
  }

  // Hiển thị thông tin trang
  document.querySelector('.pagination-info').textContent = `Đang hiển thị trang ${currentHistoryPage} của ${totalPages} trang`;
}
