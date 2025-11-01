document.addEventListener('DOMContentLoaded', async function () {
    const taskForm = document.getElementById('taskForm');
    const statusGroup = document.getElementById('status-group');

    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
        window.location.href = '../HTML/index.html';
        return;
    }
    const currentUser = JSON.parse(currentUserData);

    // Get taskId from URL
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('taskId');
    if (!taskId) {
        alert('No task selected!');
        window.location.href = 'Task-Manager.html';
        return;
    }

    // Load task data from backend
    try {
        // Fetch all tasks for this user
        const response = await fetch(`http://localhost:7000/api/tasks/${currentUser.email}`);
        if (!response.ok) throw new Error('Tasks not found');

        // Get all tasks
        let tasks = await response.json();

        // Find the one with matching ID
        const task = tasks.find(t => t._id === taskId);
        if (!task) throw new Error('Task not found');

        // Debug
        console.log("Fetched Task:", task);

        // Pre-fill form safely
        document.getElementById('taskTitle').value = task.title || task.taskTitle || '';
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.category || 'Personal';
        document.getElementById('taskPriority').value = task.priority || 'Medium';
        document.getElementById('taskDueDate').value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
        document.getElementById('taskStatus').value = task.status || 'Pending';
    } catch (err) {
        console.error(err);
        alert('Failed to load task data');
        window.location.href = 'Task-Manager.html';
    }

    // Handle form submission
    if (taskForm) {
        taskForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const category = document.getElementById('taskCategory').value;
            const priority = document.getElementById('taskPriority').value;
            const dueDate = document.getElementById('taskDueDate').value;
            const status = document.getElementById('taskStatus').value;

            if (!title) {
                showToast('Please enter task title', 'error');
                return;
            }

            try {
                const res = await fetch(`http://localhost:7000/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description, category, priority, dueDate, status, userId: currentUser.email })
                });
                if (res.ok) {
                    showToast('Task updated successfully!', 'success');
                    setTimeout(() => { window.location.href = 'Task-Manager.html'; }, 1500);
                } else {
                    showToast('Failed to update task', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Error updating task', 'error');
            }
        });
    }
});

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
