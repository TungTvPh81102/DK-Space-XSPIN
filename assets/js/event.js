document.addEventListener("DOMContentLoaded", function () {
  loadEvents();

  document
    .getElementById("saveEventBtn")
    .addEventListener("click", function () {
      saveEvent();
    });

  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
      const eventId = this.dataset.eventId;
      if (eventId) {
        deleteEvent(eventId);
      }
    });
});

function loadEvents() {
  const events = JSON.parse(localStorage.getItem("events") || "[]");

  document.getElementById("eventCounter").textContent = events.length;

  if (events.length === 0) {
    document.getElementById("emptyState").classList.remove("d-none");
    document.getElementById("eventCardContainer").classList.add("d-none");
  } else {
    document.getElementById("emptyState").classList.add("d-none");
    document.getElementById("eventCardContainer").classList.remove("d-none");

    renderEventCards(events);
  }
}

function renderEventCards(events) {
  const container = document.getElementById("eventCardContainer");
  container.innerHTML = "";

  events.forEach((event, index) => {
    const eventCard = document.createElement("div");
    eventCard.className = "col-lg-4 col-md-6 mb-4";
    eventCard.innerHTML = `
           <div class="event-card">
               <div class="event-header">
                   <div class="event-id">ID: ${event.id}</div>
               </div>
               <div class="event-body">
                   <h5 class="event-name">${event.name}</h5>
                   <p class="event-description">${
                     event.description || "Không có mô tả"
                   }</p>
                   <div class="event-date">
                       <i class="far fa-calendar-alt"></i> Ngày tạo: ${formatDate(
                         event.createdAt
                       )}
                   </div>
               </div>
               <div class="event-footer">
                   <div class="d-flex justify-content-between">
                       <button class="btn action-btn config-btn" onclick="configEvent('${
                         event.id
                       }')">
                           <i class="fas fa-cog"></i> Cấu hình
                       </button>
                       <button class="btn action-btn delete-btn" onclick="showDeleteModal('${
                         event.id
                       }', '${event.name}')">
                           <i class="fas fa-trash-alt"></i> Xóa
                       </button>
                   </div>
               </div>
           </div>
       `;
    container.appendChild(eventCard);
  });
}

function saveEvent() {
  const eventName = document.getElementById("eventName").value.trim();
  const eventDescription = document
    .getElementById("eventDescription")
    .value.trim();

  if (!eventName) {
    showToast("Vui lòng nhập tên sự kiện", "error");
    return;
  }

  const events = JSON.parse(localStorage.getItem("events") || "[]");

  const newEvent = {
    id: generateId(),
    name: eventName,
    description: eventDescription,
    createdAt: new Date().toISOString(),
  };

  events.push(newEvent);

  localStorage.setItem("events", JSON.stringify(events));

  $("#addEventModal").modal("hide");
  document.getElementById("addEventForm").reset();

  showToast("Sự kiện đã được tạo thành công!", "success");
  loadEvents();
}

function showDeleteModal(eventId, eventName) {
  document.getElementById("deleteEventName").textContent = eventName;
  document.getElementById("confirmDeleteBtn").dataset.eventId = eventId;
  $("#deleteConfirmModal").modal("show");
}

function deleteEvent(eventId) {
  let events = JSON.parse(localStorage.getItem("events") || "[]");

  events = events.filter((event) => event.id !== eventId);

  localStorage.setItem("events", JSON.stringify(events));

  $("#deleteConfirmModal").modal("hide");

  showToast("Sự kiện đã được xóa thành công!", "success");
  loadEvents();
}

function configEvent(eventId) {
  window.location.href = `config_spin.html?id=${eventId}`;
}

function generateId() {
  return "evt_" + Math.random().toString(36).substring(2, 12);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
