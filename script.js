document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form")
    const tasksList = document.getElementById("tasks-list")
    const taskModal = document.getElementById("task-modal")
    const editTaskForm = document.getElementById("edit-task-form")
    const closeModal = document.querySelector(".close-modal")
    const filterButtons = document.querySelectorAll(".filter-btn")
    const quoteElement = document.getElementById("motivational-quote")
    const authorElement = document.getElementById("quote-author")
    const themeToggle = document.getElementById("theme-toggle")
  
    let currentFilter = "all"
  
    let tasks = JSON.parse(localStorage.getItem("tasks")) || []
  
    function loadTheme() {
      const savedTheme = localStorage.getItem("theme") || "light"
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  
    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute("data-theme")
      const newTheme = currentTheme === "light" ? "dark" : "light"
  
      document.documentElement.setAttribute("data-theme", newTheme)
      localStorage.setItem("theme", newTheme)
  
      showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`)
    }
  
    loadTheme()
    themeToggle.addEventListener("click", toggleTheme)
  
    const motivationalQuotes = [
      { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { quote: "The future depends on what you do today.", author: "Mahatma Gandhi" },
      {
        quote: "Your talent determines what you can do. Your motivation determines how much you're willing to do.",
        author: "Lou Holtz",
      },
      { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      {
        quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill",
      },
      { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
      { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
      { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
      { quote: "Small progress is still progress.", author: "Anonymous" },
      { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
      { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    ]
  
    function changeQuote() {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
      const { quote, author } = motivationalQuotes[randomIndex]
  
      quoteElement.style.opacity = 0
      authorElement.style.opacity = 0
  
      setTimeout(() => {
        quoteElement.textContent = `"${quote}"`
        authorElement.textContent = `- ${author}`
  
        quoteElement.style.opacity = 1
        authorElement.style.opacity = 1
      }, 500)
    }
  
    setInterval(changeQuote, 30000)
  
    renderTasks()
  
    taskForm.addEventListener("submit", addTask)
    editTaskForm.addEventListener("submit", updateTask)
    closeModal.addEventListener("click", closeTaskModal)
  
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => btn.classList.remove("active"))
        this.classList.add("active")
        currentFilter = this.dataset.filter
        renderTasks()
      })
    })
  
    function addTask(e) {
      e.preventDefault()
  
      const titleInput = document.getElementById("task-title")
      const descriptionInput = document.getElementById("task-description")
      const dueDateInput = document.getElementById("task-due-date")
      const dueTimeInput = document.getElementById("task-due-time")
  
      const dueDateTime = `${dueDateInput.value}T${dueTimeInput.value}`
  
      const newTask = {
        id: Date.now().toString(),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        dueDate: dueDateTime,
        completed: false,
        createdAt: new Date().toISOString(),
      }
  
      tasks.push(newTask)
      saveTasks()
      renderTasks()
  
      taskForm.reset()
  
      showNotification("Task added successfully!")
    }
  
    function renderTasks() {
      let filteredTasks = tasks
      if (currentFilter === "pending") {
        filteredTasks = tasks.filter((task) => !task.completed)
      } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter((task) => task.completed)
      }
  
      filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  
      if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
                  <div class="empty-state">
                      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMkMyIDE3LjUyIDYuNDggMjIgMTIgMjJDMTcuNTIgMjIgMjIgMTcuNTIgMjIgMTJDMjIgNi40OCAxNy41MiAyIDEyIDJaTTEyIDIwQzcuNTkgMjAgNCAxNi40MSA0IDEyQzQgNy41OSA3LjU5IDQgMTIgNEMxNi40MSA0IDIwIDcuNTkgMjAgMTJDMjAgMTYuNDEgMTYuNDEgMjAgMTIgMjBaTTYuNSA5TDEwIDE1LjUxTDEyLjUgMTJMMTcuNSAxOEg2LjVaIiBmaWxsPSIjZDFkMWQxIi8+PC9zdmc+" alt="No tasks" class="empty-icon">
                      <p>No ${currentFilter === "all" ? "" : currentFilter} tasks found.</p>
                  </div>
              `
        return
      }
  
      tasksList.innerHTML = filteredTasks
        .map((task) => {
          const dueDate = new Date(task.dueDate)
          const now = new Date()
          const isOverdue = !task.completed && dueDate < now
  
          const formattedDate = formatDate(dueDate)
          const formattedTime = dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  
          return `
                  <div class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
                      <div class="task-header">
                          <h3 class="task-title">${escapeHtml(task.title)}</h3>
                          <div class="task-actions">
                              <button class="task-btn complete" title="${task.completed ? "Mark as incomplete" : "Mark as complete"}">
                                  ${task.completed ? "↩" : "✓"}
                              </button>
                              <button class="task-btn edit" title="Edit task">✎</button>
                              <button class="task-btn delete" title="Delete task">×</button>
                          </div>
                      </div>
                      ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
                      <div class="task-due-date ${isOverdue ? "overdue" : ""}">
                          ${formattedDate} at ${formattedTime}${isOverdue ? " (Overdue)" : ""}
                      </div>
                  </div>
              `
        })
        .join("")
  
      document.querySelectorAll(".task-btn.complete").forEach((button) => {
        button.addEventListener("click", toggleTaskCompletion)
      })
  
      document.querySelectorAll(".task-btn.edit").forEach((button) => {
        button.addEventListener("click", openEditTaskModal)
      })
  
      document.querySelectorAll(".task-btn.delete").forEach((button) => {
        button.addEventListener("click", deleteTask)
      })
    }
  
    function toggleTaskCompletion() {
      const taskItem = this.closest(".task-item")
      const taskId = taskItem.dataset.id
      const task = tasks.find((t) => t.id === taskId)
  
      if (task) {
        task.completed = !task.completed
        saveTasks()
        renderTasks()
  
        showNotification(`Task marked as ${task.completed ? "completed" : "incomplete"}`)
      }
    }
  
    function openEditTaskModal() {
      const taskItem = this.closest(".task-item")
      const taskId = taskItem.dataset.id
      const task = tasks.find((t) => t.id === taskId)
  
      if (task) {
        const dueDate = new Date(task.dueDate)
  
        const formattedDate = dueDate.toISOString().split("T")[0]
        const formattedTime = dueDate.toTimeString().slice(0, 5)
  
        document.getElementById("edit-task-id").value = task.id
        document.getElementById("edit-task-title").value = task.title
        document.getElementById("edit-task-description").value = task.description
        document.getElementById("edit-task-due-date").value = formattedDate
        document.getElementById("edit-task-due-time").value = formattedTime
  
        taskModal.style.display = "flex"
      }
    }
  
    function closeTaskModal() {
      taskModal.style.display = "none"
    }
  
    function updateTask(e) {
      e.preventDefault()
  
      const taskId = document.getElementById("edit-task-id").value
      const taskIndex = tasks.findIndex((t) => t.id === taskId)
  
      if (taskIndex !== -1) {
        const dueDateInput = document.getElementById("edit-task-due-date").value
        const dueTimeInput = document.getElementById("edit-task-due-time").value
        const dueDateTime = `${dueDateInput}T${dueTimeInput}`
  
        tasks[taskIndex].title = document.getElementById("edit-task-title").value.trim()
        tasks[taskIndex].description = document.getElementById("edit-task-description").value.trim()
        tasks[taskIndex].dueDate = dueDateTime
  
        saveTasks()
        renderTasks()
        closeTaskModal()
  
        showNotification("Task updated successfully!")
      }
    }
  
    function deleteTask() {
      const taskItem = this.closest(".task-item")
      const taskId = taskItem.dataset.id
  
      taskItem.style.opacity = "0"
      taskItem.style.transform = "translateY(10px)"
  
      setTimeout(() => {
        tasks = tasks.filter((task) => task.id !== taskId)
        saveTasks()
        renderTasks()
  
        showNotification("Task deleted successfully!")
      }, 300)
    }
  
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  
    function formatDate(date) {
      const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" }
      return date.toLocaleDateString(undefined, options)
    }
  
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }
  
    function showNotification(message) {
      const notification = document.createElement("div")
      notification.className = "notification"
      notification.textContent = message
  
      document.body.appendChild(notification)
  
      setTimeout(() => {
        notification.style.opacity = "1"
        notification.style.transform = "translateY(0)"
      }, 10)
  
      setTimeout(() => {
        notification.style.opacity = "0"
        notification.style.transform = "translateY(10px)"
  
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 3000)
    }
  
    window.addEventListener("click", (event) => {
      if (event.target === taskModal) {
        closeTaskModal()
      }
    })
  
    document.querySelector(".modal-content").addEventListener("click", (event) => {
      event.stopPropagation()
    })
  })
  