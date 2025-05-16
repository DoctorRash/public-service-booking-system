document.addEventListener("DOMContentLoaded", () => {
  // Check if user is authenticated
  if (!checkAuth()) return

  // Get current user
  const currentUser = getCurrentUser()

  // Update user info in sidebar and header
  document.getElementById("user-name").textContent = currentUser.fullName
  document.getElementById("user-role").textContent =
    currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
  document.getElementById("header-user-name").textContent = currentUser.fullName

  // Initialize date picker
  flatpickr("#date", {
    minDate: "today",
    disable: [
      (date) => {
        // Disable weekends
        return date.getDay() === 0 || date.getDay() === 6
      },
    ],
    dateFormat: "Y-m-d",
  })

  // Handle ministry selection to update service types
  const ministrySelect = document.getElementById("ministry")
  const serviceTypeSelect = document.getElementById("serviceType")

  ministrySelect.addEventListener("change", function () {
    const selectedMinistry = this.value

    // Clear current options
    serviceTypeSelect.innerHTML = '<option value="" disabled selected>Select a service</option>'

    // Enable select
    serviceTypeSelect.disabled = false

    // Add new options based on selected ministry
    if (selectedMinistry && serviceTypes[selectedMinistry]) {
      serviceTypes[selectedMinistry].forEach((service) => {
        const option = document.createElement("option")
        option.value = service.id
        option.textContent = service.name
        serviceTypeSelect.appendChild(option)
      })
    }
  })

  // Handle appointment form submission
  const appointmentForm = document.getElementById("appointment-form")
  const bookButton = document.getElementById("book-button")
  const bookButtonText = document.getElementById("book-button-text")
  const bookButtonLoading = document.getElementById("book-button-loading")

  appointmentForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Validate form
    let isValid = true
    const ministry = document.getElementById("ministry").value
    const serviceType = document.getElementById("serviceType").value
    const date = document.getElementById("date").value
    const time = document.getElementById("time").value

    if (!ministry) {
      document.getElementById("ministry-error").textContent = "Please select a ministry"
      isValid = false
    } else {
      document.getElementById("ministry-error").textContent = ""
    }

    if (!serviceType) {
      document.getElementById("serviceType-error").textContent = "Please select a service type"
      isValid = false
    } else {
      document.getElementById("serviceType-error").textContent = ""
    }

    if (!date) {
      document.getElementById("date-error").textContent = "Please select a date"
      isValid = false
    } else {
      document.getElementById("date-error").textContent = ""
    }

    if (!time) {
      document.getElementById("time-error").textContent = "Please select a time slot"
      isValid = false
    } else {
      document.getElementById("time-error").textContent = ""
    }

    if (!isValid) return

    // Show loading state
    bookButton.disabled = true
    bookButtonText.classList.add("hidden")
    bookButtonLoading.classList.remove("hidden")

    // Create appointment
    createAppointment({
      ministry,
      serviceType,
      date,
      time,
    })
      .then(() => {
        showToast("Appointment booked successfully!", "success")

        // Reset form
        appointmentForm.reset()
        serviceTypeSelect.disabled = true
        serviceTypeSelect.innerHTML = '<option value="" disabled selected>Select a ministry first</option>'

        // Reload appointments
        loadAppointments()

        // Reset button state
        bookButton.disabled = false
        bookButtonText.classList.remove("hidden")
        bookButtonLoading.classList.add("hidden")
      })
      .catch((error) => {
        showToast(error.message || "Failed to book appointment. Please try again.", "error")

        // Reset button state
        bookButton.disabled = false
        bookButtonText.classList.remove("hidden")
        bookButtonLoading.classList.add("hidden")
      })
  })

  // Load user appointments
  function loadAppointments() {
    const appointmentsLoading = document.getElementById("appointments-loading")
    const noAppointments = document.getElementById("no-appointments")
    const appointmentsTableContainer = document.getElementById("appointments-table-container")
    const appointmentsTableBody = document.getElementById("appointments-table-body")

    // Show loading
    appointmentsLoading.classList.remove("hidden")
    noAppointments.classList.add("hidden")
    appointmentsTableContainer.classList.add("hidden")

    fetchUserAppointments()
      .then((appointments) => {
        // Hide loading
        appointmentsLoading.classList.add("hidden")

        if (appointments.length === 0) {
          noAppointments.classList.remove("hidden")
          return
        }

        // Show table
        appointmentsTableContainer.classList.remove("hidden")

        // Clear table
        appointmentsTableBody.innerHTML = ""

        // Add appointments to table
        appointments.forEach((appointment) => {
          const row = document.createElement("tr")

          // Format date
          const appointmentDate = formatDate(appointment.date)

          // Create status badge class
          const statusClass = `status-badge status-${appointment.status}`

          // Create row content
          row.innerHTML = `
                        <td>${appointment.ministryName}</td>
                        <td>${appointment.serviceName}</td>
                        <td>${appointmentDate}</td>
                        <td>${appointment.time}</td>
                        <td><span class="${statusClass}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></td>
                        <td>
                            <button class="btn btn-danger btn-sm cancel-appointment" data-id="${appointment.id}" ${appointment.status === "cancelled" ? "disabled" : ""}>
                                Cancel
                            </button>
                        </td>
                    `

          appointmentsTableBody.appendChild(row)
        })

        // Add event listeners to cancel buttons
        document.querySelectorAll(".cancel-appointment").forEach((button) => {
          button.addEventListener("click", function () {
            const appointmentId = this.getAttribute("data-id")
            showCancelConfirmation(appointmentId)
          })
        })
      })
      .catch((error) => {
        // Hide loading
        appointmentsLoading.classList.add("hidden")

        showToast(error.message || "Failed to load appointments. Please try again.", "error")
      })
  }

  // Show cancel confirmation modal
  function showCancelConfirmation(appointmentId) {
    const modal = document.getElementById("confirm-modal")
    const cancelYesButton = document.getElementById("cancel-yes")
    const cancelNoButton = document.getElementById("cancel-no")
    const closeModalButton = document.getElementById("close-modal")

    // Show modal
    modal.classList.remove("hidden")

    // Handle confirmation
    function handleConfirm() {
      // Cancel appointment
      cancelAppointment(appointmentId)
        .then(() => {
          showToast("Appointment cancelled successfully!", "success")

          // Reload appointments
          loadAppointments()

          // Hide modal
          modal.classList.add("hidden")
        })
        .catch((error) => {
          showToast(error.message || "Failed to cancel appointment. Please try again.", "error")

          // Hide modal
          modal.classList.add("hidden")
        })

      // Remove event listeners
      cancelYesButton.removeEventListener("click", handleConfirm)
      cancelNoButton.removeEventListener("click", handleCancel)
      closeModalButton.removeEventListener("click", handleCancel)
    }

    // Handle cancellation
    function handleCancel() {
      // Hide modal
      modal.classList.add("hidden")

      // Remove event listeners
      cancelYesButton.removeEventListener("click", handleConfirm)
      cancelNoButton.removeEventListener("click", handleCancel)
      closeModalButton.removeEventListener("click", handleCancel)
    }

    // Add event listeners
    cancelYesButton.addEventListener("click", handleConfirm)
    cancelNoButton.addEventListener("click", handleCancel)
    closeModalButton.addEventListener("click", handleCancel)
  }

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

// Mock functions (replace with your actual implementations)
function showToast(message, type) {
  console.log(`Toast: ${message} (${type})`)
}

function fetchUserAppointments() {
  return Promise.resolve([]) // Replace with actual data fetching
}

function formatDate(dateString) {
  return dateString // Replace with actual date formatting
}

function cancelAppointment(appointmentId) {
  return Promise.resolve() // Replace with actual cancellation logic
}

function logout() {
  console.log("Logging out...")
}
