const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get("id");
let eventData = null;

if (!eventId) {
  window.location.href = "event.html";
}

const participants =
  JSON.parse(localStorage.getItem(`participants_${eventId}`)) || [];

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function saveToLocalStorage() {
  localStorage.setItem(`participants_${eventId}`, JSON.stringify(participants));
}

function isCodeUnique(code, participantIndex = "") {
  const eventParticipants =
    JSON.parse(localStorage.getItem(`participants_${eventId}`)) || [];
  return !eventParticipants.some(
    (p, i) =>
      p.code === code &&
      (participantIndex === "" || i !== parseInt(participantIndex))
  );
}

function goBack() {
  window.location.href = "event.html";
}
function previewPrizeImage() {
  const input = document.getElementById("prizeImage");
  const preview = document.getElementById("prizeImagePreview");
  const container = document.getElementById("prizeImagePreviewContainer");

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      container.style.display = "block";
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.src = "";
    container.style.display = "none";
  }
}
function filterPrizes() {
  const searchTerm = document.getElementById("prizeSearchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#prizeTableBody tr");

  rows.forEach((row) => {
    // Lấy toàn bộ nội dung văn bản của các cột (trừ ảnh)
    const textContent = Array.from(row.cells)
      .filter((_, i) => i !== 4) // Bỏ qua cột ảnh
      .map((cell) => cell.textContent.toLowerCase())
      .join(" ");

    row.style.display = textContent.includes(searchTerm) ? "" : "none";
  });
}
function filterParticipants() {
  const searchTerm = document.getElementById("participantSearchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#participantTableBody tr");

  rows.forEach((row) => {
    // Lấy toàn bộ nội dung văn bản của các cột (trừ ảnh)
    const textContent = Array.from(row.cells)
      .filter((_, i) => i !== 4) // Bỏ qua cột ảnh
      .map((cell) => cell.textContent.toLowerCase())
      .join(" ");

    row.style.display = textContent.includes(searchTerm) ? "" : "none";
  });
}
function filterWinners() {
  const searchTerm = document.getElementById("winnerSearchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#winnerTableBody tr");

  rows.forEach((row) => {
    // Lấy toàn bộ nội dung văn bản của các cột (trừ ảnh)
    const textContent = Array.from(row.cells)
      .filter((_, i) => i !== 10) // Bỏ qua cột ảnh
      .map((cell) => cell.textContent.toLowerCase())
      .join(" ");

    row.style.display = textContent.includes(searchTerm) ? "" : "none";
  });
}
/**
 * Thông tin sự kiện
 * Danh sách người tham gia, người trùng giải
 */
function initEventData() {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  eventData = events.find((event) => event.id === eventId);

  if (!eventData) {
    showToast("Không tìm thấy thông tin sự kiện!", "error");
    setTimeout(() => {
      window.location.href = "event.html";
    }, 2000);
    return;
  }

  document.getElementById("eventName").textContent = eventData.name;
  document.getElementById("eventDate").textContent = `Ngày tạo: ${formatDate(
    eventData.createdAt
  )}`;

  loadPrizes();
  loadParticipants();
  loadWinners();
}

/**
 * Quản lý giải thưởng
 * */
