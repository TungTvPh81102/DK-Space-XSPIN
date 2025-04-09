// Lấy dữ liệu từ localStorage
let prizes = [];
let participants = [];
let winners = [];

try {
    const prizesData = localStorage.getItem('prizes');
    const participantsData = localStorage.getItem('participants');
    const winnersData = localStorage.getItem('winners');

    prizes = prizesData ? JSON.parse(prizesData) : [];
    participants = participantsData ? JSON.parse(participantsData) : [];
    winners = winnersData ? JSON.parse(winnersData) : [];

    // Kiểm tra nếu dữ liệu không phải là mảng
    if (!Array.isArray(prizes)) prizes = [];
    if (!Array.isArray(participants)) participants = [];
    if (!Array.isArray(winners)) winners = [];
} catch (error) {
    console.error('Lỗi khi lấy dữ liệu từ localStorage:', error);
    document.getElementById('errorMessage').textContent = 'Lỗi: Không thể lấy dữ liệu từ localStorage. Vui lòng kiểm tra lại.';
    document.getElementById('errorMessage').style.display = 'block';
    prizes = [];
    participants = [];
    winners = [];
}

let currentPrize = null;
let currentPrizeIndex = -1;
let currentTurn = 1;

// Kiểm tra dữ liệu và hiển thị thông báo nếu không có giải hoặc người tham dự
function checkData() {
    if (prizes.length === 0) {
        document.getElementById('errorMessage').textContent = 'Chưa có giải nào được thêm. Vui lòng thêm giải trước khi quay số.';
        document.getElementById('errorMessage').style.display = 'block';
        return false;
    }
    if (participants.length === 0) {
        document.getElementById('errorMessage').textContent = 'Chưa có người tham dự nào được thêm. Vui lòng thêm người tham dự trước khi quay số.';
        document.getElementById('errorMessage').style.display = 'block';
        return false;
    }
    return true;
}

// Tạo dropdown chọn giải
function initializePrizeSelect() {
    const prizeSelect = document.getElementById('prizeSelect');
    prizeSelect.innerHTML = '<option value="">Chọn giải</option>';

    if (!checkData()) return;

    prizes.forEach((prize, index) => {
        if (prize.status === 'Chưa quay') {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = prize.name;
            prizeSelect.appendChild(option);
        }
    });
}

// Xử lý khi chọn giải
document.getElementById('prizeSelect').addEventListener('change', function () {
    const prizeIndex = parseInt(this.value);
    const turnSelect = document.getElementById('turnSelect');
    turnSelect.innerHTML = '<option value="">Chọn lần quay</option>';
    turnSelect.style.display = 'none';
    document.querySelector('.go').style.display = 'none';

    if (prizeIndex >= 0) {
        currentPrize = prizes[prizeIndex];
        currentPrizeIndex = prizeIndex;

        // Tính số lần quay đã thực hiện
        const turnsDone = winners.filter(w => w.prize === currentPrize.name).length;
        const remainingTurns = currentPrize.turns - turnsDone;

        if (remainingTurns > 0) {
            // Tạo dropdown lần quay
            for (let i = 1; i <= remainingTurns; i++) {
                const turn = turnsDone + i;
                const option = document.createElement('option');
                option.value = turn;
                option.textContent = `Lần ${turn}`;
                turnSelect.appendChild(option);
            }
            turnSelect.style.display = 'inline-block';
        } else {
            document.getElementById('errorMessage').textContent = `Giải ${currentPrize.name} đã quay đủ số lần.`;
            document.getElementById('errorMessage').style.display = 'block';
            this.value = '';
            currentPrize = null;
            currentPrizeIndex = -1;
        }
    }
});

// Xử lý khi chọn lần quay
document.getElementById('turnSelect').addEventListener('change', function () {
    const turn = parseInt(this.value);
    if (turn > 0) {
        currentTurn = turn;
        document.querySelector('.go').style.display = 'inline-block';
    } else {
        document.querySelector('.go').style.display = 'none';
    }
});

// Hook nút "Quay"
$(document).on('click', '.go', function () {
    if (!currentPrize || currentPrizeIndex === -1 || !currentTurn) {
        alert('Vui lòng chọn giải và lần quay!');
        return;
    }

    if (participants.length === 0) {
        alert('Không có người tham dự để quay số!');
        return;
    }

    const digits = document.querySelectorAll('.number-box');
    // Hiển thị hiệu ứng quay bằng cách thay số ngẫu nhiên liên tục
        digits.forEach((digitBox) => {
    digitBox.classList.add('spinning');
    });
    // Chọn ngẫu nhiên một người tham dự
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];
    const randomCode = winner.code.padStart(6, '0'); // Đảm bảo mã có 6 chữ số
    setTimeout(() => {
    // Dừng hiệu ứng và hiển thị số sau 2 giây
    digits.forEach((digit, index) => {
          digit.classList.remove('spinning');
          const strip = digit.querySelector('.number-strip');
          const targetDigit = parseInt(randomCode[index]);
          strip.style.transition = 'transform 0.3s ease-in-out';
          strip.style.transform = `translateY(-${targetDigit * 100}px)`;
        }); 
        updateResult(currentPrize, currentPrizeIndex, winner, randomCode);
      },2000);
      
});

// Cập nhật kết quả sau khi quay
function updateResult(prize, prizeIndex, winner, randomCode) {
    // Cập nhật trạng thái giải thành "Đã quay"
    prizes[prizeIndex].status = 'Đã quay';
    localStorage.setItem('prizes', JSON.stringify(prizes));

    // Thêm người trúng giải vào danh sách
    const winnerData = {
        date: new Date().toISOString().slice(0, 16),
        prize: prize.name,
        turn: currentTurn,
        name: winner.name,
        department: winner.department,
        code: randomCode
    };
    winners.push(winnerData);
    localStorage.setItem('winners', JSON.stringify(winners));

    // Hiển thị kết quả
    const resultSection = document.getElementById('resultSection');
    document.getElementById('resultPrize').textContent = prize.name;
    document.getElementById('resultTurn').textContent = currentTurn;
    document.getElementById('resultName').textContent = winner.name;
    document.getElementById('resultCode').textContent = randomCode;
    resultSection.style.display = 'block';

    // Xóa giải khỏi dropdown nếu đã quay đủ số lần
    const turnsDone = winners.filter(w => w.prize === prize.name).length;
    if (turnsDone >= prize.turns) {
        const prizeSelect = document.getElementById('prizeSelect');
        const optionToRemove = prizeSelect.querySelector(`option[value="${prizeIndex}"]`);
        if (optionToRemove) optionToRemove.remove();
    }

    // Reset giao diện
    document.getElementById('prizeSelect').value = '';
    document.getElementById('turnSelect').style.display = 'none';
    document.querySelector('.go').style.display = 'none';
    currentPrize = null;
    currentPrizeIndex = -1;
    currentTurn = 1;
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    initializePrizeSelect();
});