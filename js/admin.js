document.addEventListener("DOMContentLoaded", () => {
  // Mock functions (replace with your actual implementation)
  function checkAuth() {
    // Replace with your authentication logic
    return true // Example: Assume user is always authenticated
  }

  function checkAdmin() {
    // Replace with your admin check logic
    return true // Example: Assume user is always an admin
  }

  function getCurrentUser() {
    // Replace with your user retrieval logic
    return {
      fullName: "Admin User",
      role: "admin",
    }
  }

  function fetchAllAppointments() {
    // Replace with your API call to fetch appointments
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAppointments = [
          {
            id: "1",
            userName: "John Doe",
            ministryName: "Healthcare",
            serviceName: "Consultation",
            date: "2024-07-20",
            time: "10:00",
            status: "pending",
          },
          {
            id: "2",
            userName: "Jane Smith",
            ministryName: "Education",
            serviceName: "Tutoring",
            date: "2024-07-21",
            time: "14:00",
            status: "confirmed",
          },
          {
            id: "3",
            userName: "Peter Jones",
            ministryName: "Finance",
            serviceName: "Investment Advice",
            date: "2024-07-19",
            time: "16:00",
            status: "cancelled",
          },
          {
            id: "4",
            userName: "Alice Brown",
            ministryName: "Technology",
            serviceName: "Software Development",
            date: "2024-07-22",
            time: "09:00",
            status: "pending",
          },
          {
            id: "5",
            userName: "Bob Williams",
            ministryName: "Marketing",
            serviceName: "Campaign Management",
            date: "2024-07-23",
            time: "11:00",
            status: "confirmed",
          },
        ]
        resolve(mockAppointments)
      }, 500)
    })
  }

  function updateAppointmentStatus(appointmentId, newStatus) {
    // Replace with your API call to update appointment status
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success
        console.log(`Appointment ${appointmentId} status updated to ${newStatus}`)
        resolve()
        // Simulate error
        // reject(new Error('Failed to update status'));
      }, 500)
    })
  }

  function showToast(message, type = "success") {
    // Replace with your toast notification implementation
    console.log(`Toast: ${message} (${type})`)
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0") // Month is 0-indexed
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  function logout() {
    // Replace with your logout logic
    console.log("User logged out")
  }
  // Check if user is authenticated and is admin
  if (!checkAuth() || !checkAdmin()) return

  // Get current user
  const currentUser = getCurrentUser()

  // Update user info in sidebar and header
  document.getElementById("user-name").textContent = currentUser.fullName
  document.getElementById("user-role").textContent =
    currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
  document.getElementById("header-user-name").textContent = currentUser.fullName

  // Store all appointments for filtering
  let allAppointments = []

  // Load all appointments
  function loadAppointments() {
    const appointmentsLoading = document.getElementById("admin-appointments-loading")
    const noAppointments = document.getElementById("no-admin-appointments")
    const appointmentsTableContainer = document.getElementById("admin-appointments-table-container")
    const totalAppointmentsElement = document.getElementById("total-appointments")

    // Show loading
    appointmentsLoading.classList.remove("hidden")
    noAppointments.classList.add("hidden")
    appointmentsTableContainer.classList.add("hidden")

    fetchAllAppointments()
      .then((appointments) => {
        // Store appointments for filtering
        allAppointments = appointments

        // Update total count
        totalAppointmentsElement.textContent = `Total: ${appointments.length} appointments`

        // Apply filters
        applyFilters()

        // Hide loading
        appointmentsLoading.classList.add("hidden")
      })
      .catch((error) => {
        // Hide loading
        appointmentsLoading.classList.add("hidden")

        showToast(error.message || "Failed to load appointments. Please try again.", "error")
      })
  }

  // Apply filters to appointments
  function applyFilters() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase()
    const statusFilter = document.getElementById("status-filter").value
    const dateFilter = document.getElementById("date-filter").value

    const appointmentsTableBody = document.getElementById("admin-appointments-table-body")
    const noAppointments = document.getElementById("no-admin-appointments")
    const appointmentsTableContainer = document.getElementById("admin-appointments-table-container")

    // Apply filters
    let filteredAppointments = [...allAppointments]

    // Apply search filter
    if (searchTerm) {
      filteredAppointments = filteredAppointments.filter(
        (app) =>
          app.userName.toLowerCase().includes(searchTerm) ||
          app.ministryName.toLowerCase().includes(searchTerm) ||
          app.serviceName.toLowerCase().includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredAppointments = filteredAppointments.filter((app) => app.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (dateFilter === "today") {
        filteredAppointments = filteredAppointments.filter((app) => {
          const appDate = new Date(app.date)
          appDate.setHours(0, 0, 0, 0)
          return appDate.getTime() === today.getTime()
        })
      } else if (dateFilter === "tomorrow") {
        filteredAppointments = filteredAppointments.filter((app) => {
          const appDate = new Date(app.date)
          appDate.setHours(0, 0, 0, 0)
          return appDate.getTime() === tomorrow.getTime()
        })
      } else if (dateFilter === "upcoming") {
        filteredAppointments = filteredAppointments.filter((app) => {
          const appDate = new Date(app.date)
          return appDate > today
        })
      } else if (dateFilter === "past") {
        filteredAppointments = filteredAppointments.filter((app) => {
          const appDate = new Date(app.date)
          appDate.setHours(23, 59, 59, 999)
          return appDate < today
        })
      }
    }

    // Update UI based on filtered appointments
    if (filteredAppointments.length === 0) {
      noAppointments.classList.remove("hidden")
      appointmentsTableContainer.classList.add("hidden")
      return
    }

    // Show table
    noAppointments.classList.add("hidden")
    appointmentsTableContainer.classList.remove("hidden")

    // Clear table
    appointmentsTableBody.innerHTML = ""

    // Add appointments to table
    filteredAppointments.forEach((appointment) => {
      const row = document.createElement("tr")

      // Format date
      const appointmentDate = formatDate(appointment.date)

      // Create status badge class
      const statusClass = `status-badge status-${appointment.status}`

      // Create row content
      row.innerHTML = `
                <td>${appointment.userName}</td>
                <td>${appointment.ministryName}</td>
                <td>${appointment.serviceName}</td>
                <td>${appointmentDate}</td>
                <td>${appointment.time}</td>
                <td><span class="${statusClass}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></td>
                <td>
                    <select class="status-select" data-id="${appointment.id}">
                        <option value="pending" ${appointment.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="confirmed" ${appointment.status === "confirmed" ? "selected" : ""}>Confirm</option>
                        <option value="cancelled" ${appointment.status === "cancelled" ? "selected" : ""}>Cancel</option>
                    </select>
                </td>
            `

      appointmentsTableBody.appendChild(row)
    })

    // Add event listeners to status selects
    document.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", function () {
        const appointmentId = this.getAttribute("data-id")
        const newStatus = this.value

        updateAppointmentStatus(appointmentId, newStatus)
          .then(() => {
            showToast(`Appointment status updated to ${newStatus}`, "success")

            // Update appointment in allAppointments
            const appointmentIndex = allAppointments.findIndex((a) => a.id === appointmentId)
            if (appointmentIndex !== -1) {
              allAppointments[appointmentIndex].status = newStatus
            }
          })
          .catch((error) => {
            showToast(error.message || "Failed to update appointment status. Please try again.", "error")

            // Reset select to original value
            this.value = allAppointments.find((a) => a.id === appointmentId).status
          })
      })
    })
  }

  // Add event listeners to filter inputs
  document.getElementById("search-input").addEventListener("input", applyFilters)
  document.getElementById("status-filter").addEventListener("change", applyFilters)
  document.getElementById("date-filter").addEventListener("change", applyFilters)

  // Load appointments on page load
  loadAppointments()

  // Handle mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const closeSidebarButton = document.getElementById("close-sidebar")
  const sidebar = document.getElementById("sidebar")

  mobileMenuButton.addEventListener("click", () => {
    sidebar.classList.add("active")
  })

  closeSidebarButton.addEventListener("click", () => {
    sidebar.classList.remove("active")
  })

  // Handle user dropdown toggle
  const userDropdownButton = document.getElementById("user-dropdown-button")
  const userDropdownMenu = document.getElementById("user-dropdown-menu")

  userDropdownButton.addEventListener("click", () => {
    userDropdownMenu.classList.toggle("active")
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!userDropdownButton.contains(e.target) && !userDropdownMenu.contains(e.target)) {
      userDropdownMenu.classList.remove("active")
    }
  })

  // Handle theme toggle
  const themeToggle = document.getElementById("theme-toggle")
  const themeIcon = themeToggle.querySelector("i")

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode")
    themeIcon.classList.remove("fa-moon")
    themeIcon.classList.add("fa-sun")
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode")

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark")
      themeIcon.classList.remove("fa-moon")
      themeIcon.classList.add("fa-sun")
    } else {
      localStorage.setItem("theme", "light")
      themeIcon.classList.remove("fa-sun")
      themeIcon.classList.add("fa-moon")
    }
  })

  // Handle logout
  const logoutButton = document.getElementById("logout-button")

  logoutButton.addEventListener("click", () => {
    logout()
    window.location.href = "login.html"
  })
})
