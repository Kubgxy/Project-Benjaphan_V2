"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Copy } from "lucide-react";
import { getBaseUrl } from "@/lib/api";
import Swal from "sweetalert2";
import { th } from "date-fns/locale";


type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

type Order = {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }; // ✅ เพิ่มแบบนี้แทน any
  createdAt: string;
  total: number;
  orderStatus: OrderStatus;
  items: {
    name: string;
    size: string;
    quantity: number;
    priceAtPurchase: number;
    images: string[];
  }[];
  payment: {
    method: string;
    status: string;
    slipImage?: string;
  };
  shippingInfo: {
    Name: string;
    label: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  deliveryTracking: {
    trackingNumber: string;
    carrier: string;
    status: string;
  };
};

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all"); // all / YYYY-MM-DD
  const [sortByDate, setSortByDate] = useState<string>("none");
  const [sortByPrice, setSortByPrice] = useState<string>("none");

  const filteredOrders = orders
    .filter((order) => {
      if (filterStatus !== "all" && order.orderStatus !== filterStatus)
        return false;
      if (filterDate !== "all") {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === filterDate;
      }
      return true;
    })
    .sort((a, b) => {
      // ถ้ามีการเรียงวัน
      if (sortByDate === "date-asc") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortByDate === "date-desc") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // ถ้ามีการเรียงราคา
      if (sortByPrice === "price-asc") return a.total - b.total;
      if (sortByPrice === "price-desc") return b.total - a.total;

      return 0;
    });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/order/getAllOrders`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch orders",
          });
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to fetch orders",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const refreshOrderData = async (orderId: string) => {
    try {
      const res = await axios.get(
        `${getBaseUrl()}/api/order/getOrderById/${orderId}`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setSelectedOrder(res.data.order); // ✅ set ตัวล่าสุดที่ได้จาก backend
      }
    } catch (err) {
      console.error("❌ Failed to refresh order:", err);
    }
  };

  // ✅ handle เปลี่ยนสถานะ orderStatus
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setIsLoading(true);

    try {
      if (newStatus === "shipped") {
        // ✅ ปิด Dialog ก่อนเรียก Swal
        setShowOrderDetails(false);
        await new Promise((resolve) => setTimeout(resolve, 200)); // หน่วงรอ Dialog ปิด

        // 👉 Step 1: ขอเลขพัสดุ
        const { value: trackingNumber } = await Swal.fire({
          title: "ใส่เลขพัสดุ",
          input: "text",
          inputLabel: "เลขพัสดุ",
          inputPlaceholder: "เช่น TH1234567890",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return "กรุณากรอกเลขพัสดุ";
          },
        });

        if (!trackingNumber) {
          setIsLoading(false);
          setShowOrderDetails(true); // เปิด Dialog กลับ
          return;
        }

        // 👉 Step 2: ขอชื่อบริษัทขนส่ง
        const { value: carrier } = await Swal.fire({
          title: "ใส่บริษัทขนส่ง",
          input: "text",
          inputLabel: "บริษัทขนส่ง",
          inputPlaceholder: "เช่น Kerry, Flash",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return "กรุณากรอกชื่อบริษัทขนส่ง";
          },
        });

        if (!carrier) {
          setIsLoading(false);
          setShowOrderDetails(true);
          return;
        }

        // ✅ ส่งไป backend
        const res = await axios.patch(
          `${getBaseUrl()}/api/order/updateStatus/${orderId}`,
          {
            status: newStatus,
            trackingNumber,
            carrier,
          },
          { withCredentials: true }
        );

        if (res.data.success) {
          toast({
            title: "อัปเดตคำสั่งซื้อสำเร็จ",
            description: `เปลี่ยนสถานะเป็น ${newStatus}`,
          });
          setSelectedOrder(res.data.order);
        } else {
          toast({ title: "Error", description: res.data.message });
        }

        setShowOrderDetails(true); // ✅ เปิด Dialog กลับ
        return;
      }

      // ✅ กรณีอื่น
      const res = await axios.patch(
        `${getBaseUrl()}/api/order/updateStatus/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast({
          title: "Order Updated",
          description: `Order ${orderId} status updated to ${newStatus}`,
        });
        setSelectedOrder(res.data.order);
      } else {
        toast({ title: "Error", description: res.data.message });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ออเดอร์ทั้งหมด</h1>

      <div className="grid gap-4 w-full max-w-8xl md:grid-cols-5 my-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-muted-foreground mb-1">
              ออเดอร์ทั้งหมด
            </div>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-muted-foreground mb-1">
              กำลังรอดำเนินการ
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.orderStatus === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-muted-foreground mb-1">
              กำลังจัดส่ง
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.orderStatus === "shipped").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-muted-foreground mb-1">
              จัดส่งสำเร็จ
            </div>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.orderStatus === "delivered").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-muted-foreground mb-1">ยกเลิก</div>
            <div className="text-2xl font-bold text-red-600">
              {orders.filter((o) => o.orderStatus === "cancelled").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="ค้นหาด้วย Order ID..."
          className="max-w-sm"
          // เพิ่มค้นหาในอนาคตถ้าต้องการ
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-4 flex-wrap">
          {/* เรียงตามวัน */}
          <Select value={sortByDate} onValueChange={setSortByDate}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="เรียงตามวัน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ไม่เรียงตามวัน</SelectItem>
              <SelectItem value="date-desc">วันที่ล่าสุด</SelectItem>
              <SelectItem value="date-asc">วันที่เก่าสุด</SelectItem>
            </SelectContent>
          </Select>

          {/* เรียงตามราคา */}
          <Select value={sortByPrice} onValueChange={setSortByPrice}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="เรียงตามราคา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ไม่เรียงราคา</SelectItem>
              <SelectItem value="price-desc">ราคาสูง - ต่ำ</SelectItem>
              <SelectItem value="price-asc">ราคาต่ำ - สูง</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขคำสั่งซื้อ</TableHead>
              <TableHead>วันที่สั่งซื้อ</TableHead>
              <TableHead>ราคารวมทั้งหมด</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>รายละเอียด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(null)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "d MMM yyyy",{
                      locale: th,
                    })}
                  </TableCell>
                  <TableCell>฿{order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[order.orderStatus as OrderStatus] || ""
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        {selectedOrder && (
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader className="mb-4 border-b pb-3">
              <DialogTitle className="text-xl font-bold">
                เลขคำสั่งซื้อ:{" "}
                <span className="break-all text-blue-600">
                  {selectedOrder._id}
                </span>
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                สั่งซื้อวันที่:{" "}
                {format(new Date(selectedOrder.createdAt), "dd MMM yyyy")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* ✅ สถานะ */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-lg">สถานะ:</span>
                <Badge
                  className={
                    statusColors[selectedOrder.orderStatus as OrderStatus]
                  }
                >
                  {selectedOrder.orderStatus}
                </Badge>

                {/* ปุ่มดำเนินการต่อ */}
                {(() => {
                  let nextAction: OrderStatus | null = null;
                  if (selectedOrder.orderStatus === "pending")
                    nextAction = "confirmed";
                  else if (selectedOrder.orderStatus === "confirmed")
                    nextAction = "shipped";
                  else if (selectedOrder.orderStatus === "shipped")
                    nextAction = "delivered";

                  const isPaymentPaid =
                    selectedOrder.payment?.status === "paid";
                  const requirePaid =
                    (nextAction === "shipped" || nextAction === "delivered") &&
                    !isPaymentPaid;

                  if (nextAction && !requirePaid) {
                    return (
                      <Button
                        onClick={() =>
                          handleStatusChange(
                            selectedOrder._id,
                            nextAction as OrderStatus
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {nextAction === "confirmed" && "ยืนยันคำสั่งซื้อ"}
                        {nextAction === "shipped" && "กำลังจัดส่ง"}
                        {nextAction === "delivered" && "จัดส่งสำเร็จ"}
                      </Button>
                    );
                  }

                  if (requirePaid) {
                    return (
                      <Button
                        disabled
                        className="bg-gray-400 text-white cursor-not-allowed"
                      >
                        ต้องยืนยันการชำระเงินก่อน
                      </Button>
                    );
                  }

                  return null;
                })()}

                {/* ปุ่มยกเลิก */}
                {(selectedOrder.orderStatus === "pending" ||
                  selectedOrder.orderStatus === "confirmed") && (
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleStatusChange(selectedOrder._id, "cancelled")
                    }
                  >
                    ยกเลิกคำสั่งซื้อ
                  </Button>
                )}
              </div>

              {/* ✅ ข้อมูลลูกค้า */}
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-2 text-lg">ข้อมูลลูกค้า</h3>
                <p>
                  👤 ผู้สั่งซื้อ: {selectedOrder.shippingInfo.Name}{" "}
                  {selectedOrder.userId.lastName}
                </p>
                <p>📞 เบอร์โทรศัพท์: {selectedOrder.shippingInfo.phone}</p>
              </div>

              {/* ✅ ที่อยู่จัดส่ง */}
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-2 text-lg">ที่อยู่การจัดส่ง</h3>
                <p>
                  {selectedOrder.shippingInfo.label},{" "}
                  {selectedOrder.shippingInfo.addressLine},{" "}
                  {selectedOrder.shippingInfo.city},{" "}
                  {selectedOrder.shippingInfo.province},{" "}
                  {selectedOrder.shippingInfo.postalCode}{" "}
                  {selectedOrder.shippingInfo.country}
                </p>
              </div>

              {selectedOrder.deliveryTracking?.trackingNumber && (
                <div className="bg-gray-50 p-4 rounded shadow-sm">
                  <h3 className="text-lg font-semibold text-gold-800 mb-2">
                    🚚 ข้อมูลการจัดส่งพัสดุ
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong>บริษัทขนส่ง:</strong>{" "}
                    {selectedOrder.deliveryTracking.carrier}
                  </p>
                  <p className="text-sm mt-2 text-gray-700">
                    <strong>เลขพัสดุ:</strong>{" "}
                    <span className="font-bold text-lg text-blue-600 mr-4">
                      {selectedOrder.deliveryTracking.trackingNumber}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          selectedOrder.deliveryTracking.trackingNumber
                        );
                        // แจ้งเตือนแบบ toast หรือ alert
                        Swal.fire({
                          toast: true,
                          position: "bottom-end",
                          icon: "success",
                          title: "คัดลอกเลขพัสดุแล้ว",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      }}
                      className="bg-blue-300 p-2 rounded-lg text-white  hover:text-black-600 hover:scale-105 hover:bg-blue-600 transition"
                      title="คัดลอกเลขพัสดุ"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </p>
                </div>
              )}

              {/* ✅ รายละเอียดสินค้า */}
              <div>
                <h3 className="font-semibold mb-2 text-lg">รายละเอียดสินค้า</h3>
                <Table className="border rounded shadow-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อสินค้า</TableHead>
                      <TableHead className="text-center">ขนาด</TableHead>
                      <TableHead className="text-center">จำนวน</TableHead>
                      <TableHead className="text-right">ราคา</TableHead>
                      <TableHead className="text-right">
                        ราคารวมทั้งหมด
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">
                          {item.size || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ฿{item.priceAtPurchase.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ฿
                          {(
                            item.priceAtPurchase * item.quantity
                          ).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* ✅ รวมราคาสินค้า + ค่าส่ง */}
                <div className="flex justify-end mt-4 pr-2">
                  <div className="text-right space-y-1">
                    <p className="text-sm">
                      รวมราคาสินค้า:{" "}
                      <span className="font-semibold">
                        ฿
                        {selectedOrder.items
                          .reduce(
                            (acc, item) =>
                              acc + item.priceAtPurchase * item.quantity,
                            0
                          )
                          .toLocaleString()}
                      </span>
                    </p>
                    <p className="text-sm">
                      ค่าจัดส่ง: <span className="font-semibold">฿50</span>
                    </p>
                    <hr className="my-2" />
                    <p className="font-bold text-xl text-green-600">
                      ราคารวมทั้งหมด: ฿
                      {(
                        selectedOrder.items.reduce(
                          (acc, item) =>
                            acc + item.priceAtPurchase * item.quantity,
                          0
                        ) + 50
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ สลิปการชำระเงิน */}
              {selectedOrder.payment.slipImage && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Payment Slip</h3>
                  <a
                    href={`${getBaseUrl()}${selectedOrder.payment.slipImage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-fit"
                  >
                    <img
                      src={`${getBaseUrl()}${selectedOrder.payment.slipImage}`}
                      alt="Payment Slip"
                      className="max-w-xs rounded shadow hover:opacity-90 transition"
                    />
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Orders;
