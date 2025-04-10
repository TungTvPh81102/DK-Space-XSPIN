let eventData = {};
let prizes = [];
let participants = [];
let winners = [];
let currentPrize = null;
let currentTurn = null;
let isSpinning = false;
let tempSelectedWinners = [];
const EVENT_ID_KEY = "currentEventId";
const STORAGE_KEY_PREFIX = "event_";

document.addEventListener("DOMContentLoaded", function () {
  loadEventData();
  setupEventListeners();
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

  const events = JSON.parse(localStorage.getItem("events")) || [];
  eventData = events.find((event) => event.id === eventId);
  if (!eventData) {
    showToast("Không thể tải dữ liệu sự kiện", "error");
    return;
  }

  prizes = JSON.parse(localStorage.getItem(`prizes_${eventId}`)) || [];
  participants =
    JSON.parse(localStorage.getItem(`participants_${eventId}`)) || [];
  winners = JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];

  displayEventInfo();
  populatePrizeSelect();
}

function displayEventInfo() {
  document.getElementById("eventName").textContent =
    eventData.name || "Sự kiện không xác định";
  document.getElementById("eventDate").textContent =
    "Ngày tạo: " + (eventData.createdAt || "--/--/----");
}

/**
 * Chọn giải thưởng và lượt quay
 */
function populatePrizeSelect() {
  const prizeSelect = document.getElementById("prizeSelect");
  prizeSelect.innerHTML =
    '<option value="" selected disabled>-- Chọn giải thưởng --</option>';

  if (prizes.length === 0) {
    showToast("Chưa có giải thưởng nào được cấu hình", "warning");
    return;
  }

  const eventId = localStorage.getItem(EVENT_ID_KEY);
  const eventWinners =
    JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];

  const availablePrizes = prizes.filter((prize, index) => {
    const completedTurns = eventWinners
      .filter((winner) => winner.prizeIndex == index)
      .map((winner) => winner.turn);

    const uniqueCompletedTurns = [...new Set(completedTurns)];

    return uniqueCompletedTurns.length < prize.turns;
  });

  if (availablePrizes.length === 0) {
    showToast("Tất cả giải thưởng đã hết lượt quay", "info");
    return;
  }

  prizes.forEach((prize, index) => {
    const completedTurns = eventWinners
      .filter((winner) => winner.prizeIndex == index)
      .map((winner) => winner.turn);

    const uniqueCompletedTurns = [...new Set(completedTurns)];

    if (uniqueCompletedTurns.length < prize.turns) {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = prize.name;
      prizeSelect.appendChild(option);
    }
  });
}

/**
 * Tạo dropdown lần quay
 * */
function populateTurnSelect(prizeIndex) {
  const turnSelect = document.getElementById("turnSelect");
  turnSelect.innerHTML =
    '<option value="" selected disabled>-- Chọn lần quay --</option>';

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

  prizeSelect.addEventListener("change", function () {
    const prizeIndex = parseInt(this.value);
    currentPrize = prizes[prizeIndex];
    currentTurn = null;

    document.getElementById("currentPrize").textContent = currentPrize.name;
    document.getElementById("currentTurn").textContent = "";

    populateTurnSelect(prizeIndex);
    spinBtn.disabled = true;
    spinAgainBtn.style.display = "none";
  });

  turnSelect.addEventListener("change", function () {
    currentTurn = parseInt(this.value);
    document.getElementById(
      "currentTurn"
    ).textContent = `Lần quay: ${currentTurn}`;
    spinBtn.disabled = false;
    spinAgainBtn.style.display = "none";
  });

  spinBtn.addEventListener("click", startSpin);
  spinAgainBtn.addEventListener("click", function () {
    const confirmModal = new bootstrap.Modal(
      document.getElementById("confirmModal")
    );
    confirmModal.show();
  });

  confirmSpinAgainBtn.addEventListener("click", function () {
    const confirmModal = bootstrap.Modal.getInstance(
      document.getElementById("confirmModal")
    );
    confirmModal.hide();
    startSpin();
  });

  saveWinnersBtn.addEventListener("click", function () {
    if (tempSelectedWinners.length > 0) {
      savePermanentWinners(tempSelectedWinners);
      const winnerModal = bootstrap.Modal.getInstance(
        document.getElementById("winnerModal")
      );
      winnerModal.hide();
      showToast("Đã lưu kết quả quay thành công!", "success");
    }
  });

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
 * Lấy danh sách người có thể tham gia
 * Loại bỏ những người đã trúng giải
 * */
function getAvailableParticipants() {
  const allWinnerCodes = winners.map((winner) => winner.code);
  const tempWinnerCodes = tempSelectedWinners.map((winner) => winner.code);
  const allExcludedCodes = [
    ...new Set([...allWinnerCodes, ...tempWinnerCodes]),
  ];

  return participants.filter(
    (participant) => !allExcludedCodes.includes(participant.code)
  );
}

/**
 * Bắt đầu quay số
 * Kiểm tra người tham gia khả dụng
 * Kích hoạt animation các chữ số
 * */
function startSpin() {
  if (isSpinning) return;

  const availableParticipants = getAvailableParticipants();

  if (availableParticipants.length === 0) {
    showToast("Tất cả người tham gia đều đã nhận thưởng", "error");
    return;
  }

  isSpinning = true;
  const spinBtn = document.getElementById("spinBtn");
  const spinAgainBtn = document.getElementById("spinAgainBtn");
  spinBtn.disabled = true;
  spinAgainBtn.style.display = "none";
  spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang quay...';

  tempSelectedWinners = [];

  const digitElements = [
    document.getElementById("digit1"),
    document.getElementById("digit2"),
    document.getElementById("digit3"),
    document.getElementById("digit4"),
    document.getElementById("digit5"),
  ];

  digitElements.forEach((digit) => {
    digit.textContent = "0";
    startDigitAnimation(digit);
  });

  const spinDuration = 3000 + Math.random() * 2000;

  setTimeout(() => {
    endSpin(availableParticipants);
  }, spinDuration);
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

/**
 * Kết thúc quay số
 * Chọn ngẫu nhiên người trúng giải
 */
function endSpin(availableParticipants) {
  const prizeIndex = parseInt(document.getElementById("prizeSelect").value);
  const winnersPerTurn = prizes[prizeIndex].winnersPerTurn || 1;

  const numberOfWinners = Math.min(
    winnersPerTurn,
    availableParticipants.length
  );

  const shuffledParticipants = [...availableParticipants].sort(
    () => 0.5 - Math.random()
  );

  const selectedWinners = shuffledParticipants.slice(0, numberOfWinners);

  tempSelectedWinners = selectedWinners;

  const firstWinner = selectedWinners[0];
  const winnerCode = firstWinner.code || "00000";
  const codeDigits = winnerCode.padStart(5, "0").split("");

  const digitElements = [
    document.getElementById("digit1"),
    document.getElementById("digit2"),
    document.getElementById("digit3"),
    document.getElementById("digit4"),
    document.getElementById("digit5"),
  ];

  if (winnersPerTurn === 1) {
    let currentDigitIndex = 0;

    function revealNextDigit() {
      if (currentDigitIndex < digitElements.length) {
        const digit = digitElements[currentDigitIndex];
        stopDigitAnimation(digit);
        digit.textContent = codeDigits[currentDigitIndex] || "0";
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
  } else {
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
                    <td>${winner.department}</td>
                `;
    tableBody.appendChild(row);
  });

  const winnerModal = new bootstrap.Modal(
    document.getElementById("winnerModal")
  );
  winnerModal.show();
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
      department: winner.department,
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
