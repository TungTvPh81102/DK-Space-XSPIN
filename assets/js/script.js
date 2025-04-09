// Khởi tạo dữ liệu từ localStorage
let prizes = JSON.parse(localStorage.getItem('prizes')) || [];
let participants = JSON.parse(localStorage.getItem('participants')) || [];
let winners = JSON.parse(localStorage.getItem('winners')) || [];

let editIndex = -1;
let currentModal = '';

// Hiển thị dữ liệu trong bảng
function renderTable(tableId, data) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';
    data.forEach((item, index) => {
        let row = '';
        if (tableId === 'prizeTableBody') {
            row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.turns}</td>
                    <td><img src="${item.image || 'https://via.placeholder.com/50'}" alt="Hình ảnh"></td>
                    <td>${item.status}</td>
                    <td>
                        <button class="btn btn-warning btn-sm btn-action" onclick="openEditModal('prizeModal', ${index})"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-danger btn-sm btn-action" onclick="deleteItem('prizes', ${index})"><i class="fas fa-trash"></i> Xóa</button>
                    </td>
                </tr>
            `;
        } else if (tableId === 'participantTableBody') {
            row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.department}</td>
                    <td>${item.code}</td>
                    <td>
                        <button class="btn btn-warning btn-sm btn-action" onclick="openEditModal('participantModal', ${index})"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-danger btn-sm btn-action" onclick="deleteItem('participants', ${index})"><i class="fas fa-trash"></i> Xóa</button>
                    </td>
                </tr>
            `;
        } else if (tableId === 'winnerTableBody') {
            row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.date}</td>
                    <td>${item.prize}</td>
                    <td>${item.turn}</td>
                    <td>${item.name}</td>
                    <td>${item.department}</td>
                    <td>${item.code}</td>
                    <td>
                        <button class="btn btn-warning btn-sm btn-action" onclick="openEditModal('winnerModal', ${index})"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-danger btn-sm btn-action" onclick="deleteItem('winners', ${index})"><i class="fas fa-trash"></i> Xóa</button>
                    </td>
                </tr>
            `;
        }
        tableBody.innerHTML += row;
    });
}

// Mở modal
function openModal(modalId) {
    editIndex = -1;
    currentModal = modalId;
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    document.getElementById(modalId + 'Label').textContent = modalId.includes('prize') ? 'Thêm Giải Quay' : modalId.includes('participant') ? 'Thêm Người Tham Dự' : 'Thêm Người Trúng Giải';
    document.getElementById(modalId.replace('Modal', 'Form')).reset();
    modal.show();
}

// Mở modal để sửa
function openEditModal(modalId, index) {
    editIndex = index;
    currentModal = modalId;
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    document.getElementById(modalId + 'Label').textContent = modalId.includes('prize') ? 'Sửa Giải Quay' : modalId.includes('participant') ? 'Sửa Người Tham Dự' : 'Sửa Người Trúng Giải';

    if (modalId === 'prizeModal') {
        const prize = prizes[index];
        document.getElementById('prizeName').value = prize.name;
        document.getElementById('prizeTurns').value = prize.turns;
        document.getElementById('prizeImage').value = prize.image;
        document.getElementById('prizeStatus').value = prize.status;
    } else if (modalId === 'participantModal') {
        const participant = participants[index];
        document.getElementById('participantName').value = participant.name;
        document.getElementById('participantDepartment').value = participant.department;
        document.getElementById('participantCode').value = participant.code;
    } else if (modalId === 'winnerModal') {
        const winner = winners[index];
        document.getElementById('winnerDate').value = winner.date;
        document.getElementById('winnerPrize').value = winner.prize;
        document.getElementById('winnerTurn').value = winner.turn;
        document.getElementById('winnerName').value = winner.name;
        document.getElementById('winnerDepartment').value = winner.department;
        document.getElementById('winnerCode').value = winner.code;
    }

    modal.show();
}

// Xử lý form submit
document.getElementById('prizeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const prize = {
        name: document.getElementById('prizeName').value,
        turns: document.getElementById('prizeTurns').value,
        image: document.getElementById('prizeImage').value,
        status: document.getElementById('prizeStatus').value
    };

    if (editIndex === -1) {
        prizes.push(prize);
    } else {
        prizes[editIndex] = prize;
    }

    localStorage.setItem('prizes', JSON.stringify(prizes));
    renderTable('prizeTableBody', prizes);
    bootstrap.Modal.getInstance(document.getElementById('prizeModal')).hide();
});

document.getElementById('participantForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const participant = {
        name: document.getElementById('participantName').value,
        department: document.getElementById('participantDepartment').value,
        code: document.getElementById('participantCode').value
    };

    if (editIndex === -1) {
        participants.push(participant);
    } else {
        participants[editIndex] = participant;
    }

    localStorage.setItem('participants', JSON.stringify(participants));
    renderTable('participantTableBody', participants);
    bootstrap.Modal.getInstance(document.getElementById('participantModal')).hide();
});

document.getElementById('winnerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const winner = {
        date: document.getElementById('winnerDate').value,
        prize: document.getElementById('winnerPrize').value,
        turn: document.getElementById('winnerTurn').value,
        name: document.getElementById('winnerName').value,
        department: document.getElementById('winnerDepartment').value,
        code: document.getElementById('winnerCode').value
    };

    if (editIndex === -1) {
        winners.push(winner);
    } else {
        winners[editIndex] = winner;
    }

    localStorage.setItem('winners', JSON.stringify(winners));
    renderTable('winnerTableBody', winners);
    bootstrap.Modal.getInstance(document.getElementById('winnerModal')).hide();
});

// Xóa dữ liệu
function deleteItem(type, index) {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
        if (type === 'prizes') {
            prizes.splice(index, 1);
            localStorage.setItem('prizes', JSON.stringify(prizes));
            renderTable('prizeTableBody', prizes);
        } else if (type === 'participants') {
            participants.splice(index, 1);
            localStorage.setItem('participants', JSON.stringify(participants));
            renderTable('participantTableBody', participants);
        } else if (type === 'winners') {
            winners.splice(index, 1);
            localStorage.setItem('winners', JSON.stringify(winners));
            renderTable('winnerTableBody', winners);
        }
    }
}

// Khởi tạo bảng khi tải trang
renderTable('prizeTableBody', prizes);
renderTable('participantTableBody', participants);
renderTable('winnerTableBody', winners);