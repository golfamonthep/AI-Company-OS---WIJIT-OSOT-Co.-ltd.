import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Package, Eye, EyeOff, Plus, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: products } = trpc.products.listAll.useQuery();

  const total = products?.length ?? 0;
  const active = products?.filter((p) => p.isActive).length ?? 0;
  const hidden = total - active;

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">ภาพรวม</h1>
          <p className="text-sm text-muted-foreground mt-1">ยินดีต้อนรับสู่ Admin Panel วิจิตรโอสถ</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                สินค้าทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                แสดงอยู่
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                ซ่อนอยู่
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">{hidden}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">เพิ่มสินค้าใหม่</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    เพิ่มสินค้าพร้อมรูปภาพและรายละเอียด
                  </p>
                  <Link href="/admin/products/new" className="mt-3 inline-block">
                    <Button size="sm" className="mt-2">เพิ่มสินค้า</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">จัดการสินค้า</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    แก้ไข ซ่อน หรือลบสินค้าที่มีอยู่
                  </p>
                  <Link href="/admin/products" className="mt-3 inline-block">
                    <Button size="sm" variant="outline" className="mt-2">ดูรายการสินค้า</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View website link */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">ดูหน้าเว็บไซต์</p>
            <p className="text-xs text-muted-foreground">ตรวจสอบการแสดงผลสินค้าบนหน้าหลัก</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-3 h-3" />
              เปิดหน้าหลัก
            </Button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
