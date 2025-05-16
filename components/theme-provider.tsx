"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "system",
  setTheme: () => {},
})

export function ThemeProvider({
  children,
  attribute,
  defaultTheme,
  enableSystem,
}: {
  children: React.ReactNode
  attribute: string
  defaultTheme: Theme
  enableSystem: boolean
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
    } else if (enableSystem) {
      setTheme(getSystemTheme())
    }
  }, [enableSystem])

  useEffect(() => {
    if (enableSystem) {
      setTheme(getSystemTheme())
    }
  }, [enableSystem])

  useEffect(() => {
    if (theme === "system") {
      const systemTheme = getSystemTheme()
      document.documentElement.setAttribute(attribute, systemTheme)
    } else if (theme) {
      document.documentElement.setAttribute(attribute, theme)
    }
    localStorage.setItem("theme", theme)
  }, [theme, attribute])

  const getSystemTheme = (): Theme => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
