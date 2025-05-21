"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getBaseUrl } from "@/lib/api";

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  addresses?: string[] // Array of address IDs or objects
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
  setUser: (user: User) => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/user/me`, {
          method: "GET",
          credentials: "include", // ✅ ใช้ cookie-based auth
        });
  
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
  
        const data = await res.json();
        setUser(data.user); // <-- จาก backend ส่ง req.user กลับมา
      } catch (error) {
        setUser(null); // ถ้า token หมดอายุ หรือไม่มี cookie
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuth();
  }, []);
  

  // Save user to localStorage whenever it changes
  const logout = async () => {
    try {
      await fetch(`${getBaseUrl()}/api/user/logoutUser`, {
        method: "POST",
        credentials: "include", // ✅ cookie-based auth สำคัญ!
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null); // เคลียร์ context
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };
  

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/user/updateUser`, {
        method: "PATCH",
        credentials: "include", // ✅ ใช้ cookie-based auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      if (!res.ok) {
        console.error("Failed to update profile");
        return false;
      }
  
      const data = await res.json();
      console.log("✅ Profile updated:", data);
  
      // 🟢 Refresh context ด้วย user ใหม่ที่ได้จาก backend
      setUser(data.user); 
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };
  
  

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        updateProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

