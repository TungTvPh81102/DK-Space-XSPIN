function showToast(message, type = "success") {
  const bgColor =
    type === "error"
      ? "#dc3545"
      : type === "success"
      ? "#198754"
      : type === "warning"
      ? "#ffc107"
      : "#0d6efd";

  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: bgColor,
  }).showToast();
}

function generateRandomCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const allChars = letters + numbers;

  let result = letters.charAt(Math.floor(Math.random() * letters.length));

  result += numbers.charAt(Math.floor(Math.random() * numbers.length));

  for (let i = 0; i < 3; i++) {
    result += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return result
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

function generateUUID() {
  return "xxxx-xxxx-xxxx-xxxx".replace(/[x]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return r.toString(16);
  });
}
