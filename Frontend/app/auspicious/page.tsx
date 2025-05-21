import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/data";
import Image from "next/image";

export default function AuspiciousPage() {
  // Filter products for auspicious items (in a real app, you'd have a specific category or tag)
  const auspiciousProducts = products.slice(0, 8); // Just using some products for demo

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      {/* Hero Banner */}
      <div className="relative bg-gold-600 text-white py-24">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-center mb-4">
            ของดีมีศรัทธา เสริมบุญหนา วาสนาเปล่งประกาย
          </h1>
          <p className="text-center text-white/90 max-w-2xl mx-auto">
            เสริมพลังชีวิต ปรับสมดุลดวงชะตา พร้อมดีไซน์มีสไตล์
          </p>
        </div>
        <div className="absolute inset-0 opacity-15 lotus-pattern"></div>
      </div>

      {/* Auspicious Jewelry Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-charm font-semibold text-brown-800 mb-6">
                เครื่องประดับมงคลเสริมดวงชะตา
              </h2>
              <p className="text-brown-600 mb-4 indent-paragraph">
                เครื่องประดับมงคลของเบญจภัณฑ์ ๕
                ออกแบบโดยผู้เชี่ยวชาญด้านโหราศาสตร์ไทย
                ผสมผสานความเชื่อดั้งเดิมกับการออกแบบที่ทันสมัย
                เพื่อสร้างเครื่องประดับที่ไม่เพียงแต่สวยงาม
                แต่ยังช่วยเสริมดวงชะตาและปกป้องผู้สวมใส่
              </p>
              <p className="text-brown-600 mb-4 indent-paragraph">
                ทุกชิ้นผลิตจากทองคำแท้คุณภาพสูง
                ผ่านพิธีปลุกเสกโดยพระอาจารย์ที่มีชื่อเสียง
                เพื่อเพิ่มพลังมงคลและความศักดิ์สิทธิ์ให้กับเครื่องประดับ
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "เสริมโชคลาภ การเงิน",
                    desc: "ช่วยดึงดูดโชคลาภ เงินทอง และความมั่งคั่งเข้าสู่ชีวิต",
                  },
                  {
                    title: "ปกป้องคุ้มครอง",
                    desc: "ป้องกันสิ่งชั่วร้าย อุบัติเหตุ และภัยอันตรายต่างๆ",
                  },
                  {
                    title: "เสริมเสน่ห์ ความรัก",
                    desc: "ช่วยเสริมเสน่ห์ ดึงดูดความรัก และเสริมความสัมพันธ์ให้แน่นแฟ้น",
                  },
                ].map((item, idx) => (
                  <div className="flex items-start" key={idx}>
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center mr-4 mt-1">
                      <svg
                        className="w-5 h-5 text-gold-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-brown-800 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-brown-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full h-64 sm:h-[500px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/Product_auspicious.jpg"
                alt="เครื่องประดับมงคล"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* naga Section */}
      <section className="py-16 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl font-charm font-semibold text-brown-800 text-center mb-4">
            ความหมายของพญานาค 4 ตระกูล
          </h2>
          <p className="text-brown-600 text-center max-w-4xl mx-auto mb-12">
            เลือกเครื่องประดับที่เหมาะกับราศีของคุณ
            เพื่อเสริมดวงชะตาและพลังมงคลให้ตรงกับธาตุประจำราศี
          </p>
          <hr className="border-brown-300 mb-8" />

          {[
            {
              title: "ตระกูลวิรูปักข์",
              desc: "พญานาคตระกูลที่มีผิวกายหรือเกล็ดเป็นสีทองงดงามมาก เป็นนาคชั้นสูงสุด ถือกำเนิดแบบโอปปาติกะ คือเกิดขึ้นเองแล้วโตเลย มากด้วยอิทธิฤทธิ์และบุญบารมี มักถูกจัดอยู่ในชั้นเทพ พำนักอาศัยอยู่ในทิพย์วิมาน อีกทั้งยังเป็นชนชั้นปกครองที่คอยปกครองนาคทั้งหลาย ไม่เกรงกลัวแม้มนต์สะกดอาลัมพายน์ของพญาครุฑ พญานาคในตระกูลนี้ที่รู้จักกันดี อาทิ พญาสุวรรณนาคราช พญามุจลินท์นาคราช",
              img: "/naga1.png",
            },
            {
              title: "ตระกูลเอราปถะ",
              desc: "พญานาคตระกูลที่มีผิวกายหรือเกล็ดเป็นสีเขียว ถือว่าเป็นพญานาคชั้นสูง มักจะถือกำเนิดแบบโอปปาติกะคำเนิดขึ้นเอง หรือแบบอัณฑะชะคือกำเนิดจากฟองไข่ มีขนาดใหญ่โตใกล้เคียงกับพญานาคตระกูลสีทอง อาศัยอยู่เมืองบาดาลไม่ลึกมาก เป็นตระกูลที่พบได้มากที่สุดและใกล้ชิดมนุษย์มากที่สุด ชอบขึ้นมาเที่ยวบนโลกมนุษย์จนเกิดเป็นตำนานรักมากมายกับเหล่ามนุษย์ และหากบำเพ็ญเพียงบารมีจนแกร่งกล้า ก็จะสามารถแผ่เศียรได้ถึง 9 เศียรได้เช่นกัน ก็สามารถขึ้นเป็นพญานาคชั้นปกครองได้เช่นกัน พญานาคในตระกูลนี้ที่รู้จักกันดี คือ พญาศรีสุทโธนาคราชแห่งเวียงวังนาคินทร์คำโชนด",
              img: "/naga2.png",
            },
            {
              title: "ตระกูลฉัพพยาปุตตะ",
              desc: "พญานาคตระกูลที่มีผิวกายหรือเกล็ดเป็นสีรุ้ง ส่วนใหญ่ถือกำเนิดแบบชลาพุชะ คือกำเนิดจากครรภ์ มีขนาดใหญ่โตใกล้เคียงกับพญานาคตระกูลสีทอง อาศัยอยู่ในนครบาดาลหรือป่าลึก เป็นพญานาคที่มีความงดงามมากเพราะมักจะมีเกล็ดเหลื่อมหลากสี สวยเหมือนสีรุ้ง พญานาคในตระกูลนี้มีอิทธิฤทธิ์มาก แต่มักพบได้ยาก เพราะมักอาศัยอยู่ในที่ลึกลับ",
              img: "/naga3.png",
            },
            {
              title: "ตระกูลกัณหาโคตะมะ",
              desc: "พญานาคตระกูลที่มีผิวกายหรือเกล็ดเป็นสีดำนิลกาฬ ส่วนใหญ่ถือกำเนิดแบบสังเสทชะคือเกิดจากเหงื่อไคลและสิ่งหมักหมมต่างๆ หรือแบบอัณฑชะคือเกิดจากไข่ มักมีร่างกายกำยำบึกบึน แม้ไม่ถือว่าเป็นนาคชั้นสูง แต่ก็มีอำนาจและอิทธิฤทธ์ปฏิหารย์ไม่แพ้ตระกูลอื่น พบเจอได้ยาก ชอบอาศัยในท้องน้ำลึกและที่เร้นลับ มักจะมีหน้าที่เฝ้าสมบัติของเมืองบาดาล และแม้จะเกิดในตระกูลที่ต่ำกว่าตระกูลอื่น แต่หากหมั่นบำเพ็ญเพียรจนมากญาณบารมี ก็สามารถเป็นพญานาคชั้นปกครองได้เช่นกัน พญานาคในตระกูลนี้ที่รู้จักกันดี คือ องค์ดำแสนสิริจันทรานาคราช กษัตริย์นาคราชยอดนักรบแห่งเมืองบาดาล",
              img: "/naga4.png",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-center px-4 py-8 border-b-2 border-brown-400 last:border-b-0 max-w-6xl mx-auto"
            >
              <div
                className={`w-full md:w-auto max-w-[350px] mb-6 ${
                  idx % 2 === 1 ? "order-1 md:order-2" : ""
                }`}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div
                className={`flex-1 ${
                  idx % 2 === 1 ? "md:pr-12 order-2 md:order-1" : "md:pl-12"
                } text-justify`}
              >
                <h3 className="text-2xl font-charm font-semibold text-brown-800 mb-4">
                  {item.title}
                </h3>
                <p className="text-brown-600 leading-relaxed indent-paragraph ">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
