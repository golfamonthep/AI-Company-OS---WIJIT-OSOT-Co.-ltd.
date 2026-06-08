import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  LayoutDashboard,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Percent,
  Zap,
  Link2,
  Link2Off,
  ChevronDown,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyInsight {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface Summary {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="p-5 border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}>
            {trend === "up" ? <TrendingUp className="w-4 h-4" /> : trend === "down" ? <TrendingDown className="w-4 h-4" /> : null}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </Card>
  );
}

// ─── Connect Panel ────────────────────────────────────────────────────────────

function ConnectPanel({ onConnected }: { onConnected: () => void }) {
  const [token, setToken] = useState("");
  const saveToken = trpc.meta.saveToken.useMutation({
    onSuccess: (data) => {
      toast.success(`เชื่อมต่อสำเร็จ! ยินดีต้อนรับ ${data.metaName}`);
      onConnected();
    },
    onError: (err) => toast.error(`เชื่อมต่อไม่สำเร็จ: ${err.message}`),
  });

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
        <Link2 className="w-10 h-10 text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">เชื่อมต่อ Meta Ads</h2>
      <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
        กรอก Meta User Access Token เพื่อดึงข้อมูลโฆษณาของคุณ
        คุณสามารถสร้าง Token ได้จาก{" "}
        <a
          href="https://developers.facebook.com/tools/explorer/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Meta Graph API Explorer
        </a>
      </p>

      <Card className="w-full p-6 border border-border text-left">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Meta User Access Token</Label>
            <Input
              type="password"
              placeholder="EAAxxxxxxxxxxxxxxxx..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              ต้องการ Permission: <code className="bg-muted px-1 rounded">ads_read</code>{" "}
              <code className="bg-muted px-1 rounded">read_insights</code>
            </p>
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => saveToken.mutate({ accessToken: token })}
            disabled={!token || saveToken.isPending}
          >
            {saveToken.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังเชื่อมต่อ...</>
            ) : (
              <><Link2 className="w-4 h-4 mr-2" /> เชื่อมต่อ Meta Ads</>
            )}
          </Button>
        </div>
      </Card>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left w-full">
        <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> วิธีรับ Access Token
        </p>
        <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
          <li>ไปที่ Meta Graph API Explorer</li>
          <li>เลือก App ของคุณ (หรือสร้างใหม่)</li>
          <li>คลิก "Generate Access Token"</li>
          <li>เลือก Permission: ads_read, read_insights</li>
          <li>คัดลอก Token มาวางด้านบน</li>
        </ol>
      </div>
    </div>
  );
}

// ─── Account Selector ─────────────────────────────────────────────────────────

