import { v4 as uuidv4 } from "uuid"
import { getCurrentUser } from "./auth"

export type Appointment = {
  id: string
  userId: string
  userName: string
  ministry: string
  ministryName: string
  serviceType: string
  serviceName: string
  date: string | Date
  time: string
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string | Date
}

// Mock appointments database
const appointments: Appointment[] = [
  {
    id: "1",
    userId: "2",
    userName: "Regular User",
    ministry: "interior",
    ministryName: "Ministry of Interior",
    serviceType: "passport",
    serviceName: "Passport Application",
    date: new Date(Date.now() + 86400000 * 3), // 3 days from now
    time: "10:00 AM",
    status: "confirmed",
    createdAt: new Date(),
  },
  {
    id: "2",
    userId: "2",
    userName: "Regular User",
    ministry: "finance",
    ministryName: "Ministry of Finance",
    serviceType: "tax",
    serviceName: "Tax Filing",
    date: new Date(Date.now() + 86400000 * 7), // 7 days from now
    time: "11:30 AM",
    status: "pending",
    createdAt: new Date(),
  },
]

export async function fetchUserAppointments(): Promise<Appointment[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error("User not authenticated")
  }

  // Filter appointments for current user
  return appointments.filter((appointment) => appointment.userId === currentUser.id)
}

export async function fetchAllAppointments(): Promise<Appointment[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  return appointments
}

export async function createAppointment(data: {
  ministry: string
  ministryName: string
  serviceType: string
  serviceName: string
  date: Date
  time: string
}): Promise<Appointment> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error("User not authenticated")
  }

  const newAppointment: Appointment = {
    id: uuidv4(),
    userId: currentUser.id,
    userName: currentUser.fullName,
    ministry: data.ministry,
    ministryName: data.ministryName,
    serviceType: data.serviceType,
    serviceName: data.serviceName,
    date: data.date,
    time: data.time,
    status: "pending",
    createdAt: new Date(),
  }

  // In a real app, we would save to database
  appointments.push(newAppointment)

  return newAppointment
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error("User not authenticated")
  }

  const appointmentIndex = appointments.findIndex((a) => a.id === appointmentId)
  if (appointmentIndex === -1) {
    throw new Error("Appointment not found")
  }

  // Check if user owns this appointment or is admin
  const appointment = appointments[appointmentIndex]
  if (appointment.userId !== currentUser.id && currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Update appointment status
  appointments[appointmentIndex] = {
    ...appointment,
    status: "cancelled",
  }
}

export async function updateAppointmentStatus(appointmentId: string, newStatus: string): Promise<void> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const appointmentIndex = appointments.findIndex((a) => a.id === appointmentId)
  if (appointmentIndex === -1) {
    throw new Error("Appointment not found")
  }

  // Update appointment status
  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    status: newStatus as "pending" | "confirmed" | "cancelled",
  }
}
