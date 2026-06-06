import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { Package, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.listAll.useQuery();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบสินค้าเรียบร้อยแล้ว");
      utils.products.listAll.invalidate();
      utils.products.listPublic.invalidate();
      setDeleteId(null);
    },
    onError: (e) => toast.error("เกิดข้อผิดพลาด: " + e.message),
  });

  const toggleActiveMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.listAll.invalidate();
      utils.products.listPublic.invalidate();
    },
    onError: (e) => toast.error("เกิดข้อผิดพลาด: " + e.message),
  });

  const handleToggleActive = (id: number, current: boolean) => {
    toggleActiveMutation.mutate({ id, data: { isActive: !current } });
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการสินค้า</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {products?.length ?? 0} รายการ
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มสินค้าใหม่
            </Button>
          </Link>
        </div>

        {/* Product list */}
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : products?.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">ยังไม่มีสินค้า</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              เริ่มต้นด้วยการเพิ่มสินค้าชิ้นแรก
            </p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มสินค้า
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3">
            {products?.map((product) => (
              <Card
                key={product.id}
                className={`flex items-center gap-4 p-4 transition-opacity ${
                  !product.isActive ? "opacity-60" : ""
                }`}
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    {product.badge && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {product.badge}
                      </Badge>
                    )}
                    {!product.isActive && (
                      <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                        ซ่อน
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {product.category} · {product.price}
                    {product.promoPrice ? ` – ${product.promoPrice}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ⭐ {((product.rating ?? 0) / 10).toFixed(1)} · ลำดับ {product.sortOrder}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    title={product.isActive ? "ซ่อนสินค้า" : "แสดงสินค้า"}
                    onClick={() => handleToggleActive(product.id, product.isActive)}
                    disabled={toggleActiveMutation.isPending}
                  >
                    {product.isActive ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="ghost" size="icon" className="w-8 h-8" title="แก้ไข">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:text-destructive hover:bg-destructive/10"
                    title="ลบ"
                    onClick={() => setDeleteId(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
            <AlertDialogDescription>
              การลบสินค้าไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "กำลังลบ..." : "ลบสินค้า"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
