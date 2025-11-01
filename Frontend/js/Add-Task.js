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

// Simple Add Task Functionality - Beginner Friendly
function addNewTask(event) {
    event.preventDefault();

    console.log("Add task button clicked!"); // Debug log

    // Get current user
    const userData = localStorage.getItem('currentUser');
    console.log("User data from localStorage:", userData); // Debug log

    if (!userData) {
        showToast('Please log in first!', 'error');
        window.location.href = '../HTML/index.html';
        return;
    }

    // Parse user data safely
    let currentUser;
    try {
        currentUser = JSON.parse(userData);
        console.log("Parsed user object:", currentUser); // Debug log
    } catch (error) {
        console.error("Error parsing user data:", error);
        showToast('Session error. Please log in again.', 'error');
        window.location.href = '../HTML/index.html';
        return;
    }

    // Get form values
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;

    // Simple validation
    if (!title) {
        showToast('Please enter a task title!', 'error');
        return;
    }

    // Get user email/username - try different possible properties
    let userId = 'unknown';
    if (currentUser.email) {
        userId = currentUser.email;
    } else if (currentUser.username) {
        userId = currentUser.username;
    } else if (currentUser.name) {
        userId = currentUser.name;
    }

    console.log("Using userId:", userId); // Debug log

    // Create task object
    const newTask = {
        title: title,
        description: description,
        category: category,
        priority: priority,
        dueDate: dueDate,
        status: 'Pending',
        userId: userId
    };

    console.log("New task to be created:", newTask); // Debug log

    // Send to server
    fetch('http://localhost:7000/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    })
        .then(response => {
            console.log("Server response status:", response.status); // Debug log
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Server returned error: ' + response.status);
            }
        })
        .then(data => {
            console.log("Task created successfully:", data); // Debug log
            showToast('Task added successfully!', 'success');

            // Redirect to task manager
            setTimeout(() => {
                window.location.href = 'Task-Manager.html';
            }, 1500);
        })
        .catch(error => {
            console.error('Error adding task:', error);
            showToast('Failed to add task. Please check console for details.', 'error');
        });
}

// Initialize the form
document.addEventListener('DOMContentLoaded', function () {
    console.log("Add Task page loaded!"); // Debug log

    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', addNewTask);
        console.log("Form event listener added!"); // Debug log
    } else {
        console.error("Form not found!");
    }

    // Set minimum date to today
    const dueDateInput = document.getElementById('taskDueDate');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
    }
});