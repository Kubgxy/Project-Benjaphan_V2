import React, { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BookText,
  MessageSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { getBaseUrl } from "@/lib/api";

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [orderCount, setOrderCount] = useState<number>(0);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const isActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  const [customerOpen, setCustomerOpen] = useState(false);

  const getNavSections = () => [
    {
      label: "MAIN",
      items: [
        {
          label: "แดชบอร์ด",
          icon: LayoutDashboard,
          href: "/dashboard",
        },
        {
          label: "สินค้า",
          icon: Package,
          href: "/dashboard/products",
        },
        {
          label: "ออเดอร์",
          icon: ShoppingBag,
          href: "/dashboard/orders",
          badge: orderCount,
        },
        {
          label: "ลูกค้า",
          icon: Users,
          href: "#",
          isDropdown: true,
        },
      ],
    },
    {
      label: "LISTS",
      items: [
        {
          label: "บทความ",
          icon: BookText,
          href: "/dashboard/articles",
        },
        {
          label: "ติดต่อเรา",
          icon: MessageSquare,
          href: "/dashboard/messages",
          badge: messageCount,
        },
        {
          label: "การแจ้งเตือน",
          icon: Bell,
          href: "/dashboard/notifications",
          badge: notificationCount,
        },
      ],
    },
    {
      label: "SETTINGS",
      items: [
        {
          label: "ตั้งค่า",
          icon: Settings,
          href: "/dashboard/settings",
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const orderRes = await fetch(
          `${getBaseUrl()}/api/order/getPendingOrderCount`,
          {
            credentials: "include",
          }
        );
        const orderData = await orderRes.json();
        setOrderCount(orderData.count || 0);

        const messageRes = await fetch(
          `${getBaseUrl()}/api/contact/getUnreadContactCount`,
          {
            credentials: "include",
          }
        );
        const messageData = await messageRes.json();
        setMessageCount(messageData.count || 0);

        const notiRes = await fetch(
          `${getBaseUrl()}/api/notifications/unread-count`,
          {
            credentials: "include",
          }
        );
        const notiData = await notiRes.json();
        setNotificationCount(notiData.count || 0);
      } catch (error) {
        console.error("โหลดข้อมูล badge ไม่สำเร็จ:", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <aside
      className={cn(
        "bg-sidebar h-screen flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="text-sidebar-foreground font-bold text-lg">
            เบญจภัณฑ์ ๕ 
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        {getNavSections().map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="px-4 mb-2 mt-4 text-xs font-semibold text-sidebar-foreground/60 tracking-widest uppercase">
                {section.label}
              </div>
            )}
            <nav className="px-2 space-y-1">
              {section.items.map((item) => {
                // ✅ กรณีลูกค้า: render dropdown แทน
                if (item.label === "ลูกค้า") {
                  return (
                    <div key="customer-dropdown" className="relative">
                      <button
                        onClick={() => setCustomerOpen((prev) => !prev)}
                        className={cn(
                          "flex items-center w-full gap-3 px-4 py-2 rounded-lg font-medium transition-all sidebar-item group",
                          location.pathname.startsWith(
                            "/dashboard/customers"
                          ) ||
                            location.pathname.startsWith("/dashboard/members")
                            ? "bg-primary/20 text-primary sidebar-item-active"
                            : "hover:bg-sidebar-accent/40 hover:text-primary",
                          collapsed && "justify-center p-3"
                        )}
                      >
                        <item.icon size={20} />
                        {!collapsed && <span className="mr-[112px]">ลูกค้า</span>}
                        {!collapsed && (
                          <ChevronRight
                            className={cn(
                              "transition-transform justify-end  group-hover:rotate-90",
                              customerOpen && "rotate-90"
                            )}
                            size={16}
                          />
                        )}
                      </button>

                      {!collapsed && customerOpen && (
                        <div className="ml-10 mt-1 space-y-1 text-sm text-sidebar-foreground">
                          <Link
                            to="/dashboard/customers"
                            className={cn(
                              "block px-2 py-1 rounded hover:bg-sidebar-accent/30",
                              location.pathname === "/dashboard/customers" &&
                                "bg-primary/10 text-primary"
                            )}
                          >
                            ลูกค้าทั้งหมด
                          </Link>
                          <Link
                            to="/dashboard/members"
                            className={cn(
                              "block px-2 py-1 rounded hover:bg-sidebar-accent/30",
                              location.pathname === "/dashboard/members" &&
                                "bg-primary/10 text-primary"
                            )}
                          >
                            สมาชิกรับข่าวสาร
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }

                // ✅ ปกติ: แสดงลิงก์แบบเดิม
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all sidebar-item group",
                      isActive(item.href) &&
                        "bg-primary/20 text-primary sidebar-item-active",
                      !isActive(item.href) &&
                        "hover:bg-sidebar-accent/40 hover:text-primary",
                      collapsed && "justify-center p-3"
                    )}
                  >
                    <item.icon size={20} />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute right-0 top-0 -mt-1 -mr-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-3 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground sidebar-item",
            collapsed && "justify-center"
          )}
          onClick={() => logout()}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-2">ออกจากระบบ</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
