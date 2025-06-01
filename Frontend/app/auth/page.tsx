"use client";

import type React from "react";
import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D4AF37] to-[#F5E8C7]">
      {/* Header */}
      <header className="bg-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo Section */}
          <a href="/" className="flex items-center">
            {/* MOBILE: แสดงข้อความ, DESKTOP: แสดงโลโก้รูป */}
            <div className="block sm:hidden">
              <h1 className="text-lg font-charm font-semibold text-gold-600">
                เบญจภัณฑ์ ๕
              </h1>
            </div>
            <div className="hidden sm:flex items-center">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 mr-2 sm:mr-3">
                <Image
                  src="/logo-bencharm.png"
                  alt="เบญจภัณฑ์๕"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-charm font-medium text-gold-600">
                  เบญจภัณฑ์ ๕
                </h1>
                <p className="text-xs text-brown-600">
                  ของดีมีศรัทธา เสริมบุญหนา วาสนาเปล่งประกาย
                </p>
              </div>
            </div>
          </a>
          <a href="#" className="text-gray-800 hover:underline">
            ต้องการความช่วยเหลือ?
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Side - Marketing Content */}
          <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
            <h1 className="text-4xl font-charm font-bold text-[#4A2C2A] mb-4">
              ยินดีต้อนรับสู่ระบบของเรา
            </h1>
            <p className="text-[#4A2C2A] text-lg mb-8 font-charm">
              เข้าสู่ระบบเพื่อสัมผัสประสบการณ์แห่งศรัทธาและความมงคล
            </p>
            <div className="relative w-full max-w-xs mx-auto lg:mx-0 p-6 rounded-lg aspect-square">
              <Image
                src="/loginPage.png"
                alt="Welcome Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md lg:w-[420px]">
            <div className="bg-white rounded-xl shadow-xl p-8">
              {/* Tabs for Login/Register */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`py-2 px-4 text-lg font-medium transition-colors duration-300 ${
                      activeTab === "login"
                        ? "text-[#D4AF37] border-b-2 border-[#D4AF37]"
                        : "text-gray-500 hover:text-[#D4AF37]"
                    }`}
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`py-2 px-4 text-lg font-medium transition-colors duration-300 ${
                      activeTab === "register"
                        ? "text-[#D4AF37] border-b-2 border-[#D4AF37]"
                        : "text-gray-500 hover:text-[#D4AF37]"
                    }`}
                  >
                    ลงทะเบียน
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div>
                {activeTab === "login" ? (
                  <div>
                    <h2 className="text-2xl font-semibold text-center text-[#4A2C2A] mb-6">
                      เข้าสู่ระบบ
                    </h2>
                    <LoginForm onSuccess={() => (window.location.href = "/")} />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-semibold text-center text-[#4A2C2A] mb-6">
                      ลงทะเบียน
                    </h2>
                    <RegisterForm onSuccess={() => setActiveTab("login")} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}