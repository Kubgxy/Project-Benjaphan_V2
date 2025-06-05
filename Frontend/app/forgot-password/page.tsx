"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "@/components/footer";
import { getBaseUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

import { Mail, KeySquare, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [blockedTimeLeft, setBlockedTimeLeft] = useState<number>(0);

  const handleChangeDigit = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // รับแค่ตัวเลข

    const updatedDigits = [...otpDigits];
    updatedDigits[index] = value;
    setOtpDigits(updatedDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus(); // ไปช่องถัดไป
    }

    // รวมเป็น otp เดียว
    setOtp(updatedDigits.join(""));
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus(); // ถ้า backspace ช่องว่าง → ย้อนกลับ
    }
  };

  const handleRequestOtp = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setCanResendOtp(false); // ✅ ปิดปุ่มเมื่อเริ่มขอใหม่
    setLoading(true);
    try {
      const res = await axios.post(`${getBaseUrl()}/api/user/requestReset`, {
        email,
      });
      setRef(res.data.ref);
      setExpiresAt(res.data.expiresAt);
      toast({ title: "ส่ง OTP สำเร็จ", description: "โปรดตรวจสอบอีเมลของคุณ" });
      setStep(2);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "ส่ง OTP ล้มเหลว";

      if (msg.includes("ไม่เกิน 5 ครั้ง")) {
        const until = Date.now() + 15 * 60 * 1000; // บวก 15 นาที
        setBlockedUntil(until);
        setBlockedTimeLeft(15 * 60);
        toast({
          title: "จำกัดการขอ OTP",
          description: "คุณขอ OTP เกิน 5 ครั้งต่อชั่วโมง กรุณารอ 15 นาที",
          variant: "destructive",
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${getBaseUrl()}/api/user/verifyOtp`, {
        email,
        otp,
        ref,
      });
      toast({ title: "ยืนยัน OTP สำเร็จ" });
      setStep(3);
    } catch (error: any) {
      // ✅ ล้าง OTP เสมอเมื่อผิด
      setOtp("");
      setOtpDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();

      const msg = error?.response?.data?.message || "เกิดข้อผิดพลาด";

      // ✅ เงื่อนไขแสดง toast เฉพาะเจาะจง
      if (msg.includes("เกิน 5 ครั้ง")) {
        setCanResendOtp(true);
        toast({
          title: "กรอก OTP เกินกำหนด",
          description: "คุณกรอก OTP ผิดเกิน 5 ครั้ง กรุณาขอรหัสใหม่",
          variant: "destructive",
        });
      } else if (msg.includes("หมดอายุ")) {
        toast({
          title: "OTP หมดอายุ",
          description: "รหัส OTP ของคุณหมดอายุแล้ว กรุณาขอใหม่",
          variant: "destructive",
        });
      } else {
        toast({
          title: "OTP ไม่ถูกต้อง",
          description: "กรุณาตรวจสอบรหัสอีกครั้ง",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axios.post(`${getBaseUrl()}/api/user/resetPassword`, {
        email,
        newPassword,
        confirmPassword,
      });
      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "คุณสามารถเข้าสู่ระบบด้วยรหัสใหม่ได้แล้ว",
      });
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/auth");
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error?.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2 && ref && expiresAt) {
      const expiresAtTime = new Date(expiresAt).getTime(); // ✅ ใช้ state
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
        setTimeLeft(diff);
        if (diff === 0) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, ref, expiresAt]); // ✅ อย่าลืมใส่ expiresAt เป็น dependency

  useEffect(() => {
    if (!blockedUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((blockedUntil - now) / 1000));
      setBlockedTimeLeft(remaining);

      if (remaining <= 0) {
        setBlockedUntil(null);
        setBlockedTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 2 && otpDigits.every((d) => d !== "") && otp.length === 6) {
      handleVerifyOtp();
    }
  }, [otpDigits, otp, step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} นาที ${s} วินาที`;
  };

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
          <a href="/auth" className="text-gray-800 hover:underline">
            ย้อนกลับไปยังหน้าล็อกอิน
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-xl rounded-xl px-6 py-8">
          {step === 1 && (
            <div className="flex flex-col items-center text-center">
              {/* ไอคอนวงกลม */}
              <div className="bg-yellow-600 text-white w-40 h-40 rounded-full flex items-center justify-center shadow-lg  mb-4">
                <Mail className="w-16 h-16" />
              </div>

              {/* หัวข้อ */}
              <h2 className="text-2xl text-yellow-600 mb-6">
                กรุณากรอกอีเมลของท่าน?
              </h2>

              {/* กล่องกรอกอีเมล */}
              <div className="w-full max-w-sm space-y-4">
                <Input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-[#3F51B5] focus:ring-[#3F51B5]"
                />
                {blockedTimeLeft > 0 && (
                  <div className="text-red-600 text-sm mt-2">
                    ⏳ คุณไม่สามารถขอ OTP ได้ในขณะนี้ กรุณารออีก{" "}
                    {formatTime(blockedTimeLeft)}
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    onClick={() => router.push("/auth")}
                    disabled={loading || resendCooldown > 0 || blockedTimeLeft > 0}
                    className="bg-gray-400 text-white px-6 py-3 font-bold hover:bg-gray-500 transition-colors w-full"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="bg-yellow-500 text-white px-6 py-3 font-bold hover:bg-yellow-600 transition-colors w-full"
                  >
                    {loading ? "กำลังส่ง..." : "ยืนยัน"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center space-y-6">
              {/* ไอคอน */}
              <div className="bg-yellow-600 text-white w-40 h-40 rounded-full flex items-center justify-center shadow-lg">
                <KeySquare className="w-16 h-16" />
              </div>

              {/* หัวข้อ */}
              <h2 className="text-2xl text-yellow-600  text-center">
                กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ
              </h2>

              {/* ช่องกรอก OTP */}
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => void (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl border-2 border-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    value={digit}
                    onChange={(e) => handleChangeDigit(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>

              {blockedTimeLeft > 0 && (
                <div className="text-red-600 text-sm mt-2">
                  🚫 ถูกจำกัดการขอ OTP กรุณารออีก {formatTime(blockedTimeLeft)}
                </div>
              )}

              {/* Ref Code + Countdown */}
              <div className="text-center space-y-1">
                <div className="text-sm text-red-700">
                  เช็คอีเมลของคุณเพื่อรับรหัส OTP
                </div>
                <div className="text-sm text-gray-700">
                  Ref Code ของคุณ:{" "}
                  <span className="text-[#D4AF37] font-semibold">{ref}</span>
                </div>
                {timeLeft > 0 ? (
                  <div className="text-xs text-gray-500">
                    ⏳ รหัสจะหมดอายุใน {formatTime(timeLeft)}
                  </div>
                ) : (
                  <div className="text-xs text-red-600 font-semibold">
                    ❌ รหัส OTP หมดอายุแล้ว กรุณาขอใหม่
                  </div>
                )}
              </div>

              {(timeLeft === 0 || canResendOtp) && (
                <button
                  onClick={handleRequestOtp}
                  className="mt-2 text-sm text-yellow-600 hover:underline hover:text-yellow-700 transition"
                  disabled={loading}
                >
                  🔁 ขอรหัส OTP ใหม่
                </button>
              )}

              {/* ปุ่มยืนยัน */}
              <div className="w-full">
                <Button
                  className="w-full bg-[#D4AF37] text-white font-bold"
                  onClick={handleVerifyOtp}
                  disabled={loading || timeLeft === 0}
                >
                  {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-6">
              {/* ไอคอน */}
              <div className="bg-yellow-600 text-white w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-14 h-14 sm:w-16 sm:h-16" />
              </div>

              {/* หัวข้อ */}
              <h2 className="text-2xl sm:text-2xl text-yellow-600 font-semibold">
                กรุณาตั้งรหัสผ่านใหม่ของคุณ
              </h2>

              {/* ฟอร์มตั้งรหัสผ่าน */}
              <div className="w-full max-w-sm space-y-4 text-left">
                <Input
                  type="password"
                  placeholder="รหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-base"
                />
                <Input
                  type="password"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-base"
                />
                <Button
                  className="w-full bg-[#D4AF37] text-white font-bold py-2 text-base"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? "กำลังตั้งรหัส..." : "ตั้งรหัสผ่านใหม่"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
