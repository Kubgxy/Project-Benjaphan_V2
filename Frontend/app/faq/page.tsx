import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gold-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-semibold mb-2">ศูนย์ช่วยเหลือ</h1>
          <p className="text-white/90">คำถามที่พบบ่อย และแนวทางในการใช้งานเว็บไซต์</p>
        </div>
      </div>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-brown-800 mb-2">
              🔐 ลืมรหัสผ่าน ต้องทำอย่างไร?
            </h2>
            <p className="text-brown-600">
              คุณสามารถกดที่ปุ่ม "ลืมรหัสผ่าน?" ที่หน้าล็อกอิน แล้วกรอกอีเมลเพื่อรับ OTP
              จากนั้นยืนยันและตั้งรหัสผ่านใหม่ได้ทันที
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brown-800 mb-2">
              🧾 อยากดูประวัติการสั่งซื้อของฉัน ต้องไปที่ไหน?
            </h2>
            <p className="text-brown-600">
              หลังเข้าสู่ระบบ ให้ไปที่หน้า <strong>บัญชีผู้ใช้ &gt; Orders</strong>
              เพื่อดูรายการคำสั่งซื้อทั้งหมดของคุณ
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brown-800 mb-2">
              ✉️ ต้องการลบบัญชีผู้ใช้ ต้องทำอย่างไร?
            </h2>
            <p className="text-brown-600">
              กรุณาเข้าสู่ระบบ แล้วไปที่หน้า <a href="/account" className="text-gold-600 underline">บัญชีผู้ใช้</a> และดูคำแนะนำในส่วน “ลบบัญชีผู้ใช้” ด้านล่างสุด
              โดยส่งคำขอผ่านแบบฟอร์มหรืออีเมล ระบุหัวข้อ “ขอลบบัญชี” และใช้อีเมลเดียวกับที่ลงทะเบียน
              ทีมงานจะดำเนินการภายใน 7 วันทำการ
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brown-800 mb-2">
              📲 สามารถเข้าสู่ระบบด้วย Google หรือ Facebook ได้หรือไม่?
            </h2>
            <p className="text-brown-600">
              ได้เลย! คุณสามารถกดปุ่ม “Login with Google” หรือ “Login with Facebook” ได้ทันทีที่หน้าล็อกอิน
              ระบบจะสร้างบัญชีให้อัตโนมัติหากยังไม่เคยสมัครมาก่อน
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brown-800 mb-2">
              📦 ฉันสามารถติดตามสถานะการสั่งซื้อได้ที่ไหน?
            </h2>
            <p className="text-brown-600">
              เมื่อสั่งซื้อเรียบร้อยแล้ว คุณสามารถติดตามสถานะการจัดส่งได้ที่หน้า “Orders” ในบัญชีผู้ใช้
              และจะได้รับอีเมลแจ้งเตือนเมื่อสถานะเปลี่ยนแปลง
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
