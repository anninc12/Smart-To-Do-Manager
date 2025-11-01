document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resetForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value.trim();
        const newPassword = form.querySelector('input[name="newPassword"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        if (!email || !newPassword || !confirmPassword) {
            showNotification('Please fill in all fields', 'warning');
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification("Passwords do not match!", "error");
            return;
        }
        try {
            const response = await fetch('http://localhost:7000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                showNotification(data.message || "Password reset successful!", "success");
                window.location.href = "login.html";
            }
            else {
                showNotification(data.message || "Password reset failed!", "error");
            }
        }
        catch (error) {
            showNotification('Error connecting to server', 'error');
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