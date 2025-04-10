function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function loadEvents() {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  return events;
}

function saveEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
}

/**
 * Render danh sách sự kiện
 * */
function renderEvents() {
  const events = loadEvents();
  const tableBody = document.getElementById("eventTableBody");
  const emptyState = document.getElementById("emptyState");
  const tableContainer = document.getElementById("eventTableContainer");
  const eventCounter = document.getElementById("eventCounter");

  eventCounter.textContent = events.length;

  if (events.length === 0) {
    emptyState.classList.remove("d-none");
    tableContainer.classList.add("d-none");
    return;
  } else {
    emptyState.classList.add("d-none");
    tableContainer.classList.remove("d-none");
  }

  tableBody.innerHTML = "";

  events.forEach((event, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${event.name}</td>
            <td>${formatDate(event.createdAt)}</td>
            <td>
                <a href="config_spin.html?id=${
                  event.id
                }" class="btn config-btn">
                    <i class="fas fa-cog me-1"></i> Cấu hình
                </a>
                <button class="btn delete-btn" data-id="${
                  event.id
                }" data-name="${event.name}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const eventId = this.getAttribute("data-id");
      const eventName = this.getAttribute("data-name");

      document.getElementById("deleteEventName").textContent = eventName;

      document
        .getElementById("confirmDeleteBtn")
        .setAttribute("data-id", eventId);

      const deleteModal = new bootstrap.Modal(
        document.getElementById("deleteConfirmModal")
      );
      deleteModal.show();
    });
  });
}

/**
 * Thêm sự kiện mới
 */
document.getElementById("saveEventBtn").addEventListener("click", function () {
  const eventName = document.getElementById("eventName").value.trim();

  if (!eventName) {
    alert("Vui lòng nhập tên sự kiện");
    return;
  }

  const eventId = generateUUID();
  const newEvent = {
    id: eventId,
    name: eventName,
    createdAt: new Date().toISOString(),
  };

  const events = loadEvents();
  events.push(newEvent);
  saveEvents(events);

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addEventModal")
  );
  modal.hide();

  document.getElementById("eventName").value = "";

  renderEvents();

  Toastify({
    text: "Thêm sự kiện thành công",
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#198754",
  }).showToast();
});

/**
 * Xoá sự kiện
 * */
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    const eventId = this.getAttribute("data-id");
    let events = loadEvents();

    events = events.filter((event) => event.id !== eventId);

    saveEvents(events);

    const deleteModal = bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    );
    deleteModal.hide();

    renderEvents();
  });

/**
 * Khởi tạo DOM
 */
document.addEventListener("DOMContentLoaded", function () {
  renderEvents();

  document
    .getElementById("addEventModal")
    .addEventListener("show.bs.modal", function () {
      document.getElementById("eventName").value = "";
    });
});
