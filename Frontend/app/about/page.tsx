import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function AboutPage() {
  const teamMembers = [
    { name: "คุณ", role: "ทีมงานผู้เชี่ยวชาญ", image: "/Pnhoona.jpg" },
    { name: "คุณเบญจพรรณ", role: "ผู้ก่อตั้งและผู้จัดการ", image: "/Pben.jpg" },
    { name: "คุณ", role: "ทีมงานฝ่ายบริการลูกค้า", image: "/Pdream.jpg" },
  ];

  const mobileFirstOrder = [teamMembers[1], teamMembers[0], teamMembers[2]];
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      {/* Hero Banner */}
      <div className="relative bg-gold-600 text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-center mb-4">
            เกี่ยวกับเรา
          </h1>
          <p className="text-center text-white/90 max-w-2xl mx-auto text-sm sm:text-base">
            เบญจภัณฑ์๕ ร้านทองและเครื่องประดับมงคล ที่มีประสบการณ์มากกว่า 30 ปี
          </p>
        </div>
        <div className="absolute inset-0 opacity-15 lotus-pattern"></div>
      </div>

      {/* Our Story */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative w-full h-64 sm:h-[400px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/About1.jpg"
                alt="ประวัติร้านเบญจภัณฑ์๕"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-medium text-brown-800 mb-4 sm:mb-6">
                เรื่องราวของเรา
              </h2>
              <p className="text-brown-600 text-sm sm:text-base mb-3">
                เบญจภัณฑ์ ๕
              </p>
              <p className="text-brown-600 text-sm sm:text-base mb-3 indent-paragraph">
                ธุรกิจที่มุ่งมั่นสร้างสรรค์ ผลิตภัณฑ์สายบุญ สายมู
                เพื่อเป็นอีกหนึ่งสื่อกลางในการส่งต่อแรงศรัทธาและความเชื่ออย่างถูกวิธี...
              </p>
              <p className="text-brown-600 text-sm sm:text-base mb-3 indent-paragraph">
                ตามความเชื่อโบราณ พญานาคราช จะประทานพรด้านทรัพย์ โชคลาภ
                และความสำเร็จ...
              </p>
              <p className="text-brown-600 text-sm sm:text-base mb-3 ">
                จากศรัทธาอันแน่วแน่และความตั้งใจจริงของเจ้าของแบรนด์...
              </p>
              <p className="text-brown-600 text-sm sm:text-base indent-paragraph">
                เบญจภัณฑ์ ๕
                อยากเป็นส่วนหนึ่งในการช่วยให้ทุกคำขอของลูกค้าได้เชื่อมโยงกับบุญอย่างถูกต้อง...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 lotus-pattern">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-medium text-brown-800 text-center mb-8 sm:mb-12">
            คุณค่าของเรา
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "คุณภาพเป็นเลิศ",
                desc: "เรามุ่งมั่นในการสร้างสรรค์เครื่องประดับทองคำแท้คุณภาพสูง ผ่านการคัดสรรวัตถุดิบอย่างพิถีพิถัน...",
                icon: (
                  <svg
                    className="w-8 h-8 text-gold-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
              },
              {
                title: "ความซื่อสัตย์",
                desc: "เราดำเนินธุรกิจด้วยความซื่อสัตย์ โปร่งใส และเป็นธรรม ทั้งต่อลูกค้า พนักงาน และคู่ค้า...",
                icon: (
                  <svg
                    className="w-8 h-8 text-gold-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "ความพึงพอใจของลูกค้า",
                desc: "เราให้ความสำคัญกับความพึงพอใจของลูกค้าเป็นอันดับหนึ่ง ด้วยการให้บริการที่ประทับใจ...",
                icon: (
                  <svg
                    className="w-8 h-8 text-gold-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
            ].map((val, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-lg shadow-md"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                  {val.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-brown-800 text-center mb-2 sm:mb-3">
                  {val.title}
                </h3>
                <p className="text-brown-600 text-center text-sm sm:text-base">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-medium text-brown-800 text-center mb-4">
            ทีมงานของเรา
          </h2>
          <p className="text-brown-600 text-center max-w-2xl mx-auto mb-8 sm:mb-12 text-sm sm:text-base">
            พบกับทีมงานผู้เชี่ยวชาญของเรา ที่พร้อมให้คำปรึกษาและบริการด้วยใจ
          </p>

          <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-12 gap-8 items-center">
            {(typeof window !== "undefined" && window.innerWidth < 640
              ? mobileFirstOrder
              : teamMembers
            ).map((member, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`relative ${
                    member.name === "คุณเบญจพรรณ"
                      ? "w-40 h-40 sm:w-60 sm:h-60"
                      : "w-32 h-32 sm:w-40 sm:h-40"
                  } mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden`}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-brown-800 mb-1">
                  {member.name}
                </h3>
                <p className="text-gold-600 text-sm sm:text-base">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
