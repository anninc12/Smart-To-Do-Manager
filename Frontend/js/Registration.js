document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            showNotification("Please fill in all fields", "warning");
            return;
        }
        if (password !== confirmPassword) {
            showNotification("Passwords do not match", "error");
            return;
        }
        if (password.length < 6) {
            showNotification("Password must be at least 6 characters", "warning");
            return;
        }
        try {
            const response = await fetch('http://localhost:7000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            // In Registration.js, update the success handler:
            if (response.ok) {
                // Store the user data in localStorage
                console.log(data.user, "data from register");
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = 'Register-Success.html';
            } else {
                showNotification(data.message || "Registration failed!", "error");
            }

        }
        catch (error) {
            console.error('Error:', error);
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