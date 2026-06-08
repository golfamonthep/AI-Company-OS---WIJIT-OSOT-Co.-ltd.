import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  FileText,
  Table2,
  Bell,
  Mail,
  Play,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  CalendarDays,
  BarChart3,
  ArrowLeft,
  Settings,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: number | Date | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCron(cron: string): string {
  if (cron === "0 0 1 * * *") return "ทุกวัน 08:00 น. (ICT)";
  if (cron === "0 0 2 * * *") return "ทุกวัน 09:00 น. (ICT)";
  if (cron === "0 0 0 * * *") return "ทุกวัน 07:00 น. (ICT)";
  if (cron === "0 0 3 * * *") return "ทุกวัน 10:00 น. (ICT)";
  return cron;
}

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("th-TH");
}

// ─── Create Schedule Dialog ───────────────────────────────────────────────────

function CreateScheduleDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [adAccountName, setAdAccountName] = useState("");
  const [reportFormat, setReportFormat] = useState<"pdf" | "excel" | "both">("both");
  const [notifyLine, setNotifyLine] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [cronExpression, setCronExpression] = useState("0 0 1 * * *");

  const createMutation = trpc.report.createSchedule.useMutation({
    onSuccess: () => {
      toast.success("สร้าง Schedule สำเร็จ", { description: "รายงานจะถูกส่งตามเวลาที่ตั้งไว้" });
      onCreated();
      onClose();
      setName("");
      setAdAccountId("");
      setAdAccountName("");
    },
    onError: (err) => {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    },
  });

  const handleSubmit = () => {
    if (!name.trim() || !adAccountId.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    createMutation.mutate({ name, adAccountId, adAccountName, reportFormat, notifyLine, notifyEmail, cronExpression });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            สร้าง Report Schedule ใหม่
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>ชื่อ Schedule</Label>
            <Input
              placeholder="เช่น Daily Report - Main Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ad Account ID</Label>
              <Input
                placeholder="act_xxxxxxxxxx"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ชื่อ Ad Account (ไม่บังคับ)</Label>
              <Input
                placeholder="My Business Account"
                value={adAccountName}
                onChange={(e) => setAdAccountName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>รูปแบบรายงาน</Label>
            <Select value={reportFormat} onValueChange={(v) => setReportFormat(v as typeof reportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">PDF + Excel (ทั้งคู่)</SelectItem>
                <SelectItem value="pdf">PDF เท่านั้น</SelectItem>
                <SelectItem value="excel">Excel เท่านั้น</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>เวลาส่งรายงาน</Label>
            <Select value={cronExpression} onValueChange={setCronExpression}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0 0 0 * * *">07:00 น. (ICT)</SelectItem>
                <SelectItem value="0 0 1 * * *">08:00 น. (ICT) — แนะนำ</SelectItem>
                <SelectItem value="0 0 2 * * *">09:00 น. (ICT)</SelectItem>
                <SelectItem value="0 0 3 * * *">10:00 น. (ICT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-1">
            <Label className="text-sm font-medium">ช่องทางแจ้งเตือน</Label>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-green-600" />
                <span className="text-sm">LINE Notify</span>
              </div>
              <Switch checked={notifyLine} onCheckedChange={setNotifyLine} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Email (Manus Notification)</span>
              </div>
              <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            ⚠️ ระบบ Heartbeat cron จะทำงานหลัง Deploy เท่านั้น สามารถกด "ส่งทันที" เพื่อทดสอบได้
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "กำลังสร้าง..." : "สร้าง Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AutoReport() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [createOpen, setCreateOpen] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: schedules, isLoading: schedulesLoading } = trpc.report.listSchedules.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: logs, isLoading: logsLoading } = trpc.report.getLogs.useQuery(
    { limit: 30 },
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.report.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success("ลบ Schedule สำเร็จ");
      utils.report.listSchedules.invalidate();
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
      setDeletingId(null);
    },
  });

  const toggleMutation = trpc.report.updateSchedule.useMutation({
    onSuccess: () => {
      utils.report.listSchedules.invalidate();
    },
    onError: (err) => {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    },
  });

  const sendNowMutation = trpc.report.sendNow.useMutation({
    onSuccess: (data) => {
      toast.success("ส่งรายงานสำเร็จ!", { description: `LINE: ${data.lineNotified ? "✓" : "✗"} | Email: ${data.emailNotified ? "✓" : "✗"}` });
      utils.report.getLogs.invalidate();
      utils.report.listSchedules.invalidate();
      setSendingId(null);
    },
    onError: (err) => {
      toast.error(`ส่งรายงานไม่สำเร็จ: ${err.message}`);
      setSendingId(null);
    },
  });

  // ── Loading / Auth ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <FileText className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-xl font-bold">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-muted-foreground text-sm">เพื่อใช้งานระบบ Automated Report</p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>เข้าสู่ระบบ</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSchedules = schedules?.filter((s) => s.isActive === 1) ?? [];
  const totalSent = logs?.length ?? 0;
  const successLogs = logs?.filter((l) => l.status === "success") ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5" />
                กลับ
              </Button>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-sm">Automated Report</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/budget-monitor">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Settings className="w-3.5 h-3.5" />
                Notification Settings
              </Button>
            </Link>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              สร้าง Schedule
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Schedule ทั้งหมด", value: schedules?.length ?? 0, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "กำลังทำงาน", value: activeSchedules.length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "รายงานที่ส่งแล้ว", value: totalSent, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "ส่งสำเร็จ", value: successLogs.length, icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((item) => (
            <Card key={item.label} className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="schedules">
          <TabsList className="bg-white border">
            <TabsTrigger value="schedules" className="gap-1.5">
              <CalendarDays className="w-4 h-4" />
              Report Schedules ({schedules?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5">
              <Clock className="w-4 h-4" />
              ประวัติการส่ง ({logs?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          {/* ── Schedules Tab ── */}
          <TabsContent value="schedules" className="mt-4">
            {schedulesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !schedules?.length ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-16 text-center space-y-3">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">ยังไม่มี Report Schedule</p>
                  <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    สร้าง Schedule แรก
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <Card key={schedule.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{schedule.name}</h3>
                            <Badge variant={schedule.isActive === 1 ? "default" : "secondary"} className="text-xs">
                              {schedule.isActive === 1 ? "Active" : "Paused"}
                            </Badge>
                            {/* Format badges */}
                            {(schedule.reportFormat === "pdf" || schedule.reportFormat === "both") && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <FileText className="w-3 h-3" /> PDF
                              </Badge>
                            )}
                            {(schedule.reportFormat === "excel" || schedule.reportFormat === "both") && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Table2 className="w-3 h-3" /> Excel
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>Ad Account: <span className="font-mono">{schedule.adAccountId}</span></span>
                            <span>⏰ {formatCron(schedule.cronExpression)}</span>
                            {schedule.notifyLine === 1 && <span className="text-green-600">LINE ✓</span>}
                            {schedule.notifyEmail === 1 && <span className="text-blue-600">Email ✓</span>}
                            {schedule.lastRunAt && (
                              <span>ส่งล่าสุด: {formatDate(schedule.lastRunAt)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Toggle active */}
                          <Switch
                            checked={schedule.isActive === 1}
                            onCheckedChange={(checked) =>
                              toggleMutation.mutate({ id: schedule.id, isActive: checked })
                            }
                          />
                          {/* Send now */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={sendingId === schedule.id}
                            onClick={() => {
                              setSendingId(schedule.id);
                              sendNowMutation.mutate({ id: schedule.id });
                            }}
                          >
                            {sendingId === schedule.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            ส่งทันที
                          </Button>
                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingId === schedule.id}
                            onClick={() => {
                              setDeletingId(schedule.id);
                              deleteMutation.mutate({ id: schedule.id });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Logs Tab ── */}
          <TabsContent value="logs" className="mt-4">
            {logsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !logs?.length ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-16 text-center space-y-2">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">ยังไม่มีประวัติการส่งรายงาน</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <Card key={log.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {log.status === "success" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">
                                {log.adAccountId}
                              </span>
                              <Badge variant="outline" className="text-xs">{log.reportFormat.toUpperCase()}</Badge>
                              {log.lineNotified === 1 && (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">LINE ✓</Badge>
                              )}
                              {log.emailNotified === 1 && (
                                <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Email ✓</Badge>
                              )}
                            </div>
                            {log.status === "success" && (
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                {log.totalSpend != null && <span>Spend: ฿{log.totalSpend.toFixed(2)}</span>}
                                {log.totalImpressions != null && <span>Impressions: {formatNumber(log.totalImpressions)}</span>}
                                {log.totalLeads != null && <span>Leads: {log.totalLeads}</span>}
                                {log.totalPurchases != null && <span>Purchases: {log.totalPurchases}</span>}
                                {log.avgRoas != null && <span>ROAS: {log.avgRoas.toFixed(2)}x</span>}
                              </div>
                            )}
                            {log.status === "failed" && log.errorMessage && (
                              <p className="text-xs text-red-500 mt-1">{log.errorMessage}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Download links */}
                          {log.pdfStorageKey && (
                            <a href={`/manus-storage/${log.pdfStorageKey}`} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                                <Download className="w-3 h-3" />
                                PDF
                              </Button>
                            </a>
                          )}
                          {log.excelStorageKey && (
                            <a href={`/manus-storage/${log.excelStorageKey}`} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                                <Download className="w-3 h-3" />
                                Excel
                              </Button>
                            </a>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Dialog */}
      <CreateScheduleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => utils.report.listSchedules.invalidate()}
      />
    </div>
  );
}
