"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getBaseUrl } from "@/lib/api";

export default function ContactPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // ✅ โหลดโปรไฟล์ตอนเข้า page เลย
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/user/getUserProfile`, {
          withCredentials: true,
        });
        if (res.data?.user) {
          console.log("✅ Profile Data:", res.data.user);
          setIsLoggedIn(true);
          setFormData((prev) => ({
            ...prev,
            name: `${res.data.user.firstName || ""} ${
              res.data.user.lastName || ""
            }`.trim(),
            email: res.data.user.email || "",
            phone: res.data.user.phoneNumber || "",
          }));
        }
      } catch (err) {
        console.log("🔻 ไม่ได้ล็อกอิน");
        setIsLoggedIn(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;

      if (isLoggedIn) {
        // 🔥 สมาชิก ยิง API ของสมาชิก (ส่งแค่ subject, message)
        response = await axios.post(
          `${getBaseUrl()}/api/contact/createContactByMember`,
          {
            subject: formData.subject,
            message: formData.message,
          },
          { withCredentials: true }
        );
      } else {
        // 👤 ผู้เยี่ยมชม ยิง API เดิม
        const { name, email, phone, subject, message } = formData;
        response = await axios.post(
          `${getBaseUrl()}/api/contact/createContact`,
          { name, email, phone, subject, message },
          { withCredentials: true }
        );
      }

      Swal.fire({
        icon: "success",
        title: "ส่งข้อความสำเร็จ",
        text: response.data.message,
      });

      // ✅ รีเซ็ตฟอร์ม
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));

      if (!isLoggedIn) {
        // ผู้เยี่ยมชม รีเซ็ตทั้งหมด
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถส่งข้อความได้",
      });
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      {/* Hero Banner */}
      <div className="relative bg-gold-600 text-white py-24">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-center mb-4">
            ติดต่อเรา
          </h1>
          <p className="text-center text-white/90 max-w-2xl mx-auto">
            มีคำถามหรือต้องการคำแนะนำ? เราพร้อมให้บริการและตอบทุกคำถามของคุณ
          </p>
        </div>
        <div className="absolute inset-0 opacity-15 lotus-pattern"></div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-heading font-medium text-brown-800 mb-6">
                ข้อมูลการติดต่อ
              </h2>
              <p className="text-brown-600 mb-8">
                หากคุณมีคำถามเกี่ยวกับสินค้าหรือบริการของเรา
                สามารถติดต่อเราได้ตามช่องทางด้านล่างนี้
                ทีมงานของเราพร้อมให้บริการและตอบทุกคำถามของคุณ
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mr-4">
                    <MapPin className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-brown-800 mb-1">
                      ที่อยู่
                    </h3>
                    <p className="text-brown-600">
                      428/72 หมู่บ้านเดอะรีเจ้นท์ พระยาสุเรนทร์ 11
                      <br />
                      แขวงบางชัน เขตคลองสามวา กรุงเทพฯ 10510
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mr-4">
                    <Phone className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-brown-800 mb-1">
                      โทรศัพท์
                    </h3>
                    <p className="text-brown-600">080-060-8407</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mr-4">
                    <Mail className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-brown-800 mb-1">
                      อีเมล
                    </h3>
                    <p className="text-brown-600">Nillawan41@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-brown-800 mb-1">
                      เวลาทำการ
                    </h3>
                    <p className="text-brown-600">
                      จันทร์ - เสาร์: 9:00 - 18:00 น.
                    </p>
                    <p className="text-brown-600">อาทิตย์: 10:00 - 16:00 น.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-heading font-medium text-brown-800 mb-6">
                ส่งข้อความถึงเรา
              </h2>

              <form onSubmit={handleSubmit}>
                {/* เฉพาะ guest เท่านั้นที่แสดงพวก name/email/phone */}
                {!isLoggedIn && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-brown-700 mb-1"
                        >
                          ชื่อ *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-brown-700 mb-1"
                        >
                          อีเมล *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-brown-700 mb-1"
                      >
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const input = e.target.value;
                          // กรองเฉพาะตัวเลข และจำกัด 10 หลัก
                          const onlyNums = input
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setFormData({ ...formData, phone: onlyNums });
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-brown-700 mb-1"
                  >
                    หัวข้อ *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-brown-700 mb-1"
                  >
                    ข้อความ *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gold-600 hover:bg-gold-700"
                >
                  ส่งข้อความ
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-medium text-brown-800 text-center mb-8">
            แผนที่และการเดินทาง
          </h2>
          <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d289.74270393237305!2d100.69918988825583!3d13.829082330209603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d632830550dd9%3A0x4c6196941e9d712d!2sPKT%20Mall!5e1!3m2!1sth!2sth!4v1745687482617!5m2!1sth!2sth"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
