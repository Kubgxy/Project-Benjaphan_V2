import React, { useState, useEffect } from "react";
import { Bell, Moon, Sun, Search, User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// เพิ่ม import สำหรับ useNavigate ถ้าต้องการนำทาง หรือใช้ context สำหรับการค้นหา
import { useNavigate, useLocation } from "react-router-dom";
import { getBaseUrl } from "@/lib/api";

// ตัวอย่าง: สมมติว่ามีข้อมูลสำหรับค้นหา (กรณีจริงควรดึงข้อมูลหรือใช้ context/store)
const mockSearchIndex = [
  {
    type: "product",
    label: "สินค้า",
    value: "iPhone 15",
    url: "/dashboard/products/iphone-15",
  },
  {
    type: "order",
    label: "ออเดอร์",
    value: "Order #1234",
    url: "/dashboard/orders/1234",
  },
  {
    type: "customer",
    label: "ลูกค้า",
    value: "สมชาย ใจดี",
    url: "/dashboard/customers/1",
  },
  {
    type: "article",
    label: "บทความ",
    value: "เทคนิคขายดี",
    url: "/dashboard/articles/42",
  },
  {
    type: "message",
    label: "ข้อความ",
    value: "สอบถามสินค้า",
    url: "/dashboard/messages/9",
  },
  {
    type: "notification",
    label: "แจ้งเตือน",
    value: "ออเดอร์ใหม่",
    url: "/dashboard/notifications",
  },
  // ... เพิ่มข้อมูลอื่นๆ ตามต้องการ
];

interface TopbarProps {
  setDarkMode: (isDark: boolean) => void;
  isDarkMode: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ setDarkMode, isDarkMode }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockSearchIndex>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [admin, setAdmin] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ค้นหาแบบ Real-time
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const results = mockSearchIndex.filter(
        (item) =>
          item.value.toLowerCase().includes(query.toLowerCase()) ||
          item.label.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // เมื่อกด Enter หรือเลือกผลลัพธ์
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(searchResults[0].url);
      setShowDropdown(false);
      setSearchQuery("");
    } else {
      // fallback: หรือจะค้นหาหน้าเฉพาะที่อยู่ปัจจุบัน เช่น ตาราง
      // สามารถ dispatch/search context ได้ตรงนี้ถ้ามี
      setShowDropdown(false);
    }
  };

  // เลือกผลลัพธ์จาก dropdown
  const handleResultClick = (url: string) => {
    navigate(url);
    setShowDropdown(false);
    setSearchQuery("");
  };

  // ปิด dropdown เมื่อเปลี่ยนหน้า
  React.useEffect(() => {
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults([]);
  }, [location.pathname]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${getBaseUrl()}/api/notifications/getNotifications`,
          {
            credentials: "include", // ✅ จำเป็นถ้าใช้ cookie auth
          }
        );

        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications.slice(0, 5)); // แสดง 5 อันล่าสุด
        }
      } catch (error) {
        console.error("โหลดการแจ้งเตือนไม่สำเร็จ", error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/user/getUserProfile`, {
          credentials: "include",
        });

        const data = await res.json();
        if (data?.user) {
          // ✅ ส่งเข้าคอนเท็กซ์
          setAdmin(data.user);
        }
      } catch (error) {
        console.error("โหลดข้อมูลแอดมินล้มเหลว", error);
      }
    };

    // กรณี user ยังไม่ถูกโหลด (เช่นรีเฟรช)
    if (!user?.firstName) {
      fetchAdminInfo();
    }
  }, []);

  return (
    <header className="border-b bg-background z-30 relative">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex-1 flex items-center md:w-auto">
          <form
            onSubmit={handleSearch}
            className="hidden md:block w-full max-w-md relative"
            autoComplete="off"
          >
            <div className="relative">
              {showDropdown && (
                <div className="absolute left-0 top-10 w-full rounded-md bg-popover shadow-lg border z-50 max-h-60 overflow-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center px-4 py-2 hover:bg-muted cursor-pointer gap-2"
                        onMouseDown={() => handleResultClick(item.url)}
                      >
                        <span className="text-xs text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-muted-foreground text-sm">
                      ไม่พบผลลัพธ์
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setDarkMode(!isDarkMode)}
            aria-label={t("theme")}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>การแจ้งเตือน</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <DropdownMenuItem
                      key={n._id || i}
                      className="flex flex-col items-start py-2 cursor-pointer"
                      onClick={() => navigate("/dashboard/notifications")} // หรือเจาะจงแต่ละ order ได้
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleDateString("th-TH")}
                      </p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <p className="text-sm px-4 py-2 text-muted-foreground">
                    ไม่พบการแจ้งเตือน
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center font-medium cursor-pointer"
                onClick={() => navigate("/dashboard/notifications")}
              >
                ดูทั้งหมด
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  {admin?.avatar ? (
                    <img
                      src={`${getBaseUrl()}${
                        admin.avatar.startsWith("/")
                          ? admin.avatar
                          : `/${admin.avatar}`
                      }`}
                      alt="Avatar"
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <AvatarFallback>
                      {admin?.firstName?.substring(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  )}
                  <span>{admin?.firstName || "แอดมิน"}</span>
                </Avatar>

                <span className="hidden md:inline-block">
                  {admin?.firstName || "แอดมิน"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link to="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>ตั้งค่า</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar - shows only on small screens */}
      <div className="md:hidden p-2 bg-background">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหา..."
              className="w-full pl-8 bg-background"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(searchResults.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
              autoComplete="off"
            />
            {showDropdown && (
              <div className="absolute left-0 top-10 w-full rounded-md bg-popover shadow-lg border z-50 max-h-60 overflow-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center px-4 py-2 hover:bg-muted cursor-pointer gap-2"
                      onMouseDown={() => handleResultClick(item.url)}
                    >
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-muted-foreground text-sm">
                    ไม่พบผลลัพธ์
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </header>
  );
};

export default Topbar;
