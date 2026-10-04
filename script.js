const taskForm = document.getElementById("task-form");
const taskModal = document.getElementById("task-modal");
const modalTitle = document.getElementById("modal-title");
const taskId = document.getElementById("task-id");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskPriority = document.getElementById("task-priority");
const taskStatus = document.getElementById("task-status");
const taskDue = document.getElementById("task-due");
const formError = document.getElementById("form-error");

const openModalButton = document.getElementById("open-modal");
const closeModalButton = document.getElementById("close-modal");
const modalBackdrop = document.getElementById("modal-backdrop");

const todoList = document.getElementById("todo-list");
const progressList = document.getElementById("progress-list");
const doneList = document.getElementById("done-list");

const totalCount = document.getElementById("total-count");
const progressCount = document.getElementById("progress-count");
const doneCount = document.getElementById("done-count");

const todoCount = document.getElementById("todo-count");
const progressColumnCount = document.getElementById("progress-column-count");
const doneColumnCount = document.getElementById("done-column-count");

const toastContainer = document.getElementById("toast-container");

let tasks = JSON.parse(localStorage.getItem("taskBoardTasks")) || [];
let draggedTaskId = null;


function saveTasks() {
    localStorage.setItem("taskBoardTasks", JSON.stringify(tasks));
}


function createId() {
    return Date.now().toString();
}


function openModal(status = "todo") {
    taskForm.reset();
    taskId.value = "";
    taskStatus.value = status;
    taskPriority.value = "medium";
    formError.textContent = "";
    modalTitle.textContent = "Create a task";

    taskModal.classList.remove("hidden");
    taskTitle.focus();
}


function closeModal() {
    taskModal.classList.add("hidden");
    formError.textContent = "";
}


function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}


function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


function formatDate(date) {
    if (!date) {
        return "";
    }

    const parts = date.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


function renderTasks() {
    todoList.innerHTML = "";
    progressList.innerHTML = "";
    doneList.innerHTML = "";

    const todoTasks = tasks.filter(task => task.status === "todo");
    const progressTasks = tasks.filter(task => task.status === "progress");
    const doneTasks = tasks.filter(task => task.status === "done");

    renderColumn(todoTasks, todoList);
    renderColumn(progressTasks, progressList);
    renderColumn(doneTasks, doneList);

    updateCounts(todoTasks, progressTasks, doneTasks);
}


function renderColumn(columnTasks, container) {
    if (columnTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No tasks here yet
            </div>
        `;
        return;
    }

    columnTasks.forEach(task => {
        container.appendChild(createTaskCard(task));
    });
}


function createTaskCard(task) {
    const card = document.createElement("div");

    card.className = "task-card";
    card.draggable = true;
    card.dataset.id = task.id;

    const description = task.description
        ? escapeHtml(task.description)
        : "No description added.";

    const dueDate = task.due
        ? `<span class="due-date">Due: ${formatDate(task.due)}</span>`
        : "";

    card.innerHTML = `
        <h4>${escapeHtml(task.title)}</h4>

        <p>${description}</p>

        <div class="task-meta">
            <span class="priority priority-${task.priority}">
                ${task.priority}
            </span>

            ${dueDate}
        </div>

        <div class="task-actions">
            <button class="edit-btn" data-id="${task.id}">
                Edit
            </button>

            <button class="delete-btn" data-id="${task.id}">
                Delete
            </button>
        </div>
    `;

    card.addEventListener("dragstart", () => {
        draggedTaskId = task.id;
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        draggedTaskId = null;
        card.classList.remove("dragging");
    });

    return card;
}


function updateCounts(todoTasks, progressTasks, doneTasks) {
    const total = tasks.length;

    totalCount.textContent = total;
    progressCount.textContent = progressTasks.length;
    doneCount.textContent = doneTasks.length;

    todoCount.textContent = todoTasks.length;
    progressColumnCount.textContent = progressTasks.length;
    doneColumnCount.textContent = doneTasks.length;
}


function addTask(task) {
    tasks.push(task);
    saveTasks();
    renderTasks();
    showToast("Task added successfully");
}


function updateTask(updatedTask) {
    tasks = tasks.map(task => {
        if (task.id === updatedTask.id) {
            return updatedTask;
        }

        return task;
    });

    saveTasks();
    renderTasks();
    showToast("Task updated successfully");
}


function deleteTask(id) {
    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
    showToast("Task deleted");
}


function editTask(id) {
    const task = tasks.find(item => item.id === id);

    if (!task) {
        return;
    }

    taskId.value = task.id;
    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskPriority.value = task.priority;
    taskStatus.value = task.status;
    taskDue.value = task.due || "";

    formError.textContent = "";
    modalTitle.textContent = "Edit task";

    taskModal.classList.remove("hidden");
    taskTitle.focus();
}


taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskTitle.value.trim();

    if (title.length < 3) {
        formError.textContent = "Task title must be at least 3 characters.";
        taskTitle.focus();
        return;
    }

    const taskData = {
        id: taskId.value || createId(),
        title: title,
        description: taskDescription.value.trim(),
        priority: taskPriority.value,
        status: taskStatus.value,
        due: taskDue.value
    };

    if (taskId.value) {
        updateTask(taskData);
    } else {
        addTask(taskData);
    }

    closeModal();
});


openModalButton.addEventListener("click", () => {
    openModal();
});


closeModalButton.addEventListener("click", closeModal);


modalBackdrop.addEventListener("click", closeModal);


document.addEventListener("click", event => {
    const editButton = event.target.closest(".edit-btn");
    const deleteButton = event.target.closest(".delete-btn");
    const addButton = event.target.closest(".add-column-task");

    if (editButton) {
        editTask(editButton.dataset.id);
    }

    if (deleteButton) {
        deleteTask(deleteButton.dataset.id);
    }

    if (addButton) {
        openModal(addButton.dataset.addStatus);
    }
});


document.querySelectorAll(".board-column").forEach(column => {
    column.addEventListener("dragover", event => {
        event.preventDefault();
    });

    column.addEventListener("drop", event => {
        event.preventDefault();

        if (!draggedTaskId) {
            return;
        }

        const newStatus = column.dataset.status;
        const task = tasks.find(item => item.id === draggedTaskId);

        if (!task) {
            return;
        }

        if (task.status !== newStatus) {
            task.status = newStatus;

            saveTasks();
            renderTasks();
            showToast("Task moved");
        }
    });
});


document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !taskModal.classList.contains("hidden")) {
        closeModal();
    }
});


renderTasks();