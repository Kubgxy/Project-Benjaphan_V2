import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Linkedin,
  Link,
  MessageCircle,
  Share2,
  X,
  Send,
  MessageSquareText,
} from "lucide-react";
import { FaLine, FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/lib/types";
import { getBaseUrl } from "@/lib/api";

export default function ShareProductButton({ product }: { product: Product }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${getBaseUrl()}/product/${product.id_product}`;

      const handleNativeShare = () => {
        // ❗ ไม่ต้องเช็กแล้วว่า navigator.share
        // เปิด popup ของเราทันทีทุกครั้ง
        setShowShareModal(true);
      };

  const shareOptions = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5 text-blue-600" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
    },
    {
      name: "LINE",
      icon: <FaLine className="h-5 w-5 text-green-500" />,
      url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        currentUrl
      )}`,
    },
    {
      name: "Messenger",
      icon: <FaFacebookMessenger className="h-5 w-5 text-blue-500" />,
      url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
        currentUrl
      )}&app_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(
        currentUrl
      )}`,
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5 text-sky-400" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(product.name)}`,
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="h-5 w-5 text-green-600" />,
      url: `https://wa.me/?text=${encodeURIComponent(currentUrl)}`,
    },
  ];

  return (
    <>
      <Button
        variant="luxuryOutline"
        size="lg"
        className="sm:w-auto"
        onClick={handleNativeShare}
      >
        <Share2 className="h-5 w-5" />
      </Button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setShowShareModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">
              แชร์สินค้า
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {shareOptions.map((option, idx) => (
                <a
                  key={idx}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center border rounded-lg py-3 hover:bg-gray-50 transition"
                >
                  {option.icon}
                  <span className="text-sm mt-2">{option.name}</span>
                </a>
              ))}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl);
                  toast({ title: "✅ คัดลอกลิงก์เรียบร้อย!" });
                }}
                className="flex flex-col items-center justify-center border rounded-lg py-3 hover:bg-gray-50 transition"
              >
                <Link className="h-5 w-5 text-gray-700" />
                <span className="text-sm mt-2">คัดลอกลิงก์</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
