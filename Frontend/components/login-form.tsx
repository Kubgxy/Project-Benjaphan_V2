"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { showSuccess, showError } from "@/lib/swal";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/use-toast";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { getBaseUrl } from "@/lib/api";

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const login = async (email: string, password: string): Promise<"customer" | "admin" | null> => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/user/loginUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ✅ สำคัญมาก!
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
  
      // ✅ ดึง role ที่ Backend ส่งกลับมา
      return data.user.role as "customer" | "admin";
    } catch (error) {
      console.error("❌ Login error:", error);
      return null;
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      const role = await login(email, password);
  
      if (!role) {
        showError("เข้าสู่ระบบไม่สําเร็จ!");
        return;
      }
  
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับมา!",
        variant: "default",
      });
  
      if (role === "customer") {
        window.location.href = "http://localhost:5173/";
      } else if (role === "admin") {
        window.location.href = "http://localhost:5174/";
      } else {
      }
    } catch (err) {
      showError("กรุณาลองอีกครั้ง!");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          required
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          required
        />
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="mb-4">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
          <a href="#" className="ml-auto text-sm text-gold-600 hover:text-gold-700">
            Forgot password?
          </a>
        </div>
      </div>

      <div>
        <Button type="submit" variant="luxury" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>

      <hr className="my-4"></hr>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => {
            window.location.href = `${getBaseUrl()}/api/auth/start-google-login`;
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 hover:bg-gray-100 transition"
        >
          <FcGoogle size={20} />
          <span className="text-sm font-medium text-gray-700">Login with Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = `${getBaseUrl()}/api/auth/start-facebook-login`;
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 py-2 hover:bg-blue-700 transition"
        >
          <FaFacebook size={20} className="text-white" />
          <span className="text-sm font-medium text-white">Login with Facebook</span>
        </button>
      </div>
    </form>
    
  )
}

