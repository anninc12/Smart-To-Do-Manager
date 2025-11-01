document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#Login-Form');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.querySelector('#email').value.trim();
        const password = document.querySelector('#password').value;

        if (!email || !password) {
            showNotification("Please fill in all fields", "warning");
            return;
        }
        try {
            const response = await fetch('http://localhost:7000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = 'Login-Success.html';
            }
            else {
                showNotification(data.message || "Registration failed!", "error");
            }
        }
        catch (error) {
            showNotification("Something went wrong. Please try again later.", "error");
        }
    });
    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.className = "";
        notification.classList.add("show", type);
        notification.innerHTML = message;
        setTimeout(() => {
            notification.classList.remove("show");
        }, 5000);
    }
});
window.togglePassword = function (fieldId, iconElement) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    if (field.type === "password") {
        field.type = "text";
        iconElement.classList.remove("fa-eye");
        iconElement.classList.add("fa-eye-slash");
    }
    else {
        field.type = "password";
        iconElement.classList.remove("fa-eye-slash");
        iconElement.classList.add("fa-eye");
    }
};