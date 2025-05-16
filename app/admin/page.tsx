"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAllAppointments, updateAppointmentStatus, type Appointment } from "@/lib/appointments"
import DashboardLayout from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user?.role !== "admin") {
        router.push("/dashboard")
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have permission to access the admin page.",
        })
      }
    }
  }, [authLoading, isAuthenticated, user, router, toast])

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      loadAppointments()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, dateFilter, appointments])

  const loadAppointments = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAllAppointments()
      setAppointments(data)
      setFilteredAppointments(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load appointments",
        description: "There was a problem loading appointments. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...appointments]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.userName.toLowerCase().includes(term) ||
          app.ministryName.toLowerCase().includes(term) ||
          app.serviceName.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (dateFilter === "today") {
        filtered = filtered.filter((app) => {
          const appDate = new Date(app.date)
          return appDate.toDateString() === today.toDateString()
        })
      } else if (dateFilter === "tomorrow") {
        filtered = filtered.filter((app) => {
          const appDate = new Date(app.date)
          return appDate.toDateString() === tomorrow.toDateString()
        })
      } else if (dateFilter === "upcoming") {
        filtered = filtered.filter((app) => {
          const appDate = new Date(app.date)
          return appDate > today
        })
      } else if (dateFilter === "past") {
        filtered = filtered.filter((app) => {
          const appDate = new Date(app.date)
          return appDate < today
        })
      }
    }

    setFilteredAppointments(filtered)
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)

      // Update local state
      const updatedAppointments = appointments.map((app) =>
        app.id === appointmentId ? { ...app, status: newStatus } : app,
      )

      setAppointments(updatedAppointments)

      toast({
        title: "Status updated",
        description: `Appointment status has been updated to ${newStatus}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating the appointment status. Please try again.",
      })
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Total: {appointments.length} appointments
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search by name, ministry or service..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments found matching your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Ministry</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.userName}</TableCell>
                        <TableCell>{appointment.ministryName}</TableCell>
                        <TableCell>{appointment.serviceName}</TableCell>
                        <TableCell>{format(new Date(appointment.date), "PPP")}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            defaultValue={appointment.status}
                            onValueChange={(value) => handleStatusChange(appointment.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirm</SelectItem>
                              <SelectItem value="cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
