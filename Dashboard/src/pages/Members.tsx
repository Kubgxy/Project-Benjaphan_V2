import { useEffect, useState } from "react";
import axios from "axios";
import { Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { getBaseUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface Member {
  _id: string;
  email: string;
  subscribedAt: string;
  userId: {
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
}

export default function MembersPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = members
    .filter((m) => {
      const fullName = `${m.userId.firstName} ${m.userId.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter((m) => {
      if (dateFilter === "all") return true;
      const subDate = new Date(m.subscribedAt);
      const now = new Date();
      if (dateFilter === "7days") {
        return subDate >= new Date(now.setDate(now.getDate() - 7));
      }
      if (dateFilter === "month") {
        return subDate.getMonth() === new Date().getMonth();
      }
      return true;
    });

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${getBaseUrl()}/api/user/getAllNewsletterMembers`, {
          withCredentials: true,
        });
        setMembers(res.data.members || []);
      } catch (err) {
        toast({ title: "โหลดข้อมูลล้มเหลว", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleExport = () => {
    toast({ title: "Export Started", description: "Exporting to CSV..." });
    setTimeout(() => {
      toast({ title: "Export Complete", description: "Download ready!" });
    }, 1500);
  };

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">สมาชิก</h1>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border rounded-md px-4 py-2 text-sm w-full md:w-48"
        >
          <option value="all">ทั้งหมด</option>
          <option value="7days">ภายใน 7 วัน</option>
          <option value="month">เดือนนี้</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ผู้ใช้</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>วันที่สมัคร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
              ) : filtered.length > 0 ? (
                filtered.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={m.userId.avatar ? `${getBaseUrl()}${m.userId.avatar}` : "/placeholder.jpg"}
                          alt={m.userId.firstName}
                          className="object-cover w-16 h-16"
                        />
                        <AvatarFallback>{m.userId.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {m.userId.firstName} {m.userId.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">ID: {m._id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>
                      {format(new Date(m.subscribedAt), "d MMM yyyy", { locale: th })}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-green-600 border-green-400" variant="outline">
                        Subscribed
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(m);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        รายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    ไม่พบสมาชิกที่ตรงกับคำค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal รายละเอียด */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">รายละเอียดสมาชิก</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 text-sm">
              <div className="text-center">
                <Avatar className="mx-auto h-24 w-24 ring-2 ring-primary">
                  <AvatarImage
                    src={
                      selectedMember.userId.avatar
                        ? `${getBaseUrl()}${selectedMember.userId.avatar}`
                        : "/placeholder.jpg"
                    }
                    className="object-cover w-24 h-24"
                  />
                  <AvatarFallback>
                    {selectedMember.userId.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-3 font-bold text-lg">
                  {selectedMember.userId.firstName} {selectedMember.userId.lastName}
                </div>
                <div className="text-muted-foreground">{selectedMember.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Role:</strong> {selectedMember.userId.role}</p>
                  <p>
                    <strong>สมัครเมื่อ:</strong>{" "}
                    {format(new Date(selectedMember.subscribedAt), "d MMM yyyy", { locale: th })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
