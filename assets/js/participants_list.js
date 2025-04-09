const tableBody = $('.table tbody');
const searchInput = $('.search-box input');
const limitSelect = $('select.form-select');
let participants = JSON.parse(localStorage.getItem('participants')) || [];
let currentPage = 1;

// Get the button that opens the modal
const btnAddNew = document.getElementById('btnAddNew');

// Get the modal element
const addParticipantModal = new bootstrap.Modal(document.getElementById('addParticipantModal'));

// When the user clicks the button, open the modal
btnAddNew.addEventListener('click', function () {
    addParticipantModal.show();
});

function renderTable() {
    let searchTerm = searchInput.val().toLowerCase();
    let perPage = parseInt(limitSelect.val());
    let filtered = participants
        .slice()
        .reverse()
        .filter(p =>
            p.code.toLowerCase().includes(searchTerm) ||
            p.name.toLowerCase().includes(searchTerm) ||
            p.department.toLowerCase().includes(searchTerm)
        );

    let totalPage = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPage) currentPage = totalPage || 1;
    let start = (currentPage - 1) * perPage;
    let paginated = filtered.slice(start, start + perPage);

    tableBody.empty();
    if (paginated.length === 0) {
        tableBody.append('<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>');
        $('.pagination-info').empty();
    } else {
        paginated.forEach((p, index) => {
            tableBody.append(`
                    <tr>
                        <td>${start + index + 1}</td>
                        <td>${p.code}</td>
                        <td>${p.name}</td>
                        <td>${p.department}</td>
                        <td>
                            <button class="btn btn-edit btn-sm" data-index="${participants.indexOf(p)}"><i class="fas fa-edit"></i> Sửa</button>
                            <button class="btn btn-delete btn-sm" data-index="${participants.indexOf(p)}"><i class="fas fa-times"></i> Xóa</button>
                        </td>
                    </tr>
                `);
        });
    }

    renderPagination(filtered.length, perPage);
}

// function save data
function saveToLocalStorage() {
    localStorage.setItem('participants', JSON.stringify(participants));
}
// function create code
function generateUniqueSpinCode(length = 6) {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
}

// event add
$('.btn-add-modal').on('click', function () {
    const name = $('#fullName').val().trim();
    const dept = $('#department').val().trim();

    if (!name || !dept) {
        if (!name) toastr.error('Vui lòng nhập họ tên');
        if (!dept) toastr.error('Vui lòng nhập quê quán');
        return;
    }

    const spinCode = generateUniqueSpinCode();

    participants.push({ code: spinCode, name: name, department: dept });
    saveToLocalStorage();
    renderTable();

    $('#addParticipantForm')[0].reset();
    $('#addParticipantModal').modal('hide');

    toastr.success('Thêm người tham gia thành công!');
});

// event delete
tableBody.on('click', '.btn-delete', function () {
    const index = $(this).data('index');

    Swal.fire({
        title: 'Xác nhận xóa?',
        text: 'Bạn có chắc muốn xóa người này khỏi danh sách?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            participants.splice(index, 1);
            saveToLocalStorage();
            renderTable();

            Swal.fire({
                icon: 'success',
                title: 'Đã xóa!',
                text: 'Người tham dự đã được xóa.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

// event show modal edit
tableBody.on('click', '.btn-edit', function () {
    const index = $(this).data('index');
    const p = participants[index];

    $('#editIndex').val(index);
    $('#editFullName').val(p.name);
    $('#editDepartment').val(p.department);
    $('#editParticipantNameLabel').text(p.name);

    const editModal = new bootstrap.Modal(document.getElementById('editParticipantModal'));
    editModal.show();
});

// event edit
$('.btn-save-edit').on('click', function () {
    const index = $('#editIndex').val();
    const name = $('#editFullName').val().trim();
    const dept = $('#editDepartment').val().trim();

    // Kiểm tra đầu vào
    if (!name || !dept) {
        if (!name) toastr.error('Vui lòng nhập họ tên');
        if (!dept) toastr.error('Vui lòng nhập quê quán');
        return;
    }

    // Cập nhật người tham dự
    participants[index].name = name;
    participants[index].department = dept;

    // Lưu và cập nhật giao diện
    saveToLocalStorage();
    renderTable();

    // Reset và ẩn modal
    $('#editParticipantForm')[0].reset();
    $('#editParticipantModal').modal('hide');

    toastr.success('Cập nhật người tham gia thành công!');
});

// event search and limit select table
searchInput.on('input', renderTable);
limitSelect.on('change', function () {
    currentPage = 1;
    renderTable();
});

// event pagination
$('.pagination').on('click', '.page-link', function (e) {
    e.preventDefault();

    const page = $(this).data('page');
    if (page && page !== currentPage) {
        currentPage = page;
        renderTable();
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

// event delete all
$('.btn-delete-all').on('click', function () {
    if (participants.length === 0) {
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
        text: 'Hành động này sẽ xóa tất cả người tham dự!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa hết',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            participants = [];
            saveToLocalStorage();
            $('.pagination-info').empty();
            renderTable();

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

// import
$('.btn-import').on('click', function () {
    $('#excelInput').click();
});

$('#excelInput').on('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const importedData = XLSX.utils.sheet_to_json(sheet);

        let importedCount = 0;

        importedData.forEach(row => {
            const spinCode = generateUniqueSpinCode();
            const fullName = String(row['Họ tên'] || '').trim();
            const department = String(row['Quê quán'] || '').trim();

            if (
                spinCode.length !== '' &&
                fullName !== '' &&
                department !== '' &&
                !participants.find(p => p.spinCode === spinCode)
            ) {
                participants.push({ code: spinCode, name: fullName, department });
                importedCount++;
            }
        });

        saveToLocalStorage();
        renderTable();

        Swal.fire({
            icon: 'success',
            title: 'Import thành công!',
            text: `Đã thêm ${importedCount} người từ file Excel.`,
            timer: 2000,
            showConfirmButton: false
        });

        $('#excelInput').val('');
    };

    reader.readAsArrayBuffer(file);
});

renderTable();