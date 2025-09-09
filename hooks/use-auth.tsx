"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "user" | "reviewer"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (userData: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("[v0] Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format")
    }

    // Mock authentication - in real app, this would call your API
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      firstName: email.split("@")[0].split(".")[0] || "User",
      lastName: email.split("@")[0].split(".")[1] || "Account",
      role: email.includes("reviewer") ? "reviewer" : "user",
    }

    setUser(mockUser)
    localStorage.setItem("user", JSON.stringify(mockUser))

    // Redirect based on role
    if (mockUser.role === "reviewer") {
      router.push("/reviewer")
    } else {
      router.push("/dashboard")
    }
  }

  const signup = async (userData: any) => {
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      throw new Error("All fields are required")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      throw new Error("Invalid email format")
    }

    if (userData.password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "user", // Force user role for fraud victims only
    }

    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    router.push("/dashboard")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("activeCaseId")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
