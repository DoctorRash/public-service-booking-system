import type { User } from "@/components/auth-provider"

// Mock user database
const users: User[] = [
  {
    id: "1",
    fullName: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "2",
    fullName: "Regular User",
    email: "user@example.com",
    role: "user",
  },
]

// In a real app, this would be a server-side function
export async function registerUser(userData: {
  fullName: string
  email: string
  password: string
  role: "user" | "admin"
}): Promise<User> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if user already exists
  const existingUser = users.find((user) => user.email === userData.email)
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Create new user
  const newUser: User = {
    id: String(users.length + 1),
    fullName: userData.fullName,
    email: userData.email,
    role: userData.role,
  }

  // In a real app, we would save to database
  users.push(newUser)

  return newUser
}

export async function loginUser(credentials: {
  email: string
  password: string
}): Promise<User> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find user by email
  const user = users.find((user) => user.email === credentials.email)
  if (!user) {
    throw new Error("Invalid email or password")
  }

  // In a real app, we would verify password here
  // For demo purposes, we'll just return the user

  // Generate JWT token (mock)
  const token = `mock-jwt-token-${Date.now()}`
  localStorage.setItem("token", token)

  return user
}

export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem("user")
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch (error) {
    console.error("Failed to parse user from localStorage", error)
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token") && !!getCurrentUser()
}
