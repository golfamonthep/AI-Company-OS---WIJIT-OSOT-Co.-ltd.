import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Upload, X, Package, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

interface ProductFormData {
  slug: string;
  name: string;
  subtitle: string;
  shortDesc: string;
  benefits: string; // newline-separated
  size: string;
  price: string;
  promoPrice: string;
  rating: string; // "4.9"
  sold: string;
  image: string;
  category: string;
  badge: string;
  shopeeUrl: string;
  tiktokUrl: string;
  lineUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: ProductFormData = {
  slug: "",
  name: "",
  subtitle: "",
  shortDesc: "",
  benefits: "",
  size: "",
  price: "",
  promoPrice: "",
  rating: "5.0",
  sold: "",
  image: "",
  category: "สมุนไพรไทย",
  badge: "",
  shopeeUrl: "",
  tiktokUrl: "",
  lineUrl: "",
  sortOrder: "0",
  isActive: true,
};

function toApiData(form: ProductFormData) {
  return {
    slug: form.slug,
    name: form.name,
    subtitle: form.subtitle || null,
    shortDesc: form.shortDesc || null,
    benefits: form.benefits
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    size: form.size || null,
    price: form.price || null,
    promoPrice: form.promoPrice || null,
    rating: Math.round(parseFloat(form.rating || "0") * 10),
    sold: form.sold || null,
    image: form.image || null,
    category: form.category || null,
    badge: form.badge || null,
    shopeeUrl: form.shopeeUrl || null,
    tiktokUrl: form.tiktokUrl || null,
    lineUrl: form.lineUrl || null,
    sortOrder: parseInt(form.sortOrder || "0", 10),
    isActive: form.isActive,
  };
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

export default function AdminProductForm({ productId }: { productId?: number }) {
  const isEdit = productId !== undefined;
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  // Load existing product for edit
  const { data: existingProduct, isLoading: loadingProduct } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: isEdit },
  );

