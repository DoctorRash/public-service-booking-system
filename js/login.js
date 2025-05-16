document.addEventListener("DOMContentLoaded", () => {
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

  const loginForm = document.getElementById("login-form")
  const loginButton = document.getElementById("login-button")

  // Form validation
  function validateForm() {
    let isValid = true

    // Email validation
    const email = document.getElementById("email").value.trim()
    const emailError = document.getElementById("email-error")
    if (!email) {
      emailError.textContent = "Email is required"
      isValid = false
    } else {
      emailError.textContent = ""
    }

    // Password validation
    const password = document.getElementById("password").value
    const passwordError = document.getElementById("password-error")
    if (!password) {
      passwordError.textContent = "Password is required"
      isValid = false
    } else {
      passwordError.textContent = ""
    }

    return isValid
  }

  // Handle form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Disable button and show loading state
    loginButton.disabled = true
    loginButton.textContent = "Logging in..."

    const credentials = {
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
    }

    loginUser(credentials)
      .then((user) => {
        showToast("Login successful! Redirecting...", "success")

        // Redirect based on user role
        setTimeout(() => {
          if (user.role === "admin") {
            window.location.href = "admin.html"
          } else {
            window.location.href = "dashboard.html"
          }
        }, 1500)
      })
      .catch((error) => {
        showToast(error.message || "Login failed. Please check your credentials.", "error")

        // Re-enable button
        loginButton.disabled = false
        loginButton.textContent = "Log in"
      })
  })
})

// Mock functions for demonstration purposes.  In a real application, these would be defined elsewhere.
function isAuthenticated() {
  // Replace with actual authentication logic
  return false
}

function getCurrentUser() {
  // Replace with actual user retrieval logic
  return { role: "user" }
}

function loginUser(credentials) {
  // Replace with actual login logic
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === "test@example.com" && credentials.password === "password") {
        resolve({ role: "user" })
      } else if (credentials.email === "admin@example.com" && credentials.password === "admin") {
        resolve({ role: "admin" })
      } else {
        reject(new Error("Invalid credentials"))
      }
    }, 500)
  })
}

function showToast(message, type) {
  // Replace with actual toast notification logic
  console.log(`Toast: ${message} (${type})`)
}
