let tasks = [];
let currentUser = null;
let isEditing = false;
let currentEditTaskId = null;
let currentFilters = { status: null, priority: null, category: null, search: null };
let sortBy = 'newest';

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

// Show alert message
function showAlert(message, type = 'warning') {
    // Remove any existing alert
    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert-message alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);

    // Show alert
    setTimeout(() => {
        alert.style.display = 'block';
    }, 100);

    // Remove alert after animation
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Enhanced Check for due soon and overdue tasks
function checkDueTasks() {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Check for due soon tasks (within 24 hours)
    const dueSoonTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === 'Completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate > now && dueDate <= in24Hours;
    });

    // Check for overdue tasks
    const overdueTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === 'Completed') return false;
        return new Date(task.dueDate) < now;
    });

    // Remove previous highlights
    document.querySelectorAll('.due-soon').forEach(el => el.classList.remove('due-soon'));
    document.querySelectorAll('.overdue-task').forEach(el => el.classList.remove('overdue-task'));

    // Highlight due soon tasks visually
    dueSoonTasks.forEach(task => {
        const taskElement = document.querySelector(`[data-task-id="${task._id}"]`);
        if (taskElement) {
            taskElement.classList.add('due-soon');
        }
    });

    // Highlight overdue tasks visually
    overdueTasks.forEach(task => {
        const taskElement = document.querySelector(`[data-task-id="${task._id}"]`);
        if (taskElement) {
            taskElement.classList.add('overdue-task');
        }
    });

    // Show overdue alert first (higher priority)
    if (overdueTasks.length > 0) {
        showAlert(`You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}! Please complete them immediately.`, 'danger');
    }
    // Then show due soon alert if no overdue tasks
    else if (dueSoonTasks.length > 0) {
        showAlert(`You have ${dueSoonTasks.length} task${dueSoonTasks.length > 1 ? 's' : ''} due in the next 24 hours! Don't forget to complete them.`, 'warning');
    }

    console.log(`Due soon: ${dueSoonTasks.length}, Overdue: ${overdueTasks.length}`); // Debug log
}