  useEffect(() => {
    if (existingProduct) {
      setForm({
        slug: existingProduct.slug ?? "",
        name: existingProduct.name ?? "",
        subtitle: existingProduct.subtitle ?? "",
        shortDesc: existingProduct.shortDesc ?? "",
        benefits: (existingProduct.benefits ?? []).join("\n"),
        size: existingProduct.size ?? "",
        price: existingProduct.price ?? "",
        promoPrice: existingProduct.promoPrice ?? "",
        rating: (((existingProduct.rating ?? 0) / 10).toFixed(1)),
        sold: existingProduct.sold ?? "",
        image: existingProduct.image ?? "",
        category: existingProduct.category ?? "",
        badge: existingProduct.badge ?? "",
        shopeeUrl: existingProduct.shopeeUrl ?? "",
        tiktokUrl: existingProduct.tiktokUrl ?? "",
        lineUrl: existingProduct.lineUrl ?? "",
        sortOrder: String(existingProduct.sortOrder ?? 0),
        isActive: existingProduct.isActive ?? true,
      });
      setImagePreview(existingProduct.image ?? "");
    }
  }, [existingProduct]);

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("เพิ่มสินค้าเรียบร้อยแล้ว");
      utils.products.listAll.invalidate();
      utils.products.listPublic.invalidate();
      setLocation("/admin/products");
    },
    onError: (e) => toast.error("เกิดข้อผิดพลาด: " + e.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("บันทึกการแก้ไขเรียบร้อยแล้ว");
      utils.products.listAll.invalidate();
      utils.products.listPublic.invalidate();
      setLocation("/admin/products");
    },
    onError: (e) => toast.error("เกิดข้อผิดพลาด: " + e.message),
  });

  const uploadMutation = trpc.upload.productImage.useMutation({
    onSuccess: (data) => {
      setForm((prev) => ({ ...prev, image: data.url }));
      setImagePreview(data.url);
      setIsUploading(false);
      toast.success("อัปโหลดรูปภาพสำเร็จ");
    },
    onError: (e) => {
      setIsUploading(false);
      toast.error("อัปโหลดไม่สำเร็จ: " + e.message);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        filename: file.name,
        contentType: file.type,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("กรุณากรอกชื่อสินค้า");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("กรุณากรอก Slug");
      return;
    }
    const data = toApiData(form);
    if (isEdit) {
      updateMutation.mutate({ id: productId!, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const set = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "แก้ไขข้อมูลสินค้าและบันทึก" : "กรอกข้อมูลสินค้าใหม่"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">รูปภาพสินค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div
                  className="w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 overflow-hidden flex items-center justify-center bg-muted cursor-pointer hover:border-primary/50 transition-colors shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Package className="w-8 h-8" />
                      <span className="text-xs">คลิกเพื่ออัปโหลด</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-3 h-3" />
                    {isUploading ? "กำลังอัปโหลด..." : "เลือกรูปภาพ"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    รองรับ JPG, PNG, WebP · ขนาดไม่เกิน 5MB
                  </p>
                  {form.image && (
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-green-600 truncate max-w-[200px]">✓ อัปโหลดแล้ว</p>
                      <button
                        type="button"
                        onClick={() => { setForm(p => ({ ...p, image: "" })); setImagePreview(""); }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลพื้นฐาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="name">ชื่อสินค้า *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value),
                      }));
                    }}
                    placeholder="เช่น จตุผลาธิกะแบบแคป 60 เม็ด"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="slug">
                    Slug{" "}
                    <span className="text-xs text-muted-foreground">(ใช้ระบุสินค้า ห้ามซ้ำ)</span>
                  </Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={set("slug")}
                    placeholder="เช่น jatuphalathika-cap-60"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="subtitle">ชื่อรอง / แบรนด์</Label>
                  <Input
                    id="subtitle"
                    value={form.subtitle}
                    onChange={set("subtitle")}
                    placeholder="เช่น WIJITHERB — Bone & Joint Herbal Formula"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={set("category")}
                    placeholder="เช่น สมุนไพรไทย"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    value={form.badge}
                    onChange={set("badge")}
                    placeholder="เช่น ขายดี, ของแท้ 100%"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shortDesc">คำอธิบายสั้น</Label>
                <Textarea
                  id="shortDesc"
                  value={form.shortDesc}
                  onChange={set("shortDesc")}
                  placeholder="คำอธิบายสินค้าสั้นๆ 1-2 ประโยค"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="benefits">
                  จุดเด่น{" "}
                  <span className="text-xs text-muted-foreground">(1 บรรทัด = 1 ข้อ)</span>
                </Label>
                <Textarea
                  id="benefits"
                  value={form.benefits}
                  onChange={set("benefits")}
                  placeholder={"ดูแลกระดูก ไขข้อ เส้นเอ็น\nบรรเทาอาการนอนไม่หลับ\nของแท้ 100%"}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ราคาและรายละเอียด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">ราคา</Label>
                  <Input
                    id="price"
                    value={form.price}
                    onChange={set("price")}
                    placeholder="เช่น ฿259"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="promoPrice">ราคาโปรโมชั่น</Label>
                  <Input
                    id="promoPrice"
                    value={form.promoPrice}
                    onChange={set("promoPrice")}
                    placeholder="เช่น ฿499 หรือ ฿259 – ฿499"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="size">ขนาด / ปริมาณ</Label>
                  <Input
                    id="size"
                    value={form.size}
                    onChange={set("size")}
                    placeholder="เช่น 60 แคปซูล / กระปุก"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sold">ยอดขาย</Label>
                  <Input
                    id="sold"
                    value={form.sold}
                    onChange={set("sold")}
                    placeholder="เช่น 1,200+"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rating">
                    คะแนนรีวิว{" "}
                    <span className="text-xs text-muted-foreground">(0.0 – 5.0)</span>
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={set("rating")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sortOrder">ลำดับการแสดง</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    onChange={set("sortOrder")}
                    placeholder="0 = แสดงก่อน"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channel links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                ลิงก์ช่องทางสั่งซื้อ{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (ถ้าว่างจะใช้ลิงก์กลางของร้าน)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="shopeeUrl">Shopee URL</Label>
                <Input
                  id="shopeeUrl"
                  value={form.shopeeUrl}
                  onChange={set("shopeeUrl")}
                  placeholder="https://shopee.co.th/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktokUrl">TikTok URL</Label>
                <Input
                  id="tiktokUrl"
                  value={form.tiktokUrl}
                  onChange={set("tiktokUrl")}
                  placeholder="https://www.tiktok.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lineUrl">LINE URL</Label>
                <Input
                  id="lineUrl"
                  value={form.lineUrl}
                  onChange={set("lineUrl")}
                  placeholder="https://line.me/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">แสดงสินค้าบนเว็บไซต์</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ปิดเพื่อซ่อนสินค้าชั่วคราวโดยไม่ต้องลบ
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-8">
            <Button type="submit" disabled={isPending || isUploading} className="gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
            </Button>
            <Link href="/admin/products">
              <Button type="button" variant="outline">
                ยกเลิก
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
