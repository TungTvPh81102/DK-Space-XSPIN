let winners = JSON.parse(localStorage.getItem('winners')) || [];
let excludedWinners = JSON.parse(localStorage.getItem('excludedWinners') || '[]');
const list_winners = $('#list_winners');
const searchInput = $('.search-box input');
const limitSelect = $('select.form-select');
let excludedSearchInput = $('#excludedModal .search-box input');
let excludedLimitSelect = $('#excludedModal select.form-select');
let excludedCurrentPage = 1;
let currentPage = 1;
// Get modal elements
const viewExcludedBtn = document.getElementById('viewExcludedBtn');
const modalOverlay = document.getElementById('modalOverlay');
const excludedModal = document.getElementById('excludedModal');
const closeModal = document.getElementById('closeModal');

// Open modal when button is clicked
viewExcludedBtn.addEventListener('click', function () {
    modalOverlay.style.display = 'block';
    excludedModal.style.display = 'block';
});

// Close modal when X button is clicked
closeModal.addEventListener('click', function () {
    modalOverlay.style.display = 'none';
    excludedModal.style.display = 'none';
});

// Close modal when clicking outside the modal
modalOverlay.addEventListener('click', function () {
    modalOverlay.style.display = 'none';
    excludedModal.style.display = 'none';
});

function renderListWinners() {
    let searchTerm = searchInput.val().toLowerCase();
    let perPage = parseInt(limitSelect.val());
    let filtered = winners
        .slice()
        .reverse()
        .filter(p =>
            p.code.toLowerCase().includes(searchTerm) ||
            p.name.toLowerCase().includes(searchTerm) ||
            p.department.toLowerCase().includes(searchTerm) ||
            p.prize.toLowerCase().includes(searchTerm) ||
            String(p.turn).includes(searchTerm) ||
            p.date.toLowerCase().includes(searchTerm)
        );

    let totalPage = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPage) currentPage = totalPage || 1;
    let start = (currentPage - 1) * perPage;
    let paginated = filtered.slice(start, start + perPage);

    list_winners.empty();
    if (paginated.length === 0) {
        list_winners.append('<tr><td colspan="12" class="text-center">Không có dữ liệu</td></tr>');
        $('.pagination-info').empty();
    } else {
        paginated.forEach((p, index) => {
            list_winners.append(`
            <tr>
                <td>${start + index + 1}</td>
                <td>${p.date}</td>
                <td>${p.prize}</td>
                <td>${p.turn}</td>
                <td>${p.name}</td>
                <td>${p.department}</td>
                <td>${p.code}</td>
                <td>
                    <button class="btn btn-cancel btn-sm" data-index="${winners.indexOf(p)}"><i class="fas fa-times"></i> Hủy kết quả</button>
                </td>
            </tr>
        `);
        });
    }

    renderPagination(filtered.length, perPage);
}

// function save data
function saveToLocalStorage() {
    localStorage.setItem('winners', JSON.stringify(winners));
    localStorage.setItem('excludedWinners', JSON.stringify(excludedWinners));
}

// event delete
list_winners.on('click', '.btn-cancel', function () {
    const index = $(this).data('index');

    Swal.fire({
        title: 'Xác nhận hủy kết quả?',
        text: 'Bạn có chắc muốn hủy kết quả của người này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            const removed = winners.splice(index, 1)[0];

            excludedWinners.push(removed);

            saveToLocalStorage();
            renderListWinners();

            Swal.fire({
                icon: 'success',
                title: 'Đã hủy!',
                text: 'Hủy kết quả thành công.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

// event delete all
$('.btn-delete-all').on('click', function () {
    if (winners.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Không có dữ liệu',
            text: 'Danh sách đang trống!',
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }

    Swal.fire({
        title: 'Xóa toàn bộ?',
        text: 'Hành động này sẽ xóa tất cả danh sách người trúng thưởng!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa hết',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            winners = [];
            saveToLocalStorage();
            $('.pagination-info').empty();
            renderListWinners();

            Swal.fire({
                icon: 'success',
                title: 'Đã xóa!',
                text: 'Toàn bộ danh sách đã được xóa.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

// event search and limit select table
searchInput.on('input', renderListWinners);
limitSelect.on('change', function () {
    currentPage = 1;
    renderListWinners();
});

// event pagination
$('.pagination').on('click', '.page-link', function (e) {
    e.preventDefault();

    const page = $(this).data('page');
    if (page && page !== currentPage) {
        currentPage = page;
        renderListWinners();
    }
});

function renderPagination(totalItems, perPage) {
    const totalPages = Math.ceil(totalItems / perPage);
    const pagination = $('.pagination');
    pagination.empty();

    if (totalPages === 0) return;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    pagination.append(`
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Trước</a>
            </li>
        `);

    for (let i = 1; i <= totalPages; i++) {
        pagination.append(`
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
    }

    pagination.append(`
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Tiếp theo</a>
            </li>
        `);

    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);
    $('.pagination-info').text(`Đang hiển thị ${startItem} đến ${endItem} của ${totalItems} kết quả`);
}

$('#exportExcelBtn').on('click', function () {
    const winners = JSON.parse(localStorage.getItem('winners')) || [];

    const data = $.map(winners, function (p, index) {
        return {
            "STT": index + 1,
            "Ngày trúng thưởng": p.date,
            "Tên giải": p.prize,
            "Lần quay": p.turn,
            "Họ tên": p.name,
            "Phòng ban": p.department,
            "Mã quay số": p.code
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Winners");

    XLSX.writeFile(workbook, "danh_sach_trung_thuong.xlsx");
});

function renderExcludedList(page = 1, perPage = 10, searchKeyword = '') {
    const filtered = excludedWinners.filter(item =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.department.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginated = filtered.slice(start, end);

    const tbody = $('#excludedModal tbody');
    const paginationInfo = $('.pagination-info');
    const pagination = $('.pagination');

    tbody.empty();

    if (paginated.length === 0) {
        tbody.append(`<tr><td colspan="5" class="no-data">Chưa có dữ liệu</td></tr>`);
    } else {
        paginated.forEach((item, index) => {
            tbody.append(`
        <tr>
            <td>${start + index + 1}</td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.department}</td>
            <td><button class="btn btn-sm btn-danger btn-restore" data-index="${excludedWinners.indexOf(item)}">Khôi phục</button></td>
        </tr>
    `);
        });
    }

    // Update pagination info
    paginationInfo.text(`Hiển thị ${start + 1} đến ${Math.min(end, filtered.length)} của ${filtered.length} kết quả`);

    // Pagination buttons
    const totalPages = Math.ceil(filtered.length / perPage);
    pagination.empty();

    pagination.append(`
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page - 1}">Trước</a>
        </li>
        `);

    for (let i = 1; i <= totalPages; i++) {
        pagination.append(`
        <li class="page-item ${i === page ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
    `);
    }

    pagination.append(`
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page + 1}">Tiếp theo</a>
        </li>
        `);
}

renderListWinners();