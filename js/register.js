document.addEventListener("DOMContentLoaded", () => {
  // Mock functions for demonstration purposes.  In a real application, these would be defined elsewhere (e.g., in a separate utility file) and imported.
  function isAuthenticated() {
    // Replace with actual authentication logic (e.g., checking for a token in local storage)
    return localStorage.getItem("token") !== null
  }

  function getCurrentUser() {
    // Replace with actual user retrieval logic (e.g., decoding the token)
    const userJson = localStorage.getItem("user")
    return userJson ? JSON.parse(userJson) : null
  }

  function registerUser(formData) {
    return new Promise((resolve, reject) => {
      // Simulate an API call
      setTimeout(() => {
        // Check if the email is already registered (for demonstration purposes)
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        if (users.find((user) => user.email === formData.email)) {
          reject(new Error("Email already registered."))
          return
        }

        // Simulate successful registration
        const newUser = {
          id: Date.now(), // Generate a unique ID
          ...formData,
        }
        users.push(newUser)
        localStorage.setItem("users", JSON.stringify(users))
        resolve()
      }, 500)
    })
  }

  function showToast(message, type) {
    // Create toast element
    const toast = document.createElement("div")
    toast.classList.add("toast")
    toast.classList.add(type) // 'success' or 'error'

    // Add message to toast
    toast.textContent = message

    // Add toast to document
    document.body.appendChild(toast)

    // Automatically remove the toast after a delay
    setTimeout(() => {
      toast.remove()
    }, 3000) // Adjust the delay as needed
  }

  // If user is already logged in, redirect to dashboard
  if (isAuthenticated()) {
    const currentUser = getCurrentUser()
    if (currentUser.role === "admin") {
      window.location.href = "admin.html"
    } else {
      window.location.href = "dashboard.html"
    }
    return
  }

  const registerForm = document.getElementById("register-form")
  const registerButton = document.getElementById("register-button")

  // Form validation
  function validateForm() {
    let isValid = true

    // Full Name validation
    const fullName = document.getElementById("fullName").value.trim()
    const fullNameError = document.getElementById("fullName-error")
    if (fullName.length < 2) {
      fullNameError.textContent = "Full name must be at least 2 characters"
      isValid = false
    } else {
      fullNameError.textContent = ""
    }

    // Email validation
    const email = document.getElementById("email").value.trim()
    const emailError = document.getElementById("email-error")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      emailError.textContent = "Please enter a valid email address"
      isValid = false
    } else {
      emailError.textContent = ""
    }

    // Password validation
    const password = document.getElementById("password").value
    const passwordError = document.getElementById("password-error")
    if (password.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters"
      isValid = false
    } else {
      passwordError.textContent = ""
    }

    // Confirm Password validation
    const confirmPassword = document.getElementById("confirmPassword").value
    const confirmPasswordError = document.getElementById("confirmPassword-error")
    if (password !== confirmPassword) {
      confirmPasswordError.textContent = "Passwords do not match"
      isValid = false
    } else {
      confirmPasswordError.textContent = ""
    }

    return isValid
  }

  // Handle form submission
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Disable button and show loading state
    registerButton.disabled = true
    registerButton.textContent = "Registering..."

    const formData = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      role: document.getElementById("role").value,
    }

    registerUser(formData)
      .then(() => {
        showToast("Registration successful! You can now log in.", "success")

        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = "login.html"
        }, 1500)
      })
      .catch((error) => {
        showToast(error.message || "Registration failed. Please try again.", "error")

        // Re-enable button
        registerButton.disabled = false
        registerButton.textContent = "Register"
      })
  })
})
