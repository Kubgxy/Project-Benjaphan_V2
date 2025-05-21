import { useState, useEffect } from "react";
import axios from "axios";
import { Check, Save, Lock, Store, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getBaseUrl } from "@/lib/api";

// Define schema for store settings
const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeDescription: z.string().optional(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(1, "Address is required"),
  currency: z.string().min(1, "Currency is required"),
  displayPricesWithTax: z.boolean(),
  allowGuestCheckout: z.boolean(),
  showOutOfStockItems: z.boolean(),
  enableCustomerRegistration: z.boolean(),
});

// Define schema for promotion settings
const promotionSettingsSchema = z.object({
  defaultDiscountPercentage: z.coerce.number().min(0).max(100),
  enableAutomaticDiscounts: z.boolean(),
  minOrderValueForDiscount: z.coerce.number().min(0),
  maxDiscountAmount: z.coerce.number().min(0),
  displayDiscountBadges: z.boolean(),
  enableFlashSales: z.boolean(),
  promotionBannerText: z
    .string()
    .max(100, "Banner text must be less than 100 characters"),
});

// Define schema for security settings
const securitySettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Settings = () => {
  const { toast } = useToast();
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Store settings form
  const storeForm = useForm<z.infer<typeof storeSettingsSchema>>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: "Lucky Jewelry",
      storeDescription:
        "Authentic Thai amulets and jewelry for prosperity and good fortune",
      contactEmail: "contact@luckyjewelry.com",
      contactPhone: "+66 98 765 4321",
      address: "123 Prosperity Lane, Bangkok, Thailand",
      currency: "THB",
      displayPricesWithTax: true,
      allowGuestCheckout: true,
      showOutOfStockItems: false,
      enableCustomerRegistration: true,
    },
  });

  // Promotion settings form
  const adminProfileSchema = z.object({
    firstName: z.string().min(1, "กรุณากรอกชื่อ"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
    phoneNumber: z.string().regex(/^\d{9,10}$/, "เบอร์โทรต้องมี 9–10 หลัก"),
  });

  const adminForm = useForm<z.infer<typeof adminProfileSchema>>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  // Security settings form
  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    axios
      .get(`${getBaseUrl()}/api/setting/getHomepage`, { withCredentials: true })
      .then((res) => {
        const homepage = res.data.homepage;
        setBannerTitle(homepage.bannerTitle || "");
        setBannerSubtitle(homepage.bannerSubtitle || "");
        setBannerDescription(homepage.bannerDescription || "");

        if (homepage.bannerImage) {
          const fullImagePath = homepage.bannerImage.startsWith("http")
            ? homepage.bannerImage
            : `${getBaseUrl()}/${homepage.bannerImage}`;
          setPreviewImage(fullImagePath);
        }
      })
      .catch((err) => {
        console.error("Failed to load homepage content", err);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${getBaseUrl()}/api/user/getUserProfile`, { withCredentials: true })
      .then((res) => {
        const user = res.data.user;
        adminForm.reset({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });

        if (user.avatar) {
          setAvatarPreview(`${getBaseUrl()}${user.avatar}`);
        }
      })
      .catch((err) => {
        console.error("โหลดข้อมูลผู้ใช้ล้มเหลว", err);
      });
  }, []);

  const handleHomepageSave = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("bannerTitle", bannerTitle);
      formData.append("bannerSubtitle", bannerSubtitle);
      formData.append("bannerDescription", bannerDescription);
      if (bannerImage) formData.append("bannerImage", bannerImage);

      const res = await axios.post(
        `${getBaseUrl()}/api/setting/updateHomepage`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast({
        title: "Homepage Updated",
        description: "Homepage content has been saved successfully.",
      });

      setPreviewImage(`${getBaseUrl()}/${res.data.homepage.bannerImage}`);
    } catch (err) {
      console.error("Failed to update homepage", err);
      toast({
        title: "Error",
        description: "Something went wrong while updating homepage.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSave = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      const data = adminForm.getValues();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await axios.patch(
        `${getBaseUrl()}/api/user/updateUser`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast({
        title: "อัปเดตข้อมูลสำเร็จ",
        description: "ข้อมูลผู้ดูแลระบบถูกอัปเดตเรียบร้อยแล้ว",
      });

      if (res.data.user.avatar) {
        setAvatarPreview(`${getBaseUrl()}${res.data.user.avatar}`);
      }
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err?.response?.data?.message || "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle security settings submission
  const onSecuritySubmit = (data: z.infer<typeof securitySettingsSchema>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Password changed"); // Don't log actual passwords!
      setIsLoading(false);

      // Reset form
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password Changed",
        description: "Your admin password has been updated successfully.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings, promotions, and security
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="admin">Admin Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Store Settings Tab */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
              <CardDescription>
                Set content for the banner on the storefront homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 1. Banner Preview */}
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Banner preview"
                  className="rounded-lg max-h-48 object-cover"
                />
              )}

              {/* 2. Upload Banner Image */}
              <div>
                <Label>Banner Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBannerImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              {/* 3. Title */}
              <div>
                <Label>Banner Title</Label>
                <Input
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Enter banner title"
                />
              </div>

              {/* 4. Subtitle */}
              <div>
                <Label>Banner Subtitle</Label>
                <Textarea
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Enter banner subtitle"
                />
              </div>

              {/* 5. Description */}
              <div>
                <Label>Banner Description</Label>
                <Textarea
                  value={bannerDescription}
                  onChange={(e) => setBannerDescription(e.target.value)}
                  placeholder="Enter banner Description"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleHomepageSave}
                disabled={isLoading}
                className="ml-auto"
              >
                <Save className="mr-2 w-4 h-4" />
                {isLoading ? "Saving..." : "Save Homepage"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="admin">
          <Form {...adminForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdminSave();
              }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="mr-2" size={20} />
                    Admin Info
                  </CardTitle>
                  <CardDescription>
                    Update your admin profile and contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Avatar */}
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <Label>Avatar</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>

                  {/* First Name */}
                  <FormField
                    control={adminForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name */}
                  <FormField
                    control={adminForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={adminForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={adminForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Admin Info"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Form {...securityForm}>
            <form
              onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2" size={20} />
                    Change Admin Password
                  </CardTitle>
                  <CardDescription>
                    Update your admin account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters and include
                          uppercase, lowercase, numbers, and special characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="ml-auto"
                    disabled={isLoading || !securityForm.formState.isDirty}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
