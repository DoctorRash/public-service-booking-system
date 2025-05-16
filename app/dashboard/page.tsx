"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchUserAppointments, createAppointment, cancelAppointment, type Appointment } from "@/lib/appointments"
import DashboardLayout from "@/components/dashboard-layout"

const appointmentSchema = z.object({
  ministry: z.string().min(1, "Please select a ministry"),
  serviceType: z.string().min(1, "Please select a service type"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

const ministries = [
  { id: "interior", name: "Ministry of Interior" },
  { id: "finance", name: "Ministry of Finance" },
  { id: "health", name: "Ministry of Health" },
  { id: "education", name: "Ministry of Education" },
  { id: "transport", name: "Ministry of Transport" },
]

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

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
]

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null)
  const [availableServices, setAvailableServices] = useState<{ id: string; name: string }[]>([])

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      ministry: "",
      serviceType: "",
      time: "",
    },
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const ministry = form.watch("ministry")
    if (ministry) {
      setSelectedMinistry(ministry)
      setAvailableServices(serviceTypes[ministry as keyof typeof serviceTypes] || [])
      form.setValue("serviceType", "")
    }
  }, [form.watch("ministry")])

  const loadAppointments = async () => {
    setIsLoading(true)
    try {
      const data = await fetchUserAppointments()
      setAppointments(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load appointments",
        description: "There was a problem loading your appointments. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: AppointmentFormValues) {
    setIsSubmitting(true)
    try {
      const ministryName = ministries.find((m) => m.id === data.ministry)?.name || ""
      const serviceName = availableServices.find((s) => s.id === data.serviceType)?.name || ""

      const newAppointment = await createAppointment({
        ...data,
        ministryName,
        serviceName,
      })

      setAppointments([...appointments, newAppointment])

      toast({
        title: "Appointment booked",
        description: `Your appointment has been successfully booked for ${format(data.date, "PPP")} at ${data.time}`,
      })

      form.reset({
        ministry: "",
        serviceType: "",
        time: "",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "There was a problem booking your appointment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment(id)
      setAppointments(appointments.filter((app) => app.id !== id))
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cancellation failed",
        description: "There was a problem cancelling your appointment. Please try again.",
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

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Book a New Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ministry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ministry</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a ministry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ministries.map((ministry) => (
                              <SelectItem key={ministry.id} value={ministry.id}>
                                {ministry.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMinistry}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={selectedMinistry ? "Select a service" : "Select a ministry first"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                date.getDay() === 0 ||
                                date.getDay() === 6
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="mt-4">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Appointment"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You don&apos;t have any appointments yet. Book one above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ministry</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.ministryName}</TableCell>
                        <TableCell>{appointment.serviceName}</TableCell>
                        <TableCell>{format(new Date(appointment.date), "PPP")}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                            )}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={appointment.status === "cancelled"}
                          >
                            Cancel
                          </Button>
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
