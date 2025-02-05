document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "http://localhost:5050/api/auth"; // Backend API

    // Signup Form
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userData = {
                username: document.getElementById("username").value,
                firstname: document.getElementById("firstname").value,
                lastname: document.getElementById("lastname").value,
                password: document.getElementById("password").value
            };

            const res = await fetch(`${baseUrl}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await res.json();
            alert(data.message);

            if (res.ok) window.location.href = "login.html";
        });
    }

    // Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userData = {
                username: document.getElementById("loginUsername").value,
                password: document.getElementById("loginPassword").value
            };

            const res = await fetch(`${baseUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await res.json();
            alert(data.message);

            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "chat.html";
            }
        });
    }
});

