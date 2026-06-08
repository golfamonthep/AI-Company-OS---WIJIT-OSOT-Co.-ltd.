import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Settings,
  LineChart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  Mail,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ShoppingCart,
  MousePointer,
  Activity,
} from "lucide-react";
import { getLoginUrl } from "@/const";

// ─── Types ────────────────────────────────────────────────────────────────────

type MetricType = "budget_spent" | "cpm" | "cost_per_purchase" | "cpc" | "cpa" | "roas_below";
type Condition = "above" | "below";

const METRIC_OPTIONS: { value: MetricType; label: string; icon: React.ElementType; unit: string; description: string }[] = [
  { value: "budget_spent", label: "งบที่ใช้ (Spend)", icon: DollarSign, unit: "฿", description: "แจ้งเตือนเมื่อใช้งบเกินที่กำหนด" },
  { value: "cpm", label: "CPM (Cost/1,000 Impressions)", icon: BarChart3, unit: "฿", description: "ต้นทุนต่อการแสดงผล 1,000 ครั้ง" },
  { value: "cost_per_purchase", label: "Cost per Purchase", icon: ShoppingCart, unit: "฿", description: "ต้นทุนต่อการซื้อสินค้า 1 ครั้ง" },
  { value: "cpc", label: "CPC (Cost per Click)", icon: MousePointer, unit: "฿", description: "ต้นทุนต่อการคลิก 1 ครั้ง" },
  { value: "cpa", label: "CPA (Cost per Action)", icon: Activity, unit: "฿", description: "ต้นทุนต่อ Conversion 1 ครั้ง" },
  { value: "roas_below", label: "ROAS ต่ำกว่าเกณฑ์", icon: TrendingDown, unit: "x", description: "แจ้งเตือนเมื่อ ROAS ต่ำกว่าที่กำหนด" },
];

const CONDITION_FOR_METRIC: Record<MetricType, Condition> = {
  budget_spent: "above",
  cpm: "above",
  cost_per_purchase: "above",
  cpc: "above",
  cpa: "above",
  roas_below: "below",
};

function metricLabel(metricType: string) {
  return METRIC_OPTIONS.find(m => m.value === metricType)?.label ?? metricType;
}

function metricIcon(metricType: string) {
  return METRIC_OPTIONS.find(m => m.value === metricType)?.icon ?? Activity;
}

// ─── Create Alert Dialog ──────────────────────────────────────────────────────

function CreateAlertDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [metricType, setMetricType] = useState<MetricType>("budget_spent");
  const [thresholdValue, setThresholdValue] = useState("");
  const [notifyLine, setNotifyLine] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);

  // Auto-fill adAccountId from Meta status
  const { data: metaStatus } = trpc.meta.getStatus.useQuery();

  useEffect(() => {
    if (metaStatus?.selectedAdAccountId) {
      setAdAccountId(metaStatus.selectedAdAccountId);
    }
  }, [metaStatus?.selectedAdAccountId]);

  const createMutation = trpc.budgetAlert.create.useMutation({
    onSuccess: () => {
      toast.success("สร้าง Alert Rule สำเร็จ");
      setOpen(false);
      onCreated();
      // Reset form
      setCampaignId("");
      setCampaignName("");
      setThresholdValue("");
    },
    onError: (err) => {
      toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
    },
  });

  const selectedMetric = METRIC_OPTIONS.find(m => m.value === metricType);

  const handleSubmit = () => {
    if (!campaignId.trim() || !campaignName.trim() || !adAccountId.trim() || !thresholdValue) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const threshold = parseFloat(thresholdValue);
    if (isNaN(threshold) || threshold <= 0) {
      toast.error("กรุณากรอกค่า Threshold ที่ถูกต้อง");
      return;
    }
    createMutation.mutate({
      campaignId: campaignId.trim(),
      campaignName: campaignName.trim(),
      adAccountId: adAccountId.trim(),
      metricType,
      condition: CONDITION_FOR_METRIC[metricType],
      thresholdValue: threshold,
      notifyLine,
      notifyEmail,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          สร้าง Alert Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            สร้าง Alert Rule ใหม่
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Campaign Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Campaign ID</Label>
              <Input
                placeholder="เช่น 120200123456789"
                value={campaignId}
                onChange={e => setCampaignId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ชื่อ Campaign</Label>
              <Input
                placeholder="เช่น Summer Sale 2026"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Ad Account ID</Label>
            <Input
              placeholder="เช่น act_123456789"
              value={adAccountId}
              onChange={e => setAdAccountId(e.target.value)}
            />
            {metaStatus?.selectedAdAccountId && (
              <p className="text-xs text-muted-foreground">
                ใช้ Account ที่เชื่อมต่อ: <span className="font-mono">{metaStatus.selectedAdAccountId}</span>
              </p>
            )}
          </div>

          {/* Metric Type */}
          <div className="space-y-1.5">
            <Label>เมตริกที่ต้องการติดตาม</Label>
            <Select value={metricType} onValueChange={v => setMetricType(v as MetricType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className="w-4 h-4 text-muted-foreground" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMetric && (
              <p className="text-xs text-muted-foreground">{selectedMetric.description}</p>
            )}
          </div>

          {/* Threshold */}
          <div className="space-y-1.5">
            <Label>
              ค่า Threshold ({selectedMetric?.unit ?? "฿"})
              {" — "}
              <span className="text-muted-foreground text-xs">
                {CONDITION_FOR_METRIC[metricType] === "above" ? "แจ้งเตือนเมื่อสูงกว่า" : "แจ้งเตือนเมื่อต่ำกว่า"}
              </span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={metricType === "roas_below" ? "เช่น 2 (ROAS ต่ำกว่า 2x)" : "เช่น 1000"}
              value={thresholdValue}
              onChange={e => setThresholdValue(e.target.value)}
            />
          </div>

          {/* Notification channels */}
          <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/30">
            <p className="text-sm font-medium">ช่องทางแจ้งเตือน</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm">LINE Notify</span>
              </div>
              <Switch checked={notifyLine} onCheckedChange={setNotifyLine} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Email / Manus Notification</span>
              </div>
              <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "กำลังสร้าง..." : "สร้าง Alert Rule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Notification Settings Dialog ────────────────────────────────────────────

function NotificationSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [lineToken, setLineToken] = useState("");
  const [email, setEmail] = useState("");

  const { data: settings } = trpc.budgetAlert.getNotificationSettings.useQuery();
  const saveMutation = trpc.budgetAlert.saveNotificationSettings.useMutation({
    onSuccess: () => {
      toast.success("บันทึกการตั้งค่าสำเร็จ");
      setOpen(false);
    },
    onError: (err) => toast.error(`เกิดข้อผิดพลาด: ${err.message}`),
  });

  useEffect(() => {
    if (settings) {
      setLineToken(settings.lineToken ?? "");
      setEmail(settings.notifyEmail ?? "");
    }
  }, [settings]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          ตั้งค่าการแจ้งเตือน
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            ตั้งค่าช่องทางแจ้งเตือน
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* LINE Notify */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <Label className="text-sm font-medium">LINE Notify Token</Label>
            </div>
            <Input
              type="password"
              placeholder="วาง LINE Notify Token ที่นี่"
              value={lineToken}
              onChange={e => setLineToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              รับ Token ได้ที่{" "}
              <a
                href="https://notify-bot.line.me/my/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                notify-bot.line.me/my
              </a>
              {" "}→ Generate token
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <Label className="text-sm font-medium">Email สำหรับรับการแจ้งเตือน</Label>
            </div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ระบบจะส่งการแจ้งเตือนผ่าน Manus Notification ไปยัง Email นี้
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => saveMutation.mutate({ lineToken: lineToken || null, notifyEmail: email || null })}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Alert Rule Card ──────────────────────────────────────────────────────────

function AlertRuleCard({ alert, onDeleted, onToggled }: {
  alert: {
    id: number;
    campaignName: string;
    metricType: string;
    condition: string;
    thresholdValue: number;
    notifyLine: number;
    notifyEmail: number;
    isActive: number;
    lastTriggeredAt: number | null;
    createdAt: Date;
  };
  onDeleted: () => void;
  onToggled: () => void;
}) {
  const utils = trpc.useUtils();

  const deleteMutation = trpc.budgetAlert.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบ Alert Rule สำเร็จ");
      onDeleted();
    },
    onError: (err) => toast.error(`เกิดข้อผิดพลาด: ${err.message}`),
  });

  const updateMutation = trpc.budgetAlert.update.useMutation({
    onSuccess: () => {
      utils.budgetAlert.list.invalidate();
      onToggled();
    },
    onError: (err) => toast.error(`เกิดข้อผิดพลาด: ${err.message}`),
  });

  const Icon = metricIcon(alert.metricType);
  const isActive = alert.isActive === 1;
  const conditionText = alert.condition === "above" ? "สูงกว่า" : "ต่ำกว่า";

  return (
    <Card className={`p-4 transition-all duration-200 ${isActive ? "border-border" : "border-border/40 opacity-60"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary/10" : "bg-muted"}`}>
            <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{alert.campaignName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {metricLabel(alert.metricType)} {conditionText}{" "}
              <span className="font-semibold text-foreground">{alert.thresholdValue.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              {alert.notifyLine === 1 && (
                <Badge variant="secondary" className="text-xs gap-1 py-0">
                  <MessageSquare className="w-3 h-3 text-green-600" />
                  LINE
                </Badge>
              )}
              {alert.notifyEmail === 1 && (
                <Badge variant="secondary" className="text-xs gap-1 py-0">
                  <Mail className="w-3 h-3 text-blue-600" />
                  Email
                </Badge>
              )}
              {alert.lastTriggeredAt && (
                <span className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  แจ้งเตือนล่าสุด: {new Date(alert.lastTriggeredAt).toLocaleString("th-TH")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => updateMutation.mutate({ id: alert.id, isActive: checked })}
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm(`ลบ Alert Rule สำหรับ "${alert.campaignName}" ใช่หรือไม่?`)) {
                deleteMutation.mutate({ id: alert.id });
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Alert Log Row ────────────────────────────────────────────────────────────

function AlertLogRow({ log }: {
  log: {
    id: number;
    campaignName: string;
    metricType: string;
    currentValue: number;
    thresholdValue: number;
    lineNotified: number;
    emailNotified: number;
    createdAt: Date;
  };
}) {
  const Icon = metricIcon(log.metricType);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{log.campaignName}</p>
          <Badge variant="outline" className="text-xs">
            <Icon className="w-3 h-3 mr-1" />
            {metricLabel(log.metricType)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          ค่าปัจจุบัน: <span className="font-semibold text-orange-600">{log.currentValue.toFixed(2)}</span>
          {" / "}เกณฑ์: {log.thresholdValue.toFixed(2)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(log.createdAt).toLocaleString("th-TH")}
          </span>
          {log.lineNotified === 1 && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              LINE
            </span>
          )}
          {log.emailNotified === 1 && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Email
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BudgetMonitor() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: alerts, isLoading: alertsLoading } = trpc.budgetAlert.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: logs, isLoading: logsLoading } = trpc.budgetAlert.getLogs.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );
  const { data: notifSettings } = trpc.budgetAlert.getNotificationSettings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const activeAlerts = alerts?.filter(a => a.isActive === 1) ?? [];
  const triggeredAlerts = alerts?.filter(a => a.lastTriggeredAt !== null) ?? [];

  const handleRefresh = () => {
    utils.budgetAlert.list.invalidate();
    utils.budgetAlert.getLogs.invalidate();
    toast.info("รีเฟรชข้อมูลแล้ว");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-sm w-full text-center space-y-4">
          <Bell className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-xl font-bold">เข้าสู่ระบบเพื่อใช้งาน</h2>
          <p className="text-muted-foreground text-sm">กรุณาเข้าสู่ระบบเพื่อตั้งค่า Budget Alert</p>
          <Button className="w-full" onClick={() => window.location.href = getLoginUrl()}>
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  // Check if notification settings are configured
  const hasLineToken = !!notifSettings?.lineToken;
  const hasEmail = !!notifSettings?.notifyEmail;
  const hasNotifConfig = hasLineToken || hasEmail;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h1 className="font-bold text-base leading-none">Budget Monitor</h1>
                  <p className="text-xs text-muted-foreground leading-none mt-0.5">ติดตามงบโฆษณา & แจ้งเตือนอัตโนมัติ</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <NotificationSettingsDialog />
              <CreateAlertDialog onCreated={() => utils.budgetAlert.list.invalidate()} />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* Notification config warning */}
        {!hasNotifConfig && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">ยังไม่ได้ตั้งค่าช่องทางแจ้งเตือน</p>
              <p className="text-xs text-orange-700 mt-0.5">
                กรุณาคลิก "ตั้งค่าการแจ้งเตือน" เพื่อเพิ่ม LINE Notify Token หรือ Email ก่อนสร้าง Alert Rule
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Alert Rules ทั้งหมด</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                <p className="text-xs text-muted-foreground">กำลังทำงาน</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{triggeredAlerts.length}</p>
                <p className="text-xs text-muted-foreground">เคยแจ้งเตือน</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">ประวัติแจ้งเตือน</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs: Rules / Logs */}
        <Tabs defaultValue="rules">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="rules" className="gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Alert Rules
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ประวัติ
            </TabsTrigger>
          </TabsList>

          {/* Alert Rules Tab */}
          <TabsContent value="rules" className="mt-4">
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : !alerts || alerts.length === 0 ? (
              <Card className="p-10 text-center">
                <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-semibold text-lg mb-2">ยังไม่มี Alert Rule</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  สร้าง Alert Rule เพื่อรับการแจ้งเตือนเมื่องบโฆษณาหรือ KPI เกินเกณฑ์
                </p>
                <CreateAlertDialog onCreated={() => utils.budgetAlert.list.invalidate()} />
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <AlertRuleCard
                    key={alert.id}
                    alert={alert}
                    onDeleted={() => utils.budgetAlert.list.invalidate()}
                    onToggled={() => utils.budgetAlert.list.invalidate()}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-4">
            <Card className="p-4">
              {logsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : !logs || logs.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3 opacity-60" />
                  <p className="text-muted-foreground text-sm">ยังไม่มีประวัติการแจ้งเตือน</p>
                  <p className="text-xs text-muted-foreground mt-1">ระบบจะแสดงประวัติเมื่อมีการแจ้งเตือนเกิดขึ้น</p>
                </div>
              ) : (
                <div>
                  {logs.map(log => (
                    <AlertLogRow key={log.id} log={log} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* How it works */}
        <Card className="p-5 bg-muted/30">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            วิธีการทำงาน
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium">ตั้งค่า Alert Rule</p>
                <p className="text-xs text-muted-foreground mt-0.5">กำหนด Campaign, เมตริก และค่า Threshold ที่ต้องการติดตาม</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium">ระบบตรวจสอบอัตโนมัติ</p>
                <p className="text-xs text-muted-foreground mt-0.5">ดึงข้อมูลจาก Meta API ทุก 1 ชั่วโมง เปรียบเทียบกับ Threshold</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium">แจ้งเตือนทันที</p>
                <p className="text-xs text-muted-foreground mt-0.5">ส่งการแจ้งเตือนผ่าน LINE Notify และ/หรือ Email ทันทีที่เกินเกณฑ์</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-orange-600">หมายเหตุ:</span>{" "}
              ระบบ Heartbeat จะทำงานได้หลังจาก Deploy เว็บไซต์แล้วเท่านั้น
              กรุณากด <span className="font-medium">Publish</span> ใน Management UI เพื่อเปิดใช้งาน
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
