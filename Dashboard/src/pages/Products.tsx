import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Edit, Trash2, Plus, Search, FileDown, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableImage } from "@/components/dashboard/SortableImage";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { getBaseUrl } from "@/lib/api";

export interface Product {
  _id: string; // MongoDB _id
  id_product: string; // รหัสสินค้า
  name: string; // ชื่อสินค้า
  category: string; // หมวดหมู่
  price: number; // ราคาปกติ
  salePrice?: number; // ราคาลด (optional)
  discount?: number; // ส่วนลด % (optional)
  description?: string; // คำอธิบายย่อ
  details: string[]; // รายละเอียดเพิ่มเติม (array)
  availableSizes: {
    // ขนาด + จำนวน
    size: string;
    quantity: number;
  }[];
  images: string[]; // URL รูปสินค้า
  rating: number; // ค่าเฉลี่ย rating
  reviews: number; // จำนวนรีวิว
  isNewArrival: boolean; // flag สินค้าใหม่
  isBestseller: boolean; // flag ขายดี
  isOnSale: boolean; // flag ลดราคา
  metaTitle?: string; // SEO title (optional)
  metaDescription?: string; // SEO description (optional)
  createdAt?: string; // วันสร้าง (ISO string)
  updatedAt?: string; // วันอัปเดต (ISO string)
  stock?: number; // 💡 Virtual field → stock รวมจาก availableSizes
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}
interface CombinedImageItem {
  type: "url" | "file";
  value: string | File;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    _id: "",
    id_product: "",
    name: "",
    category: "",
    price: 0,
    salePrice: 0,
    discount: 0,
    availableSizes: [] as { size: string; quantity: number }[],
    description: "",
    details: [] as string[],
    images: [] as File[],
    isNewArrival: false,
    isBestseller: false,
    isOnSale: false,
    metaTitle: "",
    metaDescription: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // 🏗 เพิ่ม state รวมรูป (URL + File) → ใช้เป็นตัวกลางหลัก
  const [combinedImages, setCombinedImages] = useState<CombinedImageItem[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));


  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/api/product/getAllProducts`,
        { withCredentials: true }
      );
      setProducts(response.data.products);
      console.log("Fetched products:", response.data.products); // Debugging line
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!addDialogOpen) {
      setPreviewImage(null);
    }
  }, [addDialogOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewImage]);

  const requestSort = (key: string) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const calculateStock = (availableSizes: any) => {
    if (!availableSizes || !Array.isArray(availableSizes)) return 0;
    return availableSizes.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter !== "all" ? product.category === categoryFilter : true;
    const matchesStatus =
      statusFilter !== "all"
        ? statusFilter === "Active"
          ? calculateStock(product.availableSizes) > 0
          : calculateStock(product.availableSizes) === 0
        : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Product];
    const bValue = b[sortConfig.key as keyof Product];

    if (aValue == null || bValue == null) return 0;

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("👉 images ที่ส่ง:", newProduct.images);

    try {
      const formData = new FormData();
      formData.append("id_product", newProduct.id_product);
      formData.append("name", newProduct.name);
      formData.append("category", newProduct.category);
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description);
      formData.append("details", JSON.stringify(newProduct.details));
      formData.append(
        "availableSizes",
        JSON.stringify(newProduct.availableSizes)
      );
      formData.append("isNewArrival", newProduct.isNewArrival.toString());
      formData.append("isBestseller", newProduct.isBestseller.toString());
      formData.append("isOnSale", newProduct.isOnSale.toString());
      formData.append("salePrice", newProduct.salePrice.toString());
      formData.append("discount", newProduct.discount.toString());
      formData.append("metaTitle", newProduct.metaTitle);
      formData.append("metaDescription", newProduct.metaDescription);

      combinedImages
        .filter((item) => item.type === "file")
        .forEach((image) => {
          formData.append("images", image.value as File);
        });

      await axios.post(
        `${getBaseUrl()}/api/product/addProducts`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast({ title: "✅ เพิ่มสินค้าสำเร็จ!" });
      setAddDialogOpen(false);
      fetchProducts();
      resetNewProduct();
    } catch (error) {
      console.error("❌ Error adding product:", error);
      toast({ title: "❌ เพิ่มสินค้าไม่สำเร็จ" });
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🛠 combinedImages ก่อนส่ง:", combinedImages);

    try {
      const formData = new FormData();

      formData.append("name", newProduct.name);
      formData.append("id_product", newProduct.id_product);
      formData.append("category", newProduct.category);
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description);
      formData.append("details", JSON.stringify(newProduct.details));
      formData.append(
        "availableSizes",
        JSON.stringify(newProduct.availableSizes)
      );
      formData.append("isNewArrival", newProduct.isNewArrival.toString());
      formData.append("isBestseller", newProduct.isBestseller.toString());
      formData.append("isOnSale", newProduct.isOnSale.toString());
      formData.append("salePrice", newProduct.salePrice.toString());
      formData.append("discount", newProduct.discount.toString());
      formData.append("metaTitle", newProduct.metaTitle);
      formData.append("metaDescription", newProduct.metaDescription);

      // แยกรูปที่เป็นไฟล์ใหม่
      const filesToSend = combinedImages
        .filter((item) => item.type === "file")
        .map((item) => item.value as File);

      // แยกรูปเดิม (URL) ส่งไปบอก backend ว่าไม่ต้องลบทิ้ง
      const existingUrls = combinedImages
        .filter((item) => item.type === "url")
        .map((item) => item.value as string);

      // ✅ ส่ง URL เดิม
      formData.append("existingImages", JSON.stringify(existingUrls));

      // ✅ ส่งไฟล์ใหม่
      filesToSend.forEach((file) => {
        formData.append("images", file);
      });

      await axios.patch(
        `${getBaseUrl()}/api/product/updateProducts/${newProduct.id_product}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast({ title: "✅ อัปเดตสินค้าสำเร็จ!" });
      setAddDialogOpen(false);
      fetchProducts();
      resetNewProduct();
    } catch (error) {
      console.error("❌ Error updating product:", error);
      toast({ title: "❌ อัปเดตสินค้าไม่สำเร็จ" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(
        `${getBaseUrl()}/api/product/delProducts/${productToDelete}`,
        { withCredentials: true }
      );

      toast({ title: "✅ ลบสินค้าสำเร็จ!" });
      fetchProducts();
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      toast({ title: "❌ ลบสินค้าไม่สำเร็จ" });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setNewProduct({
      _id: product._id,
      id_product: product.id_product,
      name: product.name,
      category: product.category,
      price: product.price,
      salePrice: product.salePrice || 0,
      discount: product.discount || 0,
      availableSizes: product.availableSizes,
      description: product.description,
      details: product.details,
      images: [] as File[],
      isNewArrival: product.isNewArrival,
      isBestseller: product.isBestseller,
      isOnSale: product.isOnSale,
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
    });
    // ⚡ โหลดรูปเดิมเข้า combinedImages
    setCombinedImages(
      product.images.map((url) => ({ type: "url", value: url }))
    );

    setIsEditMode(true);
    setAddDialogOpen(true);
  };

  const resetNewProduct = () => {
    setNewProduct({
      _id: "",
      id_product: "",
      name: "",
      category: "",
      price: 0,
      salePrice: 0,
      discount: 0,
      availableSizes: [] as { size: string; quantity: number }[],
      description: "",
      details: [] as string[],
      images: [] as File[],
      isNewArrival: false,
      isBestseller: false,
      isOnSale: false,
      metaTitle: "",
      metaDescription: "",
    });
    setCombinedImages([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(sortedProducts.map((product) => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (checked: boolean, productId: string) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleExportCsv = () => {
    toast({ title: "CSV Export ยังไม่ทำ" });
  };

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">สินค้า</h1>
          <Button
            className="flex items-center"
            onClick={() => {
              resetNewProduct();
              setIsEditMode(false);
              setAddDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มสินค้า
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ค้นหาสินค้า..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="หมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>{" "}
              {/* ตรงนี้ต้องมี all */}
              {uniqueCategories.filter(Boolean).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="Active">เปิดใช้งาน</SelectItem>
              <SelectItem value="Inactive">ปิดใช้งาน</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-background border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <Checkbox
                checked={
                  selectedProducts.length === sortedProducts.length &&
                  sortedProducts.length > 0
                }
                onCheckedChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm text-muted-foreground">
                เลือก {selectedProducts.length} จาก {sortedProducts.length}{" "}
                รายการ
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <FileDown className="mr-2 h-4 w-4" />
              ส่งออก
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>รูปภาพ</TableHead>
                  <TableHead
                    onClick={() => requestSort("name")}
                    className="cursor-pointer"
                  >
                    ชื่อสินค้า
                  </TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>ราคาลด</TableHead>
                  <TableHead>คงเหลือ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>แท็ก</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onCheckedChange={(c) =>
                            handleSelectOne(!!c, product._id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? `${getBaseUrl()}${product.images[0]}`
                              : "/default-image.jpg" // ใช้รูป default สำรอง
                          }
                          className="h-12 w-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>฿{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        {product.salePrice
                          ? `฿${product.salePrice.toLocaleString()} (-${
                              product.discount
                            }%)`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {calculateStock(product.availableSizes)}
                      </TableCell>
                      {/* ✅ ใช้ฟังก์ชันคำนวณ stock */}
                      <TableCell>
                        <Badge
                          className={
                            calculateStock(product.availableSizes) > 0
                              ? "bg-emerald"
                              : "bg-muted"
                          }
                        >
                          {calculateStock(product.availableSizes) > 0
                            ? "เปิดใช้งาน"
                            : "ปิดใช้งาน"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1">
                        {product.isNewArrival && (
                          <Badge className="bg-purple">ใหม่</Badge>
                        )}
                        {product.isBestseller && (
                          <Badge className="bg-gold">ขายดี</Badge>
                        )}
                        {product.isOnSale && (
                          <Badge className="bg-ruby">ลดราคา</Badge>
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(product)} // <<< โหลดข้อมูลเข้า Dialog
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-ruby hover:text-ruby/80"
                          onClick={() => {
                            setProductToDelete(product._id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      ไม่มีข้อมูลสินค้า
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการลบสินค้า?</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                ลบ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <>
          {!previewImage && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-4xl overflow-visible">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                    <hr className="my-2 border-t border-gray-300"></hr>
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={isEditMode ? handleUpdateProduct : handleAddProduct}
                  className="space-y-1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ซ้าย: ข้อมูลหลัก */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">ข้อมูลสินค้า</h2>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              ⓘ
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            ใส่รายละเอียดของสินค้า <br />
                            เช่น <strong>รหัสสินค้า</strong>,{" "}
                            <strong>ชื่อสินค้า</strong>, <br />
                            <strong>หมวดหมู่</strong> (เช่น ชะลอม, กำไล, น้ำหอม){" "}
                            <br />
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        placeholder="รหัสสินค้า"
                        required
                        value={newProduct.id_product}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            id_product: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="ชื่อสินค้า"
                        required
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                      />
                      <Input
                        placeholder="หมวดหมู่ (เช่น ชะลอม, กำไล, น้ำหอม)"
                        required
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                          })
                        }
                      />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold">ราคา</h2>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                ⓘ
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              ใส่ <strong>ราคา</strong> ของสินค้าเป็นจำนวนเต็ม
                              เช่น 100,350,500 <br />
                              กรอก <strong>ส่วนลด</strong> เป็นเปอร์เซ็นต์ เช่น
                              20% <br />
                              และ <strong>
                                ราคาลด
                              </strong> จะคำนวณให้โดยอัตโนมัติ <br />
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex flex-col w-full">
                            <Input
                              type="number"
                              placeholder="ราคา (บาท)"
                              required
                              value={
                                newProduct.price === 0 ? "" : newProduct.price
                              }
                              onChange={(e) => {
                                const price =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                const discount = Math.min(
                                  newProduct.discount,
                                  100
                                ); // กันส่วนลดเกิน 100%
                                const salePrice =
                                  price && discount
                                    ? Math.round(
                                        price - price * (discount / 100)
                                      )
                                    : 0;
                                setNewProduct({
                                  ...newProduct,
                                  price,
                                  discount,
                                  salePrice,
                                });
                              }}
                            />
                          </div>
                          <div className="flex flex-col w-full">
                            <Input
                              type="number"
                              placeholder="ส่วนลด (%)"
                              value={
                                newProduct.discount === 0
                                  ? ""
                                  : newProduct.discount
                              }
                              onChange={(e) => {
                                let discount =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                if (discount > 100) discount = 100; // ไม่ให้เกิน 100%
                                const price = newProduct.price;
                                const salePrice =
                                  price && discount
                                    ? Math.round(
                                        price - price * (discount / 100)
                                      )
                                    : 0;
                                setNewProduct({
                                  ...newProduct,
                                  discount,
                                  salePrice,
                                });
                              }}
                            />
                          </div>
                          <div className="flex flex-col w-full">
                            <Input
                              type="number"
                              placeholder="ราคาลด (บาท)"
                              value={
                                newProduct.salePrice === 0
                                  ? ""
                                  : newProduct.salePrice
                              }
                              disabled
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">รายละเอียด</h2>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              ⓘ
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            ใส่ <strong>รายละเอียดสั้น</strong>{" "}
                            เพื่อสรุปจุดเด่นหรือข้อมูลสำคัญ เช่น สี, วัสดุ,
                            เหมาะกับใคร <br />
                            <strong>Meta Title</strong> คือ ชื่อ SEO ของสินค้า
                            ควรเขียนกระชับชัดเจน เช่น “สร้อยทองแท้ 96.5%” <br />
                            <strong>Meta Description</strong> คือ คำอธิบาย SEO
                            ใช้บอกจุดขาย, จุดเด่น, หรือโปรโมชั่น ของสินค้า{" "}
                            <br />
                            เช่น “สร้อยทองแท้ราคาพิเศษ ลดสูงสุด 20% ส่งฟรี”{" "}
                            <br />
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        placeholder="รายละเอียดสั้น"
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            description: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Meta Title"
                        value={newProduct.metaTitle}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            metaTitle: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Meta Description"
                        value={newProduct.metaDescription}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            metaDescription: e.target.value,
                          })
                        }
                      />

                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={newProduct.isNewArrival}
                            onCheckedChange={(checked) =>
                              setNewProduct({
                                ...newProduct,
                                isNewArrival: !!checked,
                              })
                            }
                          />
                          <span>ใหม่</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={newProduct.isBestseller}
                            onCheckedChange={(checked) =>
                              setNewProduct({
                                ...newProduct,
                                isBestseller: !!checked,
                              })
                            }
                          />
                          <span>ขายดี</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={newProduct.isOnSale}
                            onCheckedChange={(checked) =>
                              setNewProduct({
                                ...newProduct,
                                isOnSale: !!checked,
                              })
                            }
                          />
                          <span>ลดราคา</span>
                        </label>
                      </div>
                    </div>

                    {/* ขวา: รายละเอียดเพิ่มเติม + ขนาดและจำนวน */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          รายละเอียดเพิ่มเติม
                        </h2>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              ⓘ
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            ใส่รายละเอียดเพิ่มเติม เช่น <br />
                            "น้ำหนัก: 0.5 บาท", "ทองคำแท้ผสม",
                            "ดีไซน์ลายดอกไม้", <br />
                            "รับประกันสินค้าตลอดชีพ", "มีใบรับประกันสินค้า"
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {newProduct.details.map((detail, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder={`รายละเอียด #${index + 1}`}
                            value={detail}
                            onChange={(e) => {
                              const updated = [...newProduct.details];
                              updated[index] = e.target.value;
                              setNewProduct({
                                ...newProduct,
                                details: updated,
                              });
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const updated = newProduct.details.filter(
                                (_, i) => i !== index
                              );
                              setNewProduct({
                                ...newProduct,
                                details: updated,
                              });
                            }}
                          >
                            🗑️
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setNewProduct({
                            ...newProduct,
                            details: [...newProduct.details, ""],
                          })
                        }
                      >
                        ➕ เพิ่มรายละเอียด
                      </Button>

                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          ขนาดและจำนวนสินค้า
                        </h2>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              ⓘ
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            ใส่ <strong>ไซส์</strong> และ <strong>จำนวน</strong>{" "}
                            ของสินค้า เช่น <br />
                            "ไซส์ S: 10 ชิ้น", "ไซส์ M: 5 ชิ้น", "ไซส์ L: 0
                            ชิ้น" <br />
                            ถ้าไม่มีไซส์ใดๆ ให้ใส่เป็น 0 เพื่อปิดการขายไซส์นั้นๆ
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {newProduct.availableSizes.map((sizeObj, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="ไซส์ (เช่น S, M, L)"
                            value={sizeObj.size}
                            onChange={(e) => {
                              const updated = [...newProduct.availableSizes];
                              updated[index].size = e.target.value;
                              setNewProduct({
                                ...newProduct,
                                availableSizes: updated,
                              });
                            }}
                          />
                          <Input
                            placeholder="จำนวน"
                            type="number"
                            value={sizeObj.quantity}
                            onChange={(e) => {
                              const updated = [...newProduct.availableSizes];
                              updated[index].quantity = Number(e.target.value);
                              setNewProduct({
                                ...newProduct,
                                availableSizes: updated,
                              });
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const updated = newProduct.availableSizes.filter(
                                (_, i) => i !== index
                              );
                              setNewProduct({
                                ...newProduct,
                                availableSizes: updated,
                              });
                            }}
                          >
                            🗑️
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setNewProduct({
                            ...newProduct,
                            availableSizes: [
                              ...newProduct.availableSizes,
                              { size: "", quantity: 0 },
                            ],
                          })
                        }
                      >
                        ➕ เพิ่มไซส์
                      </Button>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">รูปภาพและแท็ก</h2>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              ⓘ
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            อัปโหลด <strong>รูปภาพสินค้า</strong> <br />
                            เช่น รูปภาพหลัก, รูปภาพมุมต่างๆ, รูปภาพการใช้งาน{" "}
                            <br />
                            สามารถลากเพื่อจัดเรียงลำดับได้
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            const filesArray = Array.from(e.target.files);

                            setCombinedImages((prev) => [
                              ...prev,
                              ...filesArray.map((file) => ({
                                type: "file" as const,
                                value: file,
                              })),
                            ]);
                          }
                        }}
                      />

                      {/* Drag and Drop Sortable Context */}
                      {combinedImages.length > 0 && (
                        <DndContext
                          collisionDetection={closestCenter}
                          sensors={sensors}
                          onDragEnd={({ active, over }) => {
                            if (!active.id || !over?.id) return;

                            const oldIndex = parseInt(active.id as string);
                            const newIndex = parseInt(over.id as string);
                            const reordered = arrayMove(
                              combinedImages,
                              oldIndex,
                              newIndex
                            );

                            // ⚡ อัพเดต combinedImages โดยตรง (รวมทั้งไฟล์ใหม่ + URL เดิม)
                            setCombinedImages(reordered);
                          }}
                        >
                          <SortableContext
                            items={combinedImages.map((_, i) => i.toString())}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="flex gap-2 flex-wrap mt-2">
                              {combinedImages.map((item, index) => (
                                <SortableImage
                                  key={index}
                                  id={index.toString()}
                                  index={index}
                                  imageUrl={
                                    item.type === "file"
                                      ? URL.createObjectURL(item.value as File)
                                      : `${getBaseUrl()}${
                                          item.value as string
                                        }`
                                  }
                                  onRemove={(idx) => {
                                    const updated = combinedImages.filter(
                                      (_, i) => i !== idx
                                    );
                                    setCombinedImages(updated);
                                  }}
                                  onPreview={(url) => setPreviewImage(url)}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  </div>

                  {/* SECTION: ปุ่มล่าง */}
                  <DialogFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetNewProduct}
                    >
                      ล้างค่า
                    </Button>
                    <Button type="submit">
                      {isEditMode ? "อัปเดตสินค้า" : "บันทึกสินค้า"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </>
      </div>
      {/* ✅ POPUP Preview แยกออกมาอยู่นอก Dialog เลย */}
      {previewImage &&
        createPortal(
          <div
            id="preview-layer"
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()} // กันคลิกทะลุ
            >
              <button
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 text-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
              >
                ×
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-screen object-contain rounded shadow-lg"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Products;
