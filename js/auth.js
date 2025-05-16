// Mock database for users and appointments
let users = [
  {
    id: "1",
    fullName: "Admin User",
    email: "admin@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "admin",
  },
  {
    id: "2",
    fullName: "Regular User",
    email: "user@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "user",
  },
]

let appointments = [
  {
    id: "1",
    userId: "2",
    userName: "Regular User",
    ministry: "interior",
    ministryName: "Ministry of Interior",
    serviceType: "passport",
    serviceName: "Passport Application",
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    time: "10:00 AM",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "2",
    userName: "Regular User",
    ministry: "finance",
    ministryName: "Ministry of Finance",
    serviceType: "tax",
    serviceName: "Tax Filing",
    date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    time: "11:30 AM",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
]

// Service types by ministry
const serviceTypes = {
  interior: [
    { id: "passport", name: "Passport Application" },
    { id: "id", name: "National ID Card" },
    { id: "residence", name: "Residence Permit" },
  ],
  finance: [
    { id: "tax", name: "Tax Filing" },
    { id: "business", name: "Business Registration" },
    { id: "customs", name: "Customs Declaration" },
  ],
  health: [
    { id: "vaccination", name: "Vaccination" },
    { id: "checkup", name: "Medical Checkup" },
    { id: "insurance", name: "Health Insurance" },
  ],
  education: [
    { id: "enrollment", name: "School Enrollment" },
    { id: "certificate", name: "Certificate Verification" },
    { id: "scholarship", name: "Scholarship Application" },
  ],
  transport: [
    { id: "license", name: "Driver's License" },
    { id: "vehicle", name: "Vehicle Registration" },
    { id: "permit", name: "Transport Permit" },
  ],
}

// Ministry names
const ministryNames = {
  interior: "Ministry of Interior",
  finance: "Ministry of Finance",
  health: "Ministry of Health",
  education: "Ministry of Education",
  transport: "Ministry of Transport",
}

// Auth functions
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if user already exists
      const existingUser = users.find((user) => user.email === userData.email)
      if (existingUser) {
        reject(new Error("User with this email already exists"))
        return
      }

      // Create new user
      const newUser = {
        id: String(users.length + 1),
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password, // In a real app, this would be hashed
        role: userData.role,
      }

      // Add to "database"
      users.push(newUser)

      // Save to localStorage for persistence
      localStorage.setItem("users", JSON.stringify(users))

      resolve(newUser)
    }, 1000)
  })
}

function loginUser(credentials) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Load users from localStorage if available
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        users = JSON.parse(storedUsers)
      }

      // Find user by email
      const user = users.find((user) => user.email === credentials.email)
      if (!user || user.password !== credentials.password) {
        reject(new Error("Invalid email or password"))
        return
      }

      // Generate token (mock)
      const token = `mock-jwt-token-${Date.now()}`

      // Store in localStorage
      localStorage.setItem("token", token)

      // Store user info (excluding password)
      const { password, ...userInfo } = user
      localStorage.setItem("currentUser", JSON.stringify(userInfo))

      resolve(userInfo)
    }, 1000)
  })
}

function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser")
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch (error) {
    console.error("Failed to parse user from localStorage", error)
    return null
  }
}

function isAuthenticated() {
  return !!localStorage.getItem("token") && !!getCurrentUser()
}

function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("currentUser")
}

// Appointment functions
function fetchUserAppointments() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        reject(new Error("User not authenticated"))
        return
      }

      // Load appointments from localStorage if available
      const storedAppointments = localStorage.getItem("appointments")
      if (storedAppointments) {
        appointments = JSON.parse(storedAppointments)
      }

      // Filter appointments for current user
      const userAppointments = appointments.filter((appointment) => appointment.userId === currentUser.id)
      resolve(userAppointments)
    }, 800)
  })
}

function fetchAllAppointments() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        reject(new Error("Unauthorized"))
        return
      }

      // Load appointments from localStorage if available
      const storedAppointments = localStorage.getItem("appointments")
      if (storedAppointments) {
        appointments = JSON.parse(storedAppointments)
      }

      resolve(appointments)
    }, 800)
  })
}

function createAppointment(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        reject(new Error("User not authenticated"))
        return
      }

      // Load appointments from localStorage if available
      const storedAppointments = localStorage.getItem("appointments")
      if (storedAppointments) {
        appointments = JSON.parse(storedAppointments)
      }

      // Create new appointment
      const newAppointment = {
        id: String(Date.now()),
        userId: currentUser.id,
        userName: currentUser.fullName,
        ministry: data.ministry,
        ministryName: ministryNames[data.ministry],
        serviceType: data.serviceType,
        serviceName: serviceTypes[data.ministry].find((s) => s.id === data.serviceType).name,
        date: data.date,
        time: data.time,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      // Add to "database"
      appointments.push(newAppointment)

      // Save to localStorage for persistence
      localStorage.setItem("appointments", JSON.stringify(appointments))

      resolve(newAppointment)
    }, 1000)
  })
}

function cancelAppointment(appointmentId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        reject(new Error("User not authenticated"))
        return
      }

      // Load appointments from localStorage if available
      const storedAppointments = localStorage.getItem("appointments")
      if (storedAppointments) {
        appointments = JSON.parse(storedAppointments)
      }

      const appointmentIndex = appointments.findIndex((a) => a.id === appointmentId)
      if (appointmentIndex === -1) {
        reject(new Error("Appointment not found"))
        return
      }

      // Check if user owns this appointment or is admin
      const appointment = appointments[appointmentIndex]
      if (appointment.userId !== currentUser.id && currentUser.role !== "admin") {
        reject(new Error("Unauthorized"))
        return
      }

      // Update appointment status
      appointments[appointmentIndex] = {
        ...appointment,
        status: "cancelled",
      }

      // Save to localStorage for persistence
      localStorage.setItem("appointments", JSON.stringify(appointments))

      resolve()
    }, 800)
  })
}

function updateAppointmentStatus(appointmentId, newStatus) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const currentUser = getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        reject(new Error("Unauthorized"))
        return
      }

      // Load appointments from localStorage if available
      const storedAppointments = localStorage.getItem("appointments")
      if (storedAppointments) {
        appointments = JSON.parse(storedAppointments)
      }

      const appointmentIndex = appointments.findIndex((a) => a.id === appointmentId)
      if (appointmentIndex === -1) {
        reject(new Error("Appointment not found"))
        return
      }

      // Update appointment status
      appointments[appointmentIndex] = {
        ...appointments[appointmentIndex],
        status: newStatus,
      }

      // Save to localStorage for persistence
      localStorage.setItem("appointments", JSON.stringify(appointments))

      resolve()
    }, 800)
  })
}

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  const toastMessage = toast.querySelector(".toast-message")
  const toastIcon = toast.querySelector(".toast-icon")

  toastMessage.textContent = message

  if (type === "success") {
    toastIcon.classList.remove("error")
    toastIcon.classList.add("success")
    toastIcon.classList.remove("fa-times-circle")
    toastIcon.classList.add("fa-check-circle")
  } else {
    toastIcon.classList.remove("success")
    toastIcon.classList.add("error")
    toastIcon.classList.remove("fa-check-circle")
    toastIcon.classList.add("fa-times-circle")
  }

  toast.classList.remove("hidden")

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.add("hidden")
  }, 3000)
}

// Check if user is authenticated and redirect if needed
function checkAuth() {
  if (!isAuthenticated()) {
    window.location.href = "login.html"
    return false
  }
  return true
}

// Check if user is admin and redirect if needed
function checkAdmin() {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "dashboard.html"
    return false
  }
  return true
}
