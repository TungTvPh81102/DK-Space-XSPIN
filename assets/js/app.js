$(document).ready(function () {
  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 50) {
      $(".navbar").addClass("scrolled");
    } else {
      $(".navbar").removeClass("scrolled");
    }
  });

  $(".nav-link").on("click", function (e) {
    const href = $(this).attr("href");

    if (href.startsWith("#") && href !== "#") {
      e.preventDefault();
      const $target = $(href);

      if ($target.length) {
        $("html, body").animate(
          {
            scrollTop: $target.offset().top - 80,
          },
          500
        );
      }
    }
  });

  const $sections = $("section");
  const $navLinks = $(".navbar-nav .nav-link");

  $(window).on("scroll", function () {
    let current = "";

    $sections.each(function () {
      const sectionTop = $(this).offset().top;

      if ($(window).scrollTop() >= sectionTop - 200) {
        current = $(this).attr("id");
      }
    });

    $navLinks.removeClass("active");
    $navLinks.each(function () {
      if ($(this).attr("href") === `#${current}`) {
        $(this).addClass("active");
      }
    });
  });

  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 50) {
      $(".navbar").addClass("scrolled");
    } else {
      $(".navbar").removeClass("scrolled");
    }
  });

  // AUTH
  function showToast(type, title, message) {
    const bgColor = type === "success" ? "#28a745" : "#dc3545";
    Toastify({
      text: `${title}: ${message}`,
      duration: 5000,
      gravity: "top",
      position: "right",
      backgroundColor: bgColor,
      close: true,
      stopOnFocus: true,
    }).showToast();
  }

  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();
    const rememberMe = $("#rememberMe").prop("checked");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      showToast(
        "error",
        "Đăng nhập thất bại",
        "Email hoặc mật khẩu không chính xác."
      );
      return;
    }

    const currentUser = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      isLoggedIn: true,
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    if (rememberMe) {
      localStorage.setItem("rememberedUser", JSON.stringify({ email }));
    } else {
      localStorage.removeItem("rememberedUser");
    }

    showToast(
      "success",
      "Đăng nhập thành công",
      `Chào mừng ${user.name} đã quay trở lại!`
    );

    setTimeout(function () {
      window.location.href = "../index.html";
    }, 2000);
  });

  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const name = $("#registerName").val().trim();
    const email = $("#registerEmail").val().trim();
    const phone = $("#registerPhone").val().trim();
    const password = $("#registerPassword").val();
    const confirmPassword = $("#confirmPassword").val();
    const agreeTerms = $("#agreeTerms").prop("checked");

    if (name.length < 3) {
      showToast("error", "Lỗi", "Họ và tên phải có ít nhất 3 ký tự.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Lỗi", "Email không hợp lệ.");
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      showToast("error", "Lỗi", "Số điện thoại phải có 10-11 chữ số.");
      return;
    }

    if (password.length < 6) {
      showToast("error", "Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      showToast("error", "Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!agreeTerms) {
      showToast(
        "error",
        "Lỗi",
        "Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật."
      );
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((user) => user.email === email)) {
      showToast("error", "Lỗi", "Email này đã được sử dụng.");
      return;
    }

    if (users.some((user) => user.phone === phone)) {
      showToast("error", "Lỗi", "Số điện thoại này đã được sử dụng.");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email,
      phone: phone,
      password: password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    showToast(
      "success",
      "Đăng ký thành công",
      "Tài khoản của bạn đã được tạo thành công!"
    );

    setTimeout(function () {
      window.location.href = "sign-in.html";
    }, 2000);
  });

  const rememberedUser = JSON.parse(
    localStorage.getItem("rememberedUser") || "null"
  );
  if (rememberedUser) {
    $("#loginEmail").val(rememberedUser.email);
    $("#rememberMe").prop("checked", true);
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (currentUser && currentUser.isLoggedIn) {
    setTimeout(function () {
      showToast(
        "success",
        "Đã đăng nhập",
        `Bạn đã đăng nhập với tài khoản ${currentUser.name}`
      );
      setTimeout(function () {
        window.location.href = "../index.html";
      }, 2000);
    }, 500);
  }

  $(".social-btn button").hover(
    function () {
      $(this).css("transform", "translateY(-5px)");
    },
    function () {
      $(this).css("transform", "translateY(0)");
    }
  );

  function checkAuthStatus() {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    if (currentUser && currentUser.isLoggedIn) {
      $(".auth-buttons").addClass("d-none");
      $(".user-dropdown").removeClass("d-none");
      $(".user-name").text(currentUser.name);
    } else {
      $(".auth-buttons").removeClass("d-none");
      $(".user-dropdown").addClass("d-none");
    }
  }

  checkAuthStatus();

  $(".logout-btn").on("click", function (e) {
    e.preventDefault();

    localStorage.removeItem("currentUser");

    setTimeout(function () {
      window.location.href = "index.html";
    }, 1500);
  });
});
