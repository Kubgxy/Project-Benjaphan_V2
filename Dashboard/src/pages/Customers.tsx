import { useState, useEffect } from "react";
import axios from "axios";
import { Download, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { getBaseUrl } from "@/lib/api";
import { th } from "date-fns/locale";

type CustomerStatus = "active" | "unverified";

const statusColors: Record<CustomerStatus, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  unverified: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<"registeredDate" | "orders">(
    "registeredDate"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${getBaseUrl()}/api/user/getAllCustomers`,
          { withCredentials: true }
        );
        if (res.status !== 200) {
          throw new Error("Failed to fetch customers");
        }
        if (res.data.customers.length === 0) {
          throw new Error("No customers found");
        }

        // ✅ เก็บข้อมูลทั้งหมด + เพิ่ม field ที่ต้องใช้ใน frontend
        const formatted = res.data.customers.map((c: any) => ({
          ...c,
          fullName: `${c.firstName} ${c.lastName}`,
          avatar: c.avatar ? `${getBaseUrl()}${c.avatar}` : null,
          registeredDate: c.createdAt ? new Date(c.createdAt) : null,
          ordersCount: c.orders ? c.orders.length : 0,
          status: c.isVerified ? "active" : "unverified",
        }));

        setCustomers(formatted);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load customers" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      (filterStatus === "all" || customer.status === filterStatus) &&
      (customer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phoneNumber?.includes(searchQuery))
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === "registeredDate") {
      return sortDirection === "asc"
        ? (a.registeredDate?.getTime() || 0) -
            (b.registeredDate?.getTime() || 0)
        : (b.registeredDate?.getTime() || 0) -
            (a.registeredDate?.getTime() || 0);
    } else {
      return sortDirection === "asc"
        ? a.ordersCount - b.ordersCount
        : b.ordersCount - a.ordersCount;
    }
  });

  const handleSort = (column: "registeredDate" | "orders") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const exportToCSV = () => {
    toast({
      title: "Export Started",
      description: "Your CSV file is being generated.",
    });
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your CSV file is ready for download.",
      });
    }, 1500);
  };

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ลูกค้าทั้งหมด</h1>
        <Button
          onClick={exportToCSV}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unverified Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {customers.filter((c) => c.status === "unverified").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("registeredDate")}
              >
                Registered
                {sortBy === "registeredDate" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="inline ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="inline ml-1 h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("orders")}
              >
                Orders
                {sortBy === "orders" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="inline ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="inline ml-1 h-4 w-4" />
                  ))}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(null)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
            ) : sortedCustomers.length > 0 ? (
              sortedCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={customer.avatar || "/default-avatar.png"}
                          alt={customer.fullName}
                          className="h-16 w-16 object-cover"
                        />
                        <AvatarFallback>
                          {customer.fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          ID : {customer._id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Tel : {customer.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.registeredDate
                      ? format(customer.registeredDate, "d MMM yyyy", {
                          locale: th,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>{customer.ordersCount}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[customer.status as CustomerStatus]
                      }
                    >
                      {customer.status.charAt(0).toUpperCase() +
                        customer.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleViewDetails(customer)}
                    >
                      <Eye className="h-4 w-4" />
                      รายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal แสดงรายละเอียดลูกค้า */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              รายละเอียดลูกค้า
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* รูปภาพ + ชื่อ */}
              <div className="flex flex-col items-center text-center space-y-2">
                <Avatar className="h-24 w-24 ring-2 ring-primary">
                  <AvatarImage
                    src={selectedCustomer.avatar || "/default-avatar.png"}
                    alt={selectedCustomer.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg">
                    {selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold">
                    {selectedCustomer.fullName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tel: {selectedCustomer.phoneNumber}
                  </p>
                </div>
              </div>

              {/* ข้อมูลหลัก */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-semibold">Role:</span>{" "}
                    {selectedCustomer.role}
                  </p>
                  <p>
                    <span className="font-semibold">Provider:</span>{" "}
                    {selectedCustomer.provider}
                  </p>
                  <p>
                    <span className="font-semibold">Points:</span>{" "}
                    {selectedCustomer.points}
                  </p>
                  <p>
                    <span className="font-semibold">Level:</span>{" "}
                    {selectedCustomer.level}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">สถานะ:</span>{" "}
                    <span
                      className={
                        selectedCustomer.isVerified
                          ? "text-green-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {selectedCustomer.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">วันที่สมัคร:</span>{" "}
                    {selectedCustomer.createdAt
                      ? format(
                          new Date(selectedCustomer.createdAt),
                          "dd MMM yyyy HH:mm"
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* ที่อยู่ */}
              {selectedCustomer.addresses &&
                selectedCustomer.addresses.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 text-base">📍 ที่อยู่:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <span className="font-semibold">Label:</span>{" "}
                          {selectedCustomer.addresses[0].label}
                        </p>
                        <p>
                          <span className="font-semibold">Address:</span>{" "}
                          {selectedCustomer.addresses[0].addressLine}
                        </p>
                        <p>
                          <span className="font-semibold">City:</span>{" "}
                          {selectedCustomer.addresses[0].city}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-semibold">Province:</span>{" "}
                          {selectedCustomer.addresses[0].province}
                        </p>
                        <p>
                          <span className="font-semibold">Postal Code:</span>{" "}
                          {selectedCustomer.addresses[0].postalCode}
                        </p>
                        <p>
                          <span className="font-semibold">Country:</span>{" "}
                          {selectedCustomer.addresses[0].country}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
