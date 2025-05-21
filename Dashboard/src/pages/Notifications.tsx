import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Package,
  MessageSquare,
  AlertTriangle,
  ShoppingBag,
  Check,
  ArrowDown,
  ArrowUp,
  Trash2,
  Eye,
} from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, subHours } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { getBaseUrl } from "@/lib/api";

type NotificationType = "order" | "message" | "stock" | "system";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: Date;
  read: boolean;
  link?: string;
}

// Icon mapping for notification types
const typeIcons: Record<NotificationType, React.ReactElement> = {
  order: <ShoppingBag size={16} />,
  message: <MessageSquare size={16} />,
  stock: <Package size={16} />,
  system: <AlertTriangle size={16} />,
};

// Background and text color mapping for notification types
const typeColors: Record<NotificationType, string> = {
  order: "bg-blue-100 text-blue-800 border-blue-200",
  message: "bg-green-100 text-green-800 border-green-200",
  stock: "bg-yellow-100 text-yellow-800 border-yellow-200",
  system: "bg-red-100 text-red-800 border-red-200",
};

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => !notif.read).length;
  const readCount = notifications.filter((notif) => notif.read).length;

  // Filter notifications
  const filteredNotifications = notifications.filter(
    (notification) =>
      (typeFilter === "all" || notification.type === typeFilter) &&
      (readFilter === "all" ||
        (readFilter === "read" && notification.read) ||
        (readFilter === "unread" && !notification.read)) &&
      (notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort notifications by date
  const sortedNotifications = [...filteredNotifications].sort((a, b) =>
    sortDirection === "desc"
      ? b.date.getTime() - a.date.getTime()
      : a.date.getTime() - b.date.getTime()
  );

  // Handle toggle sort
  const handleToggleSort = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`${getBaseUrl()}/api/notifications/read/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${getBaseUrl()}/api/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      toast({
        title: "Notifications Updated",
        description: "All notifications have been marked as read.",
      });
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${getBaseUrl()}/api/notifications/getNotifications`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        const formatted = data.notifications.map((n: any) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          date: new Date(n.createdAt),
          read: n.isRead,
          link: n.link,
        }));
        setNotifications(formatted);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Open delete confirmation dialog
  const openDeleteDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDeleteDialog(true);
  };

  // Handle notification delete
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;
    setIsLoading(true);
    try {
      await fetch(
        `${getBaseUrl()}/api/notifications/${selectedNotification.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      setNotifications((prev) =>
        prev.filter((n) => n.id !== selectedNotification.id)
      );

      toast({
        title: "Notification Deleted",
        description: "The notification has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting notification", err);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    setIsLoading(true);
    try {
      await fetch(`${getBaseUrl()}/api/notifications/clearAllNotifications`, {
        method: "DELETE",
        credentials: "include",
      });

      setNotifications([]);
      toast({
        title: "Notifications Cleared",
        description: "All notifications have been cleared.",
      });
    } catch (err) {
      console.error("Error clearing notifications", err);
    } finally {
      setIsLoading(false);
      setShowClearAllDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">การแจ้งเตือนทั้งหมด</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            คลิกเพื่ออ่านทั้งหมด
          </Button>
          <Button
            variant="outline"
            className="text-red-600"
            onClick={() => setShowClearAllDialog(true)}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบทั้งหมด
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              จำนวนการแจ้งเตือนทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              ที่ยังไม่ได้อ่าน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {unreadCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              ที่อ่านแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {readCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="stock">Stock Alerts</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <DatePickerWithRange className="w-full md:w-auto" />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">ประเภท</TableHead>
              <TableHead>การแจ้งเตือน</TableHead>
              <TableHead
                className="cursor-pointer w-[200px]"
                onClick={handleToggleSort}
              >
                วันที่
                {sortDirection === "asc" ? (
                  <ArrowUp className="inline ml-1 h-4 w-4" />
                ) : (
                  <ArrowDown className="inline ml-1 h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="w-[100px]">สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedNotifications.length > 0 ? (
              sortedNotifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  className={notification.read ? "" : "bg-rowhighlight"}
                >
                  <TableCell>
                    <Badge className={typeColors[notification.type]}>
                      <span className="flex items-center">
                        {typeIcons[notification.type]}
                        <span className="ml-1 hidden sm:inline">
                          {notification.type.charAt(0).toUpperCase() +
                            notification.type.slice(1)}
                        </span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={notification.read ? "" : "font-semibold"}>
                      {notification.title}
                      <div className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(notification.date, "MMM dd, yyyy")}
                    <div className="text-xs text-muted-foreground">
                      {format(notification.date, "HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell className="w-[150px]">
                    {notification.read ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        อ่านแล้ว
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        ยังไม่อ่าน
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check size={16} className="mr-1" />
                          คลิกเพื่ออ่าน
                        </Button>
                      )}
                      {notification.link && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={notification.link}><Eye size={16} className="mr-1"/></a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(notification)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center py-8">
                    <Bell size={40} className="text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">
                      ไม่พบการแจ้งเตือน
                    </h3>
                    <p className="text-muted-foreground">
                      ไม่พบการแจ้งเตือนที่ตรงกับเงื่อนไขที่คุณกําหนด
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        {selectedNotification && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">
                ลบการแจ้งเตือน
              </DialogTitle>
              <DialogDescription>
                คุณแน่ใจหรือไม่ว่าต้องการลบการแจ้งเตือนนี้
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h3 className="font-semibold">{selectedNotification.title}</h3>
              <p className="text-muted-foreground">
                {selectedNotification.message}
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteNotification}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "ลบการแจ้งเตือน"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Clear All Notifications
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all notifications? This will
              remove {notifications.length} notifications and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearAllDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={clearAllNotifications}
              disabled={isLoading}
            >
              {isLoading ? "Clearing..." : "Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