// Automatic priority escalation based on due date proximity
async function escalatePriorityBasedOnDueDate() {
    const now = new Date();
    let updatedTasks = [];
    let hasChanges = false;

    for (const task of tasks) {
        if (!task.dueDate || task.status === 'Completed') continue;

        const dueDate = new Date(task.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

        let newPriority = task.priority;
        let priorityChanged = false;

        // Store original priority for comparison
        const originalPriority = task.priority;

        // Escalation rules - only escalate if not already at the target priority
        if (daysUntilDue <= 1 && task.priority !== 'High') {
            // Due within 24 hours -> High priority
            newPriority = 'High';
            priorityChanged = true;
        } else if (daysUntilDue <= 3 && task.priority === 'Low') {
            // Due within 3 days -> Medium priority (if currently Low)
            newPriority = 'Medium';
            priorityChanged = true;
        }

        if (priorityChanged && originalPriority !== newPriority) {
            console.log(`Escalating priority: "${task.title}" from ${originalPriority} to ${newPriority} (due in ${daysUntilDue} days)`);

            // Update task in backend and wait for completion
            const success = await updateTaskPriority(task._id, newPriority);
            if (success) {
                updatedTasks.push({
                    title: task.title,
                    oldPriority: originalPriority,
                    newPriority: newPriority
                });
                hasChanges = true;
            }
        }
    }

    // Show notification if any priorities were updated
    if (updatedTasks.length > 0) {
        showPriorityUpdateNotification(updatedTasks);
        // Reload tasks to refresh the UI with updated priorities
        await loadTasks();
    }

    return hasChanges;
}

// Update task priority in backend
async function updateTaskPriority(taskId, newPriority) {
    try {
        const response = await fetch(`http://localhost:7000/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priority: newPriority,
                userId: currentUser.email
            })
        });

        if (response.ok) {
            console.log(`Successfully updated task ${taskId} priority to ${newPriority}`);
            return true;
        } else {
            console.error(`Failed to update task ${taskId} priority`);
            return false;
        }
    } catch (err) {
        console.error('Error updating task priority:', err);
        return false;
    }
}

// Show notification about priority updates
function showPriorityUpdateNotification(updatedTasks) {
    if (updatedTasks.length === 0) return;

    let message = '';
    if (updatedTasks.length === 1) {
        const task = updatedTasks[0];
        message = `Priority updated: "${task.title}" changed from ${task.oldPriority} to ${task.newPriority}`;
    } else {
        message = `${updatedTasks.length} tasks had their priorities escalated due to approaching due dates`;

        // Show detailed message in console for debugging
        console.log('Priority updates:');
        updatedTasks.forEach(task => {
            console.log(`• "${task.title}": ${task.oldPriority} → ${task.newPriority}`);
        });
    }

    showToast(message, 'info');

    // Show detailed alert for multiple updates
    if (updatedTasks.length > 1) {
        const detailedMessage = updatedTasks.map(task =>
            `• "${task.title}": ${task.oldPriority} → ${task.newPriority}`
        ).join('\n');

        showAlert(
            `Priority updates:\n${detailedMessage}`,
            'info'
        );
    }
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
            const loadedTasks = await response.json();
            console.log(`Loaded ${loadedTasks.length} tasks from backend`);

            // Store original priorities for comparison
            const originalPriorities = tasks.reduce((acc, task) => {
                acc[task._id] = task.priority;
                return acc;
            }, {});

            tasks = loadedTasks;

            // Apply filters and update UI
            applyFilters();
            updateCounters();
            updateProgressBar();
            checkDueTasks();

            // Check for priority escalation only if we have existing tasks to compare
            if (Object.keys(originalPriorities).length > 0) {
                await escalatePriorityBasedOnDueDate();
            } else {
                // First load - just check for escalation without reloading
                await escalatePriorityBasedOnDueDate();
            }

        } else {
            console.error('Failed to load tasks');
        }
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}

// Apply filters and sorting
function applyFilters() {
    let filtered = [...tasks];

    if (currentFilters.status) filtered = filtered.filter(t => t.status === currentFilters.status);
    if (currentFilters.priority) filtered = filtered.filter(t => t.priority === currentFilters.priority);
    if (currentFilters.category) filtered = filtered.filter(t => t.category === currentFilters.category);
    if (currentFilters.search) filtered = filtered.filter(t => t.title.toLowerCase().includes(currentFilters.search.toLowerCase()));

    // Sorting
    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'dueDate') filtered.sort((a, b) => new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity));
    else if (sortBy === 'priority') {
        const order = { High: 1, Medium: 2, Low: 3 };
        filtered.sort((a, b) => order[a.priority] - order[b.priority]);
    }
    else if (sortBy === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));

    displayTasks(filtered);
}

// Display tasks
function displayTasks(list = tasks) {
    const tasksContainer = document.querySelector('.tasks-container');
    if (!tasksContainer) return;

    if (list.length === 0) {
        tasksContainer.innerHTML = `
        <div class="empty-card">
            <h2>📝 Your Tasks</h2>
            <p>No tasks found. Try changing your filters or add a new task!</p>
            <a href="add-task.html" class="add-task2" style="text-decoration:none;">+ Add Task</a>
        </div>`;
        return;
    }

    let tasksHTML = `<div class="task-list-header"><h2>📝 Your Tasks (${list.length})</h2></div><div class="tasks-grid">`;

    list.forEach(task => {
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

// Search functionality
const searchInput = document.getElementById('task-search');
const searchClear = document.getElementById('search-clear');

if (searchInput && searchClear) {
    searchInput.addEventListener('input', function () {
        currentFilters.search = this.value.trim();
        if (this.value.trim()) {
            searchClear.style.display = 'block';
        } else {
            searchClear.style.display = 'none';
            currentFilters.search = null;
        }
        applyFilters();
    });

    searchClear.addEventListener('click', function () {
        searchInput.value = '';
        currentFilters.search = null;
        this.style.display = 'none';
        applyFilters();
    });
}

// Initialize sort dropdown - FIXED VERSION
function initializeSortDropdown() {
    const sortTitle = document.querySelector(".sort-dropdown .dropdown-title");
    const sortMenu = document.getElementById("sort-tasks");

    if (sortTitle && sortMenu) {
        // Toggle dropdown
        sortTitle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isVisible = sortMenu.style.display === "flex";
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
            sortMenu.style.display = isVisible ? "none" : "flex";
        });

        // Handle option click
        sortMenu.querySelectorAll(".dropdown-item").forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                sortBy = item.getAttribute("data-sort");
                sortTitle.textContent = item.textContent + " ▼";
                sortMenu.style.display = "none";
                applyFilters();
            });
        });
    }
}

// Update dropdown titles based on current filters
function updateDropdownTitles() {
    const statusTitle = document.querySelector('[data-filter="status"] .dropdown-title');
    const priorityTitle = document.querySelector('[data-filter="priority"] .dropdown-title');
    const categoryTitle = document.querySelector('[data-filter="category"] .dropdown-title');

    if (statusTitle) statusTitle.textContent = (currentFilters.status || 'All Status') + ' ▼';
    if (priorityTitle) priorityTitle.textContent = (currentFilters.priority || 'All Priorities') + ' ▼';
    if (categoryTitle) categoryTitle.textContent = (currentFilters.category || 'All Categories') + ' ▼';
}

// Dropdown filter
function initializeDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const title = dropdown.querySelector('.dropdown-title');
        const menu = dropdown.querySelector('.dropdown-menu');
        const filterType = dropdown.querySelector('.dropdown-item')?.getAttribute('data-filter');

        if (!title || !menu || !filterType) return;

        // Open / close menu
        title.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) m.style.display = 'none';
            });
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        });

        // Apply filter when selecting
        menu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const value = item.getAttribute('data-value');
                currentFilters[filterType] = value === 'all' ? null : value;
                title.textContent = item.textContent + " ▼";
                menu.style.display = 'none';
                applyFilters();
            });
        });
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
});

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

// Edit task
async function editTask(taskId) {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    isEditing = true;
    currentEditTaskId = taskId;

    const formTitle = document.getElementById('form-title');
    const submitBtn = document.querySelector('.submit-btn');
    const statusGroup = document.getElementById('status-group');

    if (formTitle) formTitle.textContent = 'Edit Task';
    if (submitBtn) submitBtn.textContent = 'Update Task';
    if (statusGroup) statusGroup.style.display = 'block';

    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskCategory').value = task.category;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    document.getElementById('taskStatus').value = task.status;
}

// Update task counters
function updateCounters() {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;

    const overdueTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === 'Completed') return false;
        return new Date(task.dueDate) < new Date();
    }).length;

    const dueTodayTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === 'Completed') return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return dueDate.toDateString() === today.toDateString();
    }).length;

    const dueSoonTasks = tasks.filter(task => {
        if (!task.dueDate || task.status === 'Completed') return false;
        const dueDate = new Date(task.dueDate);
        const in24Hours = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        return dueDate > new Date() && dueDate <= in24Hours;
    }).length;

    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('overdue-tasks').textContent = overdueTasks;
    document.getElementById('due-today-tasks').textContent = dueTodayTasks;
}

// Update progress bar
function updateProgressBar() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.getElementById('completion-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// Quick actions
document.getElementById('mark-all-completed')?.addEventListener('click', markAllCompleted);
document.getElementById('clear-completed')?.addEventListener('click', clearCompleted);
document.getElementById('export-tasks')?.addEventListener('click', exportTasks);

async function markAllCompleted() {
    if (!confirm('Mark all tasks as completed?')) return;
    try {
        const pendingTasks = tasks.filter(task => task.status !== 'Completed');
        await Promise.all(pendingTasks.map(task =>
            fetch(`http://localhost:7000/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Completed', userId: currentUser.email })
            })
        ));
        showToast('All tasks marked as completed', 'success');
        loadTasks();
    } catch (error) {
        console.error('Error completing all tasks:', error);
        showToast('Failed to complete all tasks', 'error');
    }
}

