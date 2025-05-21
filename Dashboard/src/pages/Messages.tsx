import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, MailCheck, MailX, Mail, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ ใช้ SweetAlert2 Toast
import { getBaseUrl } from "@/lib/api";
import { th } from "date-fns/locale/th";

const Messages = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalRead, setTotalRead] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  const filteredMessages = messages.filter(
    (message) =>
      (readFilter === "all" ||
        (readFilter === "read" && message.isRead) ||
        (readFilter === "unread" && !message.isRead)) &&
      (message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const viewMessage = (message: any) => {
    setSelectedMessage(message);
    setShowMessageDialog(true);

    if (!message.isRead) {
      markAsRead(message._id);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await axios.patch(
        `${getBaseUrl()}/api/contact/markContactAsRead/${messageId}`,
        {},
        { withCredentials: true }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const openDeleteDialog = (message: any) => {
    setSelectedMessage(message);
    setShowDeleteDialog(true);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    setIsLoading(true);

    try {
      await axios.delete(
        `${getBaseUrl()}/api/contact/deleteContact/${selectedMessage._id}`,
        { withCredentials: true }
      );

      setMessages((prev) =>
        prev.filter((msg) => msg._id !== selectedMessage._id)
      );

      Swal.fire({
        toast: true,
        icon: "success",
        title: "ลบข้อความสำเร็จ",
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อความได้",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    fetchMessages(currentPage, typeFilter);
  }, [currentPage, typeFilter]);

  const fetchMessages = async (page: number, type = typeFilter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "7");
      if (type !== "all") {
        params.append("type", type); // ✅ ส่ง type เฉพาะประเภท (member/guest)
      }

      const response = await axios.get(
        `${getBaseUrl()}/api/contact/getAllContacts?${params.toString()}`,
        { withCredentials: true }
      );

      const data = response.data.data;
      setMessages(data.contacts);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setTotalUnread(data.totalUnread || 0);
      setTotalRead(data.totalRead || 0);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการติดต่อได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">การติดต่อทั้งหมด</h1>
        <Button
          variant="outline"
          onClick={() =>
            setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })))
          }
        >
          คลิกเพื่ออ่านทั้งหมด
        </Button>
      </div>

      {/* ✅ Stats Cards */}
      <div className="grid gap-4 max-w-6xl md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare size={16} /> 
              </CardTitle>
              <CardDescription>รวมข้อความทั้งหมด</CardDescription>
            </div>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MailX size={16} /> 
              </CardTitle>
              <CardDescription>ยังไม่ได้อ่าน</CardDescription>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {totalUnread}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MailCheck size={16} /> 
              </CardTitle>
              <CardDescription>อ่านแล้ว</CardDescription>
            </div>
            <div className="text-2xl font-bold text-green-600">{totalRead}</div>
          </CardHeader>
        </Card>
      </div>

      {/* ✅ Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border p-4 rounded-lg bg-white shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Input
            placeholder="ค้นหา ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="member">สมาชิก</SelectItem>
              <SelectItem value="guest">บุคคลทั่วไป</SelectItem>
            </SelectContent>
          </Select>

          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="read">อ่านแล้ว</SelectItem>
              <SelectItem value="unread">ยังไม่อ่าน</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DatePickerWithRange className="w-full md:w-auto" />
      </div>

      {/* ✅ Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] font-semibold text-center">
                สถานะ
              </TableHead>
              <TableHead className="font-semibold">ผู้ส่ง</TableHead>
              <TableHead className="font-semibold">หัวข้อ</TableHead>
              <TableHead className="font-semibold">วันที่ส่ง</TableHead>
              <TableHead className="font-semibold text-right">
                จัดการ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  {[...Array(5)].map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedMessages.length > 0 ? (
              sortedMessages.map((msg) => (
                <TableRow
                  key={msg._id}
                  className={`hover:bg-gray-100 transition ${
                    !msg.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <TableCell className="text-center">
                    {msg.isRead ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        <MailCheck size={14} className="mr-1" />
                        Read
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        <Mail size={14} className="mr-1" />
                        Unread
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className={msg.isRead ? "font-normal" : "font-bold"}>
                        {msg.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {msg.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      <span
                        className={msg.isRead ? "font-normal" : "font-bold"}
                      >
                        {msg.subject}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(msg.createdAt), "d MMM yyyy", {
                      locale: th,
                    })}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewMessage(msg)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(msg)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <MessageSquare
                    size={40}
                    className="text-muted-foreground mb-2 mx-auto"
                  />
                  <p className="text-sm text-muted-foreground">
                    ไม่พบข้อมูล
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex justify-end mr-4 mt-6 space-x-2 pb-6">
          {totalPages > 1 && (
            <>
              {/* First page */}
              <Button
                size="sm"
                className="rounded-full"
                variant={currentPage === 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>

              {/* Show dots if needed */}
              {currentPage > 3 && totalPages > 5 && (
                <span className="flex items-center px-2">...</span>
              )}

              {/* Middle pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) <= 1
                )
                .map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    className="rounded-full"
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

              {/* Show dots if needed */}
              {currentPage < totalPages - 2 && totalPages > 5 && (
                <span className="flex items-center px-2">...</span>
              )}

              {/* Last page */}
              {totalPages > 1 && (
                <Button
                  size="sm"
                  className="rounded-full"
                  variant={currentPage === totalPages ? "default" : "outline"}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        {selectedMessage && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <MessageSquare size={20} className="text-blue-500" />
                {selectedMessage.subject}
              </DialogTitle>
              <DialogDescription className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  👤 <span className="font-medium">{selectedMessage.name}</span>
                  (<span>{selectedMessage.email}</span>)
                  {selectedMessage.userId ? (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-green-100 text-green-700"
                    >
                      สมาชิก
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-yellow-100 text-yellow-700"
                    >
                      บุคคลทั่วไป
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  📞 <span>{selectedMessage.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  🕒{" "}
                  <span>
                    {format(
                      new Date(selectedMessage.createdAt),
                      "d MMM yyyy HH:mm:ss", {
                        locale: th,}
                    )}
                  </span>
                </div>
                <div>
                  {selectedMessage.isRead ? (
                    <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      <MailCheck size={14} className="mr-1" /> อ่านแล้ว
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      <Mail size={14} className="mr-1" /> ยังไม่ได้อ่าน
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <h4 className="text-lg font-semibold ">
                เรื่อง : {selectedMessage.subject}
              </h4>
              <div className="border rounded-lg bg-gray-50 p-4 max-h-[400px] overflow-y-auto">
                <blockquote className="whitespace-pre-line text-sm text-gray-700">
                  รายละเอียด : {selectedMessage.message}
                </blockquote>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowMessageDialog(false)}
              >
                ปิด
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowMessageDialog(false);
                  setTimeout(() => openDeleteDialog(selectedMessage), 100);
                }}
              >
                ลบ
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ✅ Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        {selectedMessage && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this message from{" "}
                {selectedMessage.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteMessage}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Messages;