function loadPrizes() {
  const eventPrizes =
    JSON.parse(localStorage.getItem(`prizes_${eventId}`)) || [];
  const tableBody = document.getElementById("prizeTableBody");
  const emptyState = document.getElementById("prizeEmptyState");
  const tableContainer = document.getElementById("prizeTableContainer");

  if (eventPrizes.length === 0) {
    emptyState.style.display = "block";
    tableContainer.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  tableContainer.style.display = "block";

  tableBody.innerHTML = "";

  eventPrizes.forEach((prize, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${prize.name}</td>
            <td>${prize.turns}</td>
            <td>${prize.winnersPerTurn || 1}</td>
            <td>
                ${prize.image ? `<img src="${prize.image}" alt="${prize.name}" style="width: 60px; height: auto;" />` : "—"}
           </td>
            <td>
                <span class="badge ${prize.status === "Đã quay" ? "bg-success" : "bg-warning"
      }">${prize.status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editPrize(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('giải thưởng', '${prize.name
      }', ${index}, 'prize')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

/**
 * Chỉnh sửa thông tin giải
 * */
function editPrize(index) {
  const eventPrizes =
    JSON.parse(localStorage.getItem(`prizes_${eventId}`)) || [];
  const prize = eventPrizes[index];

  if (prize.status === "Đã quay") {
    showToast("Không thể chỉnh sửa giải thưởng đã quay!", "error");
    return;
  }

  document.getElementById("prizeName").value = prize.name;
  document.getElementById("prizeTurns").value = prize.turns;
  document.getElementById("prizeWinnersPerTurn").value =
    prize.winnersPerTurn || 1;
  document.getElementById("prizeIndex").value = index;
    // Hiển thị ảnh cũ nếu có
    const preview = document.getElementById("prizeImagePreview");
    const container = document.getElementById("prizeImagePreviewContainer");
  
    if (prize.image) {
      preview.src = prize.image;
      container.style.display = "block";
    } else {
      preview.src = "";
      container.style.display = "none";
    }
  
    document.getElementById("prizeImage").value = "";
  document.getElementById("addPrizeModalLabel").textContent =
    "Chỉnh sửa giải thưởng";
  new bootstrap.Modal(document.getElementById("addPrizeModal")).show();
}

/**
 * Lưu thông tin giải
 */
function savePrize() {
  const name = document.getElementById("prizeName").value.trim();
  const turns = parseInt(document.getElementById("prizeTurns").value);
  const winnersPerTurn = parseInt(document.getElementById("prizeWinnersPerTurn").value);
  const index = document.getElementById("prizeIndex").value;
  const imageInput = document.getElementById("prizeImage");
  const file = imageInput.files[0];

  if (!name || isNaN(turns) || turns < 1 || isNaN(winnersPerTurn) || winnersPerTurn < 1) {
    showToast("Vui lòng điền đầy đủ thông tin giải thưởng!", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageBase64 = e.target.result;

    let eventPrizes = JSON.parse(localStorage.getItem(`prizes_${eventId}`)) || [];

    if (index !== "") {
      if (eventPrizes[index].status === "Đã quay") {
        showToast("Không thể chỉnh sửa giải thưởng đã quay!", "error");
        bootstrap.Modal.getInstance(document.getElementById("addPrizeModal")).hide();
        return;
      }

      eventPrizes[index] = {
        ...eventPrizes[index],
        name,
        turns,
        winnersPerTurn,
        image: file ? imageBase64 : eventPrizes[index].image || null,
      };
      showToast("Cập nhật giải thưởng thành công!");

      document.getElementById("prizeImagePreview").src = "";
      document.getElementById("prizeImagePreviewContainer").style.display = "none";
    } else {
      eventPrizes.push({
        name,
        turns,
        winnersPerTurn,
        status: "Chưa quay",
        image: file ? imageBase64 : null,
      });
      showToast("Thêm giải thưởng thành công!");
    }

    localStorage.setItem(`prizes_${eventId}`, JSON.stringify(eventPrizes));
    bootstrap.Modal.getInstance(document.getElementById("addPrizeModal")).hide();
    document.getElementById("prizeForm").reset();
    document.getElementById("prizeIndex").value = "";
    document.getElementById("prizeImage").value = "";
    document.getElementById("prizeImagePreview").src = "";
    document.getElementById("prizeImagePreviewContainer").style.display = "none";
    document.getElementById("addPrizeModalLabel").textContent = "Thêm giải thưởng mới";

    loadPrizes();
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    // Không có ảnh, vẫn tiếp tục lưu
    reader.onload({ target: { result: null } });
  }
}
document.getElementById("addPrizeModal").addEventListener("hidden.bs.modal", function () {
  document.getElementById("prizeForm").reset();
  document.getElementById("prizeIndex").value = "";
  document.getElementById("addPrizeModalLabel").textContent = "Thêm giải thưởng mới";
  document.getElementById("prizeImage").value = "";
  document.getElementById("prizeImagePreview").src = "";
  document.getElementById("prizeImagePreviewContainer").style.display = "none";
});
/**
 * Xoá giải thưởng
 * */
function deletePrize(index) {
  let eventPrizes = JSON.parse(localStorage.getItem(`prizes_${eventId}`)) || [];

  if (eventPrizes[index].status === "Đã quay") {
    showToast("Không thể xóa giải thưởng đã quay!", "error");
    return;
  }

  const prizeName = eventPrizes[index].name;
  eventPrizes.splice(index, 1);
  localStorage.setItem(`prizes_${eventId}`, JSON.stringify(eventPrizes));
  showToast(`Xóa giải thưởng "${prizeName}" thành công!`);
  loadPrizes();
}

/**
 * Quản lý người tham gia
 */
function loadParticipants() {
  const eventParticipants =
    JSON.parse(localStorage.getItem(`participants_${eventId}`)) || [];
  const tableBody = document.getElementById("participantTableBody");
  const emptyState = document.getElementById("participantEmptyState");
  const tableContainer = document.getElementById("participantTableContainer");

  if (eventParticipants.length === 0) {
    emptyState.style.display = "block";
    tableContainer.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  tableContainer.style.display = "block";

  tableBody.innerHTML = "";

  eventParticipants.forEach((participant, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${participant.name}</td>
            <td>${participant.department}</td>
            <td>${participant.code}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editParticipant(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('người tham gia', '${participant.name
      }', ${index}, 'participant')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

/**
 * Sửa thông tin người tham gia
 */
function editParticipant(index) {
  const eventParticipants =
    JSON.parse(localStorage.getItem(`participants_${eventId}`)) || [];
  const participant = eventParticipants[index];

  document.getElementById("participantName").value = participant.name;
  document.getElementById("participantDepartment").value =
    participant.department;
  document.getElementById("participantCode").value = participant.code;
  document.getElementById("participantIndex").value = index;

  document.getElementById("addParticipantModalLabel").textContent =
    "Chỉnh sửa người tham gia";
  new bootstrap.Modal(document.getElementById("addParticipantModal")).show();
}

/**
 * Lưu thông tin người tham gia
 * */
function saveParticipant() {
  const name = document.getElementById("participantName").value.trim();
  const department = document
    .getElementById("participantDepartment")
    .value.trim();
  const index = document.getElementById("participantIndex").value;

  if (!name || !department) {
    showToast("Vui lòng điền đầy đủ thông tin người tham gia!", "error");
    return;
  }

  let eventParticipants =
    JSON.parse(localStorage.getItem(`participants_${eventId}`)) || [];

  let code;

  if (index === "") {
    do {
      code = generateRandomCode();
    } while (!isCodeUnique(code));

    eventParticipants.push({
      name: name,
      department: department,
      code: code,
    });
    showToast("Thêm người tham gia thành công!");
  } else {
    code = eventParticipants[index].code;

    eventParticipants[index] = {
      name: name,
      department: department,
      code: code,
    };
    showToast("Cập nhật người tham gia thành công!");
  }

  localStorage.setItem(
    `participants_${eventId}`,
    JSON.stringify(eventParticipants)
  );
  bootstrap.Modal.getInstance(
    document.getElementById("addParticipantModal")
  ).hide();
  document.getElementById("participantForm").reset();
  document.getElementById("participantIndex").value = "";
  document.getElementById("addParticipantModalLabel").textContent =
    "Thêm người tham gia mới";

  loadParticipants();
}

/**
 * Xoá thông tin người tham gia
 */
function deleteParticipant(index) {
  let eventParticipants =
    JSON.parse(localStorage.getItem(`participants_${eventId}`)) || [];
  const participant = eventParticipants[index];
  const eventWinners = JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];
  const isWinner = eventWinners.some(
    (winner) => winner.code === participant.code
  );

  if (isWinner) {
    showToast(`Không thể xóa "${participant.name}" vì người này đã trúng giải! Hủy bỏ kết quả trúng trước khi xóa`, "error");
    return;
  }

  // Nếu không trúng giải thì cho xóa
  eventParticipants.splice(index, 1);
  localStorage.setItem(
    `participants_${eventId}`,
    JSON.stringify(eventParticipants)
  );
  showToast(`Xóa người tham gia "${participant.name}" thành công!`);
  loadParticipants();
}

/**
 * Quản lý người trúng giải
 */
function loadWinners() {
  const eventWinners =
    JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];
  const tableBody = document.getElementById("winnerTableBody");
  const emptyState = document.getElementById("winnerEmptyState");
  const tableContainer = document.getElementById("winnerTableContainer");
  if (eventWinners.length === 0) {
    emptyState.style.display = "block";
    tableContainer.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  tableContainer.style.display = "block";

  tableBody.innerHTML = "";

  eventWinners.forEach((winner, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${winner.date}</td>
      <td>${winner.prize}</td>
      <td>${winner.turn}</td>
      <td>${winner.name}</td>
      <td>${winner.department}</td>
      <td>${winner.code}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('người trúng giải', '${winner.name
      }', ${index}, 'winner')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * Xoá người trúng giải
 */
function deleteWinner(index) {
  let eventWinners =
    JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];
  eventWinners.splice(index, 1);
  localStorage.setItem(`winners_${eventId}`, JSON.stringify(eventWinners));
  showToast("Xóa người trúng giải thành công!");
  loadWinners();
}

/**
 * Import dữ liệu
 * */
$(".btn-import").on("click", function () {
  $("#excelInput").click();
});

$("#excelInput").on("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    const importedData = XLSX.utils.sheet_to_json(sheet);

    let importedCount = 0;

    importedData.forEach((row) => {
      const spinCode = generateRandomCode();
      const fullName = String(row["Họ tên"] || "").trim();
      const department = String(row["Phòng ban"] || "").trim();

      if (
        fullName &&
        department &&
        !participants.find((p) => p.code === spinCode)
      ) {
        participants.push({
          code: spinCode,
          name: fullName,
          department,
        });
        importedCount++;
      }
    });

    if (importedCount > 0) {
      saveToLocalStorage();
      loadParticipants();
      showToast(
        `Đã import thành công ${importedCount} người tham gia`,
        "success"
      );
    } else {
      showToast("Không có dữ liệu hợp lệ để import", "error");
    }

    $("#excelInput").val("");
  };

  reader.readAsArrayBuffer(file);
});

/**
 * Xuất danh sách người trúng giải
 * */
document
  .getElementById("exportWinnersBtn")
  .addEventListener("click", function () {
    const eventWinners =
      JSON.parse(localStorage.getItem(`winners_${eventId}`)) || [];

    if (eventWinners.length === 0) {
      showToast("Không có dữ liệu để xuất!", "error");
      return;
    }

    let csvContent = "\uFEFF";
    csvContent += "STT,Ngày,Tên giải,Lần,Họ tên,Phòng ban,Mã quay số\n";

    eventWinners.forEach((winner, index) => {
      console.log(winner);

      const row = [
        index + 1,
        winner.date,
        winner.prize,
        winner.turn,
        winner.name,
        winner.department,
        winner.code,
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh-sach-trung-giai-${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Xuất danh sách thành công!");
  });

function confirmDelete(itemType, itemName, index, type) {
  document.getElementById(
    "deleteItemName"
  ).textContent = `${itemType} "${itemName}"`;
  document.getElementById("deleteItemType").value = type;
  document.getElementById("deleteItemIndex").value = index;

  new bootstrap.Modal(document.getElementById("deleteConfirmModal")).show();
}

document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    const type = document.getElementById("deleteItemType").value;
    const index = parseInt(document.getElementById("deleteItemIndex").value);

    switch (type) {
      case "prize":
        deletePrize(index);
        break;
      case "participant":
        deleteParticipant(index);
        break;
      case "winner":
        deleteWinner(index);
        break;
    }

    bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    ).hide();
  });

document.addEventListener("DOMContentLoaded", function () {
  initEventData();

  document.getElementById("savePrizeBtn").addEventListener("click", savePrize);

  document
    .getElementById("saveParticipantBtn")
    .addEventListener("click", saveParticipant);

  document
    .getElementById("addPrizeModal")
    .addEventListener("hidden.bs.modal", function () {
      document.getElementById("prizeForm").reset();
      document.getElementById("prizeIndex").value = "";
      document.getElementById("addPrizeModalLabel").textContent =
        "Thêm giải thưởng mới";
    });

  document
    .getElementById("addParticipantModal")
    .addEventListener("hidden.bs.modal", function () {
      document.getElementById("participantForm").reset();
      document.getElementById("participantIndex").value = "";
      document.getElementById("addParticipantModalLabel").textContent =
        "Thêm người tham gia mới";
    });
});