async function clearCompleted() {
    if (!confirm('Delete all completed tasks?')) return;
    try {
        const completedTasks = tasks.filter(task => task.status === 'Completed');
        if (completedTasks.length === 0) {
            showToast('No completed tasks to delete', 'info');
            return;
        }
        await Promise.all(completedTasks.map(task =>
            fetch(`http://localhost:7000/api/tasks/${task._id}`, { method: 'DELETE' })
        ));
        showToast('Completed tasks cleared', 'success');
        loadTasks();
    } catch (error) {
        console.error('Error clearing completed tasks:', error);
        showToast('Failed to clear completed tasks', 'error');
    }
}

function exportTasks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "smarttodo_tasks.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast('Tasks exported successfully', 'success');
}

// Logout
const logoutBtn = document.querySelector('.header-btn a[onclick="logout()"]');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    initializeDropdowns();
    initializeSortDropdown();
    loadTasks();

    // Show toast if redirected from add-task
    if (localStorage.getItem('taskAdded') === 'true') {
        showToast('Task added successfully!', 'success');
        localStorage.removeItem('taskAdded');
    }
});

// Set up periodic checking for due tasks AND priority escalation (every hour)
setInterval(() => {
    checkDueTasks();
    escalatePriorityBasedOnDueDate();
}, 60 * 60 * 1000);