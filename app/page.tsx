import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building2, Calendar, Clock, FileCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="container mx-auto py-6 px-4">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">PublicServe</h1>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Book Public Service Appointments Online</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Skip the lines and schedule your appointments with government agencies quickly and easily.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Multiple Ministries</CardTitle>
              <CardDescription>Access services across different government departments</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Easy Scheduling</CardTitle>
              <CardDescription>Choose dates and times that work for you</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Save Time</CardTitle>
              <CardDescription>No more waiting in long queues</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileCheck className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Track Status</CardTitle>
              <CardDescription>Monitor your appointment status in real-time</CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600 dark:text-gray-400">Register with your email and personal details</p>
            </div>

            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-600 dark:text-gray-400">Select ministry, service, date and time</p>
            </div>

            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Confirmation</h3>
              <p className="text-gray-600 dark:text-gray-400">Receive confirmation and reminders</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 PublicServe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
