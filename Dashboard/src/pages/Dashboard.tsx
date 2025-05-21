import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ShoppingBag, Package, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { getBaseUrl } from "@/lib/api";

function getThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  // สามารถใส่ fallback สีไว้กรณี SSR หรือโหลด theme ไม่ทัน
  return [
    styles.getPropertyValue("--primary")?.trim()
      ? `hsl(${styles.getPropertyValue("--primary")})`
      : "#3B82F6", // Blue
    styles.getPropertyValue("--accent")?.trim()
      ? `hsl(${styles.getPropertyValue("--accent")})`
      : "#10B981", // Green
    "#A855F7", // Violet (ถ้าอยาก dynamic เพิ่ม custom var)
    "#F59E42", // Orange (ถ้าอยาก dynamic เพิ่ม custom var)
  ];
}

const COLORS = ["#D4AF37", "#A67C00", "#F5D76E", "#3B82F6"];

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState("weekly");
  const themeColors = getThemeColors();
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [monthlySales, setMonthlySales] = useState([]);
  const [categorySales, setCategorySales] = useState<
    { name: string; value: number }[]
  >([]);
  const [loadingCategory, setLoadingCategory] = useState(true);

  // Stats cards data
  const statsCards = [
    {
      title: "รายได้ทั้งหมด",
      value: `฿${totalRevenue.toLocaleString()}`, // ✅ ใช้ค่าจริง
      icon: DollarSign,
      iconColor: "text-emerald",
      bgColor: "bg-emerald/10",
      changeUp: true,
    },
    {
      title: "ออเดอร์ทั้งหมด",
      value: totalOrders.toString(), // ✅ ใช้ค่าจริง
      icon: ShoppingBag,
      iconColor: "text-purple",
      bgColor: "bg-purple/10",
      changeUp: true,
    },
    {
      title: "สินค้าทั้งหมด",
      value: productCount.toString(),
      icon: Package,
      iconColor: "text-gold",
      bgColor: "bg-gold/10",
      changeUp: false,
    },
    {
      title: "ลูกค้าทั้งหมด",
      value: customerCount.toString(),
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      changeUp: true,
    },
  ];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // ✅ ดึงสินค้าทั้งหมด
        const productRes = await axios.get(
          `${getBaseUrl()}/api/product/getAllProducts`,
          {
            withCredentials: true,
          }
        );
        setProductCount(productRes.data.products.length);

        // ✅ ดึงลูกค้าทั้งหมด
        const customerRes = await axios.get(
          `${getBaseUrl()}/api/user/getAllCustomers`,
          {
            withCredentials: true,
          }
        );
        setCustomerCount(customerRes.data.customers.length);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
      const ordersRes = await axios.get(
        `${getBaseUrl()}/api/order/getAllOrders`,
        {
          withCredentials: true,
        }
      );
      const orders = ordersRes.data.orders;
      setTotalOrders(orders.length);

      const deliveredOrders = orders.filter(
        (order: any) => order.orderStatus === "delivered"
      );
      const total = deliveredOrders.reduce(
        (sum: number, order: any) => sum + order.total,
        0
      );
      setTotalRevenue(total);
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const res = await axios.get(
          `${getBaseUrl()}/api/order/getMonthlyRevenue`,
          {
            withCredentials: true,
          }
        );
        setMonthlySales(res.data.data); // ✅ ใส่เข้า LineChart
      } catch (err) {
        console.error("โหลดรายได้ตามเดือนล้มเหลว", err);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  useEffect(() => {
    const fetchCategorySales = async () => {
      try {
        const res = await fetch(
          `${getBaseUrl()}/api/order/getRevenueByCategory`,
          {
            credentials: "include", // ✅ ถ้าใช้ cookie-based auth
          }
        );

        const data = await res.json();
        if (data.success) {
          setCategorySales(data.data);
        } else {
          console.error("Failed to fetch category sales");
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategorySales();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h1>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-background border rounded px-3 py-1 text-sm"
          >
            <option value="daily">รายวัน</option>
            <option value="weekly">รายสัปดาห์</option>
            <option value="monthly">รายเดือน</option>
            <option value="yearly">รายปี</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", card.bgColor)}>
                <card.icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p
                className={cn(
                  "text-xs mt-1",
                  card.changeUp ? "text-emerald" : "text-ruby"
                )}
              ></p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>รายได้ตามช่วงเวลา</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] px-4 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlySales}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `฿${value}`} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#375cd4"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>ยอดขายตามหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill={themeColors[0]}
                    dataKey="value"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={themeColors[index % themeColors.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card, #fff)",
                      color: "var(--foreground, #222)",
                    }}
                    formatter={(value: number) => `฿${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>ผลการขายรายเดือน</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[300px] px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `฿${value}`} />
                <Bar dataKey="value" fill="#375CD4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
