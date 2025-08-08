document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const todoForm = document.getElementById("todoForm");
  const taskInput = document.getElementById("task");
  const dateInput = document.getElementById("date");
  const todoList = document.getElementById("todoList");
  const emptyState = document.getElementById("emptyState");
  const taskCountElement = document.getElementById("taskCount");
  const taskError = document.getElementById("taskError");
  const dateError = document.getElementById("dateError");

  // Filter buttons
  const filterAll = document.getElementById("filterAll");
  const filterActive = document.getElementById("filterActive");
  const filterCompleted = document.getElementById("filterCompleted");

  // Initialize todos array from localStorage or empty array
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  // Initialize the app
  updateTaskCount();
  renderTodoList();

  // Form submission
  todoForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Reset error messages
    taskError.classList.add("hidden");
    dateError.classList.add("hidden");

    // Validate inputs
    let isValid = true;

    if (taskInput.value.trim() === "") {
      taskError.classList.remove("hidden");
      isValid = false;
    }

    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!dateInput.value || selectedDate < today) {
      dateError.classList.remove("hidden");
      isValid = false;
    }

    if (!isValid) return;

    // Create new todo object
    const newTodo = {
      id: Date.now(),
      task: taskInput.value.trim(),
      date: dateInput.value,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Add to todos array
    todos.push(newTodo);

    // Save to localStorage
    localStorage.setItem("todos", JSON.stringify(todos));

    // Clear form
    taskInput.value = "";
    dateInput.value = "";

    // Update UI
    updateTaskCount();
    renderTodoList();

    // Show success message
    showToast("Task added successfully!");
  });

  // Filter todos
  filterAll.addEventListener("click", function () {
    setActiveFilter("all");
    renderTodoList();
  });

  filterActive.addEventListener("click", function () {
    setActiveFilter("active");
    renderTodoList();
  });

  filterCompleted.addEventListener("click", function () {
    setActiveFilter("completed");
    renderTodoList();
  });

  // Render todo list
  function renderTodoList() {
    // Clear current list
    todoList.innerHTML = "";

    // Get current filter
    const currentFilter = document
      .querySelector(".filter-btn.active")
      .id.replace("filter", "")
      .toLowerCase();

    // Filter todos based on current filter
    let filteredTodos = [];

    if (currentFilter === "all") {
      filteredTodos = [...todos];
    } else if (currentFilter === "active") {
      filteredTodos = todos.filter((todo) => !todo.completed);
    } else if (currentFilter === "completed") {
      filteredTodos = todos.filter((todo) => todo.completed);
    }

    // Sort by date
    filteredTodos.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Show empty state if no todos
    if (filteredTodos.length === 0) {
      todoList.classList.add("hidden");
      emptyState.classList.remove("hidden");

      // Customize empty state message based on filter
      if (currentFilter === "active") {
        emptyState.querySelector("h3").textContent = "No active tasks";
        emptyState.querySelector("p").textContent = "All tasks are completed!";
      } else if (currentFilter === "completed") {
        emptyState.querySelector("h3").textContent = "No completed tasks";
        emptyState.querySelector("p").textContent = "Complete some tasks!";
      } else {
        emptyState.querySelector("h3").textContent = "No tasks yet";
        emptyState.querySelector("p").textContent = "Add your first task!";
      }

      return;
    }

    // Hide empty state and show list
    emptyState.classList.add("hidden");
    todoList.classList.remove("hidden");

    // Render each todo
    filteredTodos.forEach((todo) => {
      const todoItem = document.createElement("div");
      todoItem.className = `todo-item bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500 ${
        todo.completed ? "opacity-70" : ""
      }`;

      const date = new Date(todo.date);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const daysLeft = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
      let dateStatus = "";

      if (daysLeft < 0) {
        dateStatus = `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Overdue</span>`;
      } else if (daysLeft === 0) {
        dateStatus = `<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Today</span>`;
      } else if (daysLeft === 1) {
        dateStatus = `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Tomorrow</span>`;
      } else if (daysLeft <= 7) {
        dateStatus = `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">In ${daysLeft} days</span>`;
      } else {
        dateStatus = `<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">${formattedDate}</span>`;
      }

      todoItem.innerHTML = `
                        <div class="flex items-start justify-between">
                            <div class="flex items-start space-x-3 flex-1">
                                <input type="checkbox" ${
                                  todo.completed ? "checked" : ""
                                } 
                                       class="custom-checkbox mt-1" 
                                       data-id="${todo.id}">
                                <div class="flex-1">
                                    <div class="flex items-center flex-wrap gap-2">
                                        <h3 class="font-medium ${
                                          todo.completed
                                            ? "line-through text-gray-500"
                                            : "text-gray-800"
                                        }">
                                            ${todo.task}
                                        </h3>
                                    </div>
                                    <div class="mt-1 flex items-center flex-wrap gap-2">
                                        <i class="fas fa-calendar-day text-gray-400 text-xs"></i>
                                        ${dateStatus}
                                    </div>
                                </div>
                            </div>
                            <button class="delete-btn text-gray-400 hover:text-red-500 transition" data-id="${
                              todo.id
                            }">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;

      todoList.appendChild(todoItem);
    });

    // Add event listeners to checkboxes and delete buttons
    document.querySelectorAll(".custom-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const id = parseInt(this.getAttribute("data-id"));
        toggleTodoStatus(id);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const id = parseInt(this.getAttribute("data-id"));
        deleteTodo(id);
      });
    });
  }

  // Toggle todo completion status
  function toggleTodoStatus(id) {
    todos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });

    localStorage.setItem("todos", JSON.stringify(todos));
    updateTaskCount();
    renderTodoList();

    const todo = todos.find((t) => t.id === id);
    const message = todo.completed
      ? "Task marked as completed!"
      : "Task marked as active";
    showToast(message);
  }

  // Delete todo
  function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    localStorage.setItem("todos", JSON.stringify(todos));
    updateTaskCount();
    renderTodoList();
    showToast("Task deleted successfully!");
  }

  // Update task count
  function updateTaskCount() {
    const activeTodos = todos.filter((todo) => !todo.completed).length;
    taskCountElement.textContent = activeTodos;
  }

  // Set active filter
  function setActiveFilter(filter) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active", "bg-indigo-600", "text-white");
      btn.classList.add("bg-white", "text-gray-700");
    });

    const activeBtn = document.getElementById(
      `filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`
    );
    activeBtn.classList.add("active", "bg-indigo-600", "text-white");
    activeBtn.classList.remove("bg-white", "text-gray-700");
  }

  // Show toast notification
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-fadeInOut";
    toast.innerHTML = `
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>${message}</span>
                `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-300");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
  dateInput.min = today;
});
