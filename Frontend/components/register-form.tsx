"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getBaseUrl } from "@/lib/api";
interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/user/registerUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
        }),
        credentials: "include", // 👈 สำหรับ cookie-based auth ถ้ามี
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || "Registration failed";
        toast({ variant: "destructive", description: ` ${errorMsg}` });
        setError(errorMsg); // หรือโชว์ใน form
        return false;
      }

      return true;
    } catch (err) {
      console.error("❌ Register error:", err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      );
      if (success) {
        toast({ description: "✅ ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ" });
        if (onSuccess) onSuccess();
      } else {
        setError("❌ ลงทะเบียนไม่สำเร็จ");
      }
    } catch (err: any) {
      const msg = err?.message || "เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง";
      toast({ variant: "destructive", description: ` ${msg}` });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="first-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name
          </label>
          <input
            id="first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label
            htmlFor="last-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name
          </label>
          <input
            id="last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="register-phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone Number
        </label>
        <input
          id="register-phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={phoneNumber}
          onChange={(e) => {
            const input = e.target.value;
            const onlyNumbers = input.replace(/\D/g, "").slice(0, 10); // ลบทุกอย่างที่ไม่ใช่ตัวเลข แล้วตัดให้ไม่เกิน 10
            setPhoneNumber(onlyNumbers);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          required
          minLength={8}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          required
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-gold-600 hover:text-gold-700">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-gold-600 hover:text-gold-700">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="luxury"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </form>
  );
}