function AccountSelector({ onSelected }: { onSelected: () => void }) {
  const { data: accounts, isLoading } = trpc.meta.getAdAccounts.useQuery();
  const selectAccount = trpc.meta.selectAdAccount.useMutation({
    onSuccess: () => {
      toast.success("เลือก Ad Account สำเร็จ");
      onSelected();
    },
    onError: (err) => toast.error(err.message),
  });
  const [selected, setSelected] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!accounts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">ไม่พบ Ad Account</h3>
        <p className="text-muted-foreground text-sm">Token ของคุณไม่มีสิทธิ์เข้าถึง Ad Account ใดๆ</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <LayoutDashboard className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">เลือก Ad Account</h2>
      <p className="text-muted-foreground mb-6 text-sm">เลือก Ad Account ที่ต้องการดูข้อมูล</p>

      <Card className="w-full p-6 border border-border text-left">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Ad Account</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="เลือก Ad Account..." />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            disabled={!selected || selectAccount.isPending}
            onClick={() => {
              const acc = accounts.find((a) => a.id === selected);
              if (acc) selectAccount.mutate({ adAccountId: acc.id, adAccountName: acc.name });
            }}
          >
            {selectAccount.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังบันทึก...</>
            ) : (
              "ยืนยันการเลือก"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [dateRange, setDateRange] = useState<"7d" | "30d">("7d");
  const [activeMetrics, setActiveMetrics] = useState<string[]>(["spend", "roas"]);
  const [step, setStep] = useState<"connect" | "select" | "dashboard">("connect");
  const [forceRefresh, setForceRefresh] = useState(false);

  const utils = trpc.useUtils();

  const { data: status, isLoading: statusLoading } = trpc.meta.getStatus.useQuery();

  // Derive step from status
  const derivedStep = status
    ? status.connected && status.selectedAdAccountId
      ? "dashboard"
      : status.connected
      ? "select"
      : "connect"
    : step;

  // Sync step when status loads
  useEffect(() => {
    if (!statusLoading && status) {
      setStep(derivedStep as "connect" | "select" | "dashboard");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusLoading, status?.connected, (status as { selectedAdAccountId?: string | null })?.selectedAdAccountId]);

  const { data: insights, isLoading: insightsLoading, error: insightsError } = trpc.meta.getInsights.useQuery(
    { dateRange, forceRefresh },
    { enabled: step === "dashboard" }
  );

  const removeToken = trpc.meta.removeToken.useMutation({
    onSuccess: () => {
      toast.success("ยกเลิกการเชื่อมต่อสำเร็จ");
      setStep("connect");
      utils.meta.getStatus.invalidate();
    },
  });

  const handleRefresh = useCallback(() => {
    setForceRefresh(true);
    // Reset after query fires
    setTimeout(() => setForceRefresh(false), 2000);
    toast.info("กำลังโหลดข้อมูลใหม่จาก Meta API...");
  }, []);

  const metricOptions = [
    { key: "spend", label: "Spend (฿)", color: "#3b82f6" },
    { key: "impressions", label: "Impressions", color: "#8b5cf6" },
    { key: "clicks", label: "Clicks", color: "#06b6d4" },
    { key: "ctr", label: "CTR (%)", color: "#10b981" },
    { key: "cpc", label: "CPC (฿)", color: "#f59e0b" },
    { key: "cpa", label: "CPA (฿)", color: "#ef4444" },
    { key: "roas", label: "ROAS", color: "#f97316" },
    { key: "conversions", label: "Conversions", color: "#84cc16" },
  ];

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const summary: Summary | null = insights?.summary ?? null;

  const formatNumber = (n: number, decimals = 2) =>
    n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 1000
      ? `${(n / 1000).toFixed(1)}K`
      : n.toFixed(decimals);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">กรุณาเข้าสู่ระบบก่อน</h2>
          <a href={getLoginUrl()}>
            <Button>เข้าสู่ระบบ</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">กลับหน้าหลัก</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-foreground">Ads Dashboard</span>
                  <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                    Meta Ads Real-time
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {step === "dashboard" && (
                <>
                  {/* Date Range */}
                  <div className="flex rounded-lg border border-border overflow-hidden text-sm">
                    {(["7d", "30d"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setDateRange(r)}
                        className={`px-3 py-1.5 font-medium transition-colors ${
                          dateRange === r
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {r === "7d" ? "7 วัน" : "30 วัน"}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 bg-background">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">รีเฟรช</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeToken.mutate()}
                    className="gap-1.5 bg-background text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Link2Off className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ยกเลิก</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {statusLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          </div>
        ) : step === "connect" ? (
          <ConnectPanel onConnected={() => { utils.meta.getStatus.invalidate(); setStep("select"); }} />
        ) : step === "select" ? (
          <AccountSelector onSelected={() => { utils.meta.getStatus.invalidate(); setStep("dashboard"); }} />
        ) : (
          <>
            {/* Connection badge */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">ภาพรวมโฆษณา Facebook</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {status?.selectedAdAccountName && (
                    <span className="font-medium">{status.selectedAdAccountName}</span>
                  )}{" "}
                  · {dateRange === "7d" ? "7 วันที่ผ่านมา" : "30 วันที่ผ่านมา"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {insights?.fromCache && (
                  <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Cache
                  </Badge>
                )}
                <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  เชื่อมต่อแล้ว
                </Badge>
              </div>
            </div>

            {insightsLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">กำลังดึงข้อมูลจาก Meta API...</p>
                </div>
              </div>
            ) : insightsError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">ดึงข้อมูลไม่สำเร็จ</h3>
                <p className="text-muted-foreground text-sm mb-4">{insightsError.message}</p>
                <Button onClick={handleRefresh} variant="outline" className="bg-background">
                  <RefreshCw className="w-4 h-4 mr-2" /> ลองใหม่
                </Button>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <KpiCard
                    title="Spend"
                    value={summary ? `฿${formatNumber(summary.spend)}` : "—"}
                    icon={DollarSign}
                    color="bg-blue-500"
                  />
                  <KpiCard
                    title="Impressions"
                    value={summary ? formatNumber(summary.impressions, 0) : "—"}
                    icon={Eye}
                    color="bg-purple-500"
                  />
                  <KpiCard
                    title="Clicks"
                    value={summary ? formatNumber(summary.clicks, 0) : "—"}
                    icon={MousePointerClick}
                    color="bg-cyan-500"
                  />
                  <KpiCard
                    title="CTR"
                    value={summary ? `${summary.ctr}%` : "—"}
                    icon={Percent}
                    color="bg-emerald-500"
                    trend={summary && summary.ctr >= 1.5 ? "up" : "down"}
                  />
                  <KpiCard
                    title="CPC"
                    value={summary ? `฿${summary.cpc}` : "—"}
                    icon={MousePointerClick}
                    color="bg-amber-500"
                    trend={summary && summary.cpc <= 30 ? "up" : "down"}
                  />
                  <KpiCard
                    title="CPA"
                    value={summary ? `฿${summary.cpa}` : "—"}
                    icon={ShoppingCart}
                    color="bg-red-500"
                  />
                  <KpiCard
                    title="ROAS"
                    value={summary ? `${summary.roas}x` : "—"}
                    icon={Zap}
                    color="bg-orange-500"
                    trend={summary && summary.roas >= 2 ? "up" : "down"}
                  />
                  <KpiCard
                    title="Conversions"
                    value={summary ? formatNumber(summary.conversions, 0) : "—"}
                    icon={ShoppingCart}
                    color="bg-lime-500"
                  />
                </div>

                {/* Chart */}
                <Card className="p-6 border border-border mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      กราฟแนวโน้ม{dateRange === "7d" ? " 7 วัน" : " 30 วัน"}
                    </h2>
                    {/* Metric toggles */}
                    <div className="flex flex-wrap gap-2">
                      {metricOptions.map((m) => (
                        <button
                          key={m.key}
                          onClick={() => toggleMetric(m.key)}
                          className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                            activeMetrics.includes(m.key)
                              ? "text-white border-transparent"
                              : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                          }`}
                          style={activeMetrics.includes(m.key) ? { backgroundColor: m.color, borderColor: m.color } : {}}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {insights?.daily && insights.daily.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={insights.daily} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(v: string) => v.slice(5)} // MM-DD
                        />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={50} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        {metricOptions
                          .filter((m) => activeMetrics.includes(m.key))
                          .map((m) => (
                            <Line
                              key={m.key}
                              type="monotone"
                              dataKey={m.key}
                              name={m.label}
                              stroke={m.color}
                              strokeWidth={2}
                              dot={{ r: 3, fill: m.color }}
                              activeDot={{ r: 5 }}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <AlertCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground text-sm">ไม่มีข้อมูลในช่วงเวลานี้</p>
                      <p className="text-xs text-muted-foreground mt-1">ตรวจสอบว่า Ad Account มีการใช้งานในช่วง {dateRange === "7d" ? "7" : "30"} วันที่ผ่านมา</p>
                    </div>
                  )}
                </Card>

                {/* Daily Table */}
                {insights?.daily && insights.daily.length > 0 && (
                  <Card className="border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h2 className="text-base font-semibold text-foreground">ข้อมูลรายวัน</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border">
                            {["วันที่", "Spend (฿)", "Impressions", "Clicks", "CTR", "CPC (฿)", "CPA (฿)", "ROAS", "Conversions"].map((h) => (
                              <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...insights.daily].reverse().map((row, i) => (
                            <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{row.date}</td>
                              <td className="px-4 py-3 text-foreground">฿{row.spend.toLocaleString()}</td>
                              <td className="px-4 py-3 text-foreground">{row.impressions.toLocaleString()}</td>
                              <td className="px-4 py-3 text-foreground">{row.clicks.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`font-medium ${row.ctr >= 1.5 ? "text-green-600" : row.ctr >= 1 ? "text-amber-600" : "text-red-600"}`}>
                                  {row.ctr}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-foreground">฿{row.cpc}</td>
                              <td className="px-4 py-3 text-foreground">฿{row.cpa}</td>
                              <td className="px-4 py-3">
                                <span className={`font-bold ${row.roas >= 2 ? "text-green-600" : row.roas >= 1 ? "text-amber-600" : "text-red-600"}`}>
                                  {row.roas}x
                                </span>
                              </td>
                              <td className="px-4 py-3 text-foreground">{row.conversions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
