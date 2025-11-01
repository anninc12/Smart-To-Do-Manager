let tasks = [];
let currentUser = null;

// Sidebar toggle
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');
const toggleBtn = document.querySelector('#sidebarToggle');

if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// Load tasks from backend
async function loadTasks() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            window.location.href = 'index.html';
            return;
        }
        currentUser = JSON.parse(userData);

        const response = await fetch(`http://localhost:7000/api/tasks/${currentUser.email}`);
        if (response.ok) {
            tasks = await response.json();
            console.log(`Loaded ${tasks.length} tasks for My Tasks page`);
            displayTasks();
        } else {
            console.error('Failed to load tasks');
        }
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}

// Display tasks
function displayTasks() {
    const tasksContainer = document.querySelector('.tasks-container');
    if (!tasksContainer) return;

    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
        <div class="empty-card">
            <h2>📝 Your Tasks</h2>
            <p>No tasks yet. Click the button below to add your first task!</p>
            <a href="add-task.html" class="add-task2" style="text-decoration:none;">+ Add Task</a>
        </div>`;
        return;
    }

    let tasksHTML = `<div class="task-list-header"><h2>📝 My Tasks (${tasks.length})</h2></div><div class="tasks-grid">`;

    tasks.forEach(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
        const isDueSoon = task.dueDate && new Date(task.dueDate) > new Date() && new Date(task.dueDate) <= new Date(new Date().getTime() + 24 * 60 * 60 * 1000) && task.status !== 'Completed';
        const statusClass = task.status === "Completed" ? "completed-task" : "";
        const overdueClass = isOverdue ? "overdue-task" : "";
        const dueSoonClass = isDueSoon ? "due-soon" : "";

        tasksHTML += `
        <div class="task-card ${statusClass} ${overdueClass} ${dueSoonClass}" data-task-id="${task._id}">
            <div class="task-header">
                <h3>${task.title}</h3>
                <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
            </div>
            <div class="task-body">
                <p>${task.description || 'No description'}</p>
                <div class="task-meta">
                    <span class="task-category">${task.category}</span>
                    <span class="task-due ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon-text' : ''}">📅 ${dueDate} ${isOverdue ? ' (Overdue)' : ''} ${isDueSoon ? ' (Due Soon)' : ''}</span>
                </div>
            </div>
            <div class="task-footer">
                <span class="task-status status-${task.status.toLowerCase().replace(' ', '-')}" onclick="toggleTaskStatus('${task._id}')">
                    ${task.status}
                </span>
                <div class="buttons">
                    <button class="edit-btn">
                      <a href="Edit-Task.html?taskId=${task._id}" style="color: inherit; text-decoration: none;">
                      <i class="fas fa-edit"></i>
                      </a>
                    </button>
                    <button class="delete-btn" onclick="deleteTask('${task._id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>`;
    });

    tasksHTML += '</div>';
    tasksContainer.innerHTML = tasksHTML;
}

// Toggle task status
async function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
        const response = await fetch(`http://localhost:7000/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, userId: currentUser.email })
        });

        if (response.ok) {
            showToast(`Task marked as ${newStatus}`, 'success');
            loadTasks();
        } else {
            showToast('Failed to update status', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error updating status', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        const response = await fetch(`http://localhost:7000/api/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
            showToast('Task deleted successfully!', 'success');
            loadTasks();
        } else {
            showToast('Failed to delete task', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Error deleting task', 'error');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    loadTasks();

    // Show toast if redirected from add-task
    if (localStorage.getItem('taskAdded') === 'true') {
        showToast('Task added successfully!', 'success');
        localStorage.removeItem('taskAdded');
    }
});