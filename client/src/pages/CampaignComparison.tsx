import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  BarChart3,
  Trophy,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Plus,
  X,
  GitCompare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ---- Types ----
interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  conversionRate: number;
  cpm: number;
}

interface MetricConfig {
  key: keyof CampaignMetrics;
  label: string;
  format: (v: number) => string;
  /** lower = better (cost metrics) | higher = better (performance metrics) */
  winnerIs: "lower" | "higher";
  unit?: string;
}

// ---- Metric definitions ----
const METRICS: MetricConfig[] = [
  {
    key: "spend",
    label: "Spend (งบที่ใช้)",
    format: (v) => `฿${v.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
    winnerIs: "lower",
  },
  {
    key: "impressions",
    label: "Impressions",
    format: (v) => v.toLocaleString("th-TH"),
    winnerIs: "higher",
  },
  {
    key: "clicks",
    label: "Clicks",
    format: (v) => v.toLocaleString("th-TH"),
    winnerIs: "higher",
  },
  {
    key: "ctr",
    label: "CTR (Click-Through Rate)",
    format: (v) => `${v.toFixed(2)}%`,
    winnerIs: "higher",
  },
  {
    key: "cpc",
    label: "CPC (Cost per Click)",
    format: (v) => `฿${v.toFixed(2)}`,
    winnerIs: "lower",
  },
  {
    key: "cpm",
    label: "CPM (Cost per 1,000 Impressions)",
    format: (v) => `฿${v.toFixed(2)}`,
    winnerIs: "lower",
  },
  {
    key: "conversions",
    label: "Conversions (ผลลัพธ์)",
    format: (v) => v.toFixed(0),
    winnerIs: "higher",
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    format: (v) => `${v.toFixed(2)}%`,
    winnerIs: "higher",
  },
  {
    key: "cpa",
    label: "Cost per Result (CPA)",
    format: (v) => (v > 0 ? `฿${v.toFixed(2)}` : "-"),
    winnerIs: "lower",
  },
  {
    key: "revenue",
    label: "Revenue (รายได้)",
    format: (v) => `฿${v.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
    winnerIs: "higher",
  },
  {
    key: "roas",
    label: "ROAS (Return on Ad Spend)",
    format: (v) => (v > 0 ? `${v.toFixed(2)}x` : "-"),
    winnerIs: "higher",
  },
];

// Campaign colors for visual distinction
const CAMPAIGN_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b"];
const CAMPAIGN_BG = ["bg-blue-50 border-blue-200", "bg-purple-50 border-purple-200", "bg-amber-50 border-amber-200"];
const CAMPAIGN_TEXT = ["text-blue-700", "text-purple-700", "text-amber-700"];

// ---- Winner detection ----
function getWinnerIndex(values: number[], winnerIs: "lower" | "higher"): number {
  if (values.every((v) => v === 0)) return -1;
  const nonZero = values.map((v, i) => ({ v, i })).filter(({ v }) => v > 0);
  if (nonZero.length === 0) return -1;
  if (winnerIs === "higher") {
    return nonZero.reduce((best, cur) => (cur.v > best.v ? cur : best)).i;
  } else {
    return nonZero.reduce((best, cur) => (cur.v < best.v ? cur : best)).i;
  }
}

function getLoserIndex(values: number[], winnerIs: "lower" | "higher"): number {
  const nonZero = values.map((v, i) => ({ v, i })).filter(({ v }) => v > 0);
  if (nonZero.length < 2) return -1;
  if (winnerIs === "higher") {
    return nonZero.reduce((worst, cur) => (cur.v < worst.v ? cur : worst)).i;
  } else {
    return nonZero.reduce((worst, cur) => (cur.v > worst.v ? cur : worst)).i;
  }
}

// Count wins per campaign
function countWins(campaigns: CampaignMetrics[]): number[] {
  const wins = new Array(campaigns.length).fill(0);
  for (const metric of METRICS) {
    const values = campaigns.map((c) => (c[metric.key] as number) ?? 0);
    const winIdx = getWinnerIndex(values, metric.winnerIs);
    if (winIdx >= 0) wins[winIdx]++;
  }
  return wins;
}

// ---- Main Component ----
export default function CampaignComparison() {
  const { isAuthenticated } = useAuth();

  const [adAccountId, setAdAccountId] = useState("");
  const [dateRange, setDateRange] = useState<"7d" | "14d" | "30d">("7d");
  const [selectedCampaigns, setSelectedCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [compareEnabled, setCompareEnabled] = useState(false);

  // Fetch saved Meta connection
  const { data: metaStatus } = trpc.meta.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Auto-populate ad account
  const [accountInitialized, setAccountInitialized] = useState(false);
  if (metaStatus?.selectedAdAccountId && !accountInitialized) {
    setAdAccountId(metaStatus.selectedAdAccountId);
    setAccountInitialized(true);
  }

  // Fetch ad accounts for selector
  const { data: adAccounts } = trpc.meta.getAdAccounts.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch campaign list
  const {
    data: campaignList,
    isLoading: campaignsLoading,
  } = trpc.comparison.listCampaigns.useQuery(
    { adAccountId, dateRange },
    { enabled: isAuthenticated && adAccountId.length > 0 }
  );

  // Compare query
  const {
    data: compareData,
    isLoading: compareLoading,
    error: compareError,
    refetch: refetchCompare,
  } = trpc.comparison.compareMultiple.useQuery(
    { campaigns: selectedCampaigns, dateRange },
    {
      enabled: isAuthenticated && compareEnabled && selectedCampaigns.length >= 2,
    }
  );

  const campaigns: CampaignMetrics[] = (compareData?.campaigns ?? []) as CampaignMetrics[];
  const wins = useMemo(() => (campaigns.length >= 2 ? countWins(campaigns) : []), [campaigns]);
  const overallWinner = wins.length > 0 ? wins.indexOf(Math.max(...wins)) : -1;

  // Chart data for key metrics
  const chartData = useMemo(() => {
    if (campaigns.length < 2) return [];
    return [
      {
        metric: "ROAS",
        ...Object.fromEntries(campaigns.map((c) => [c.campaignName.slice(0, 20), c.roas])),
      },
      {
        metric: "CTR (%)",
        ...Object.fromEntries(campaigns.map((c) => [c.campaignName.slice(0, 20), c.ctr])),
      },
      {
        metric: "CPA (฿)",
        ...Object.fromEntries(campaigns.map((c) => [c.campaignName.slice(0, 20), c.cpa])),
      },
      {
        metric: "Conv Rate (%)",
        ...Object.fromEntries(campaigns.map((c) => [c.campaignName.slice(0, 20), c.conversionRate])),
      },
    ];
  }, [campaigns]);

  // Spend chart data (separate scale since spend is in currency)
  const spendChartData = useMemo(() => {
    if (campaigns.length < 2) return [];
    return campaigns.map((c) => ({
      name: c.campaignName.slice(0, 20),
      spend: c.spend,
      revenue: c.revenue,
    }));
  }, [campaigns]);

  function addCampaign(id: string) {
    if (selectedCampaigns.length >= 3) return;
    const found = (campaignList ?? []).find((c) => c.id === id);
    if (!found) return;
    if (selectedCampaigns.find((c) => c.id === id)) return;
    setSelectedCampaigns((prev) => [...prev, { id: found.id, name: found.name }]);
    setCompareEnabled(false);
  }

  function removeCampaign(id: string) {
    setSelectedCampaigns((prev) => prev.filter((c) => c.id !== id));
    setCompareEnabled(false);
  }

  function handleCompare() {
    setCompareEnabled(true);
    refetchCompare();
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <GitCompare className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">กรุณาเข้าสู่ระบบ</h2>
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
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  กลับ
                </Button>
              </Link>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Campaign Comparison</span>
              </div>
            </div>
            {campaigns.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompare}
                disabled={compareLoading}
                className="gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${compareLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Setup Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">เลือกแคมเปญที่ต้องการเปรียบเทียบ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row 1: Ad Account + Date Range */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Ad Account</label>
                {adAccounts && adAccounts.length > 0 ? (
                  <Select
                    value={adAccountId}
                    onValueChange={(v) => {
                      setAdAccountId(v);
                      setSelectedCampaigns([]);
                      setCompareEnabled(false);
                    }}
                  >
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue placeholder="เลือก Ad Account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {adAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    ยังไม่ได้เชื่อมต่อ Meta Account —{" "}
                    <Link href="/dashboard" className="text-primary underline">
                      เชื่อมต่อที่ Dashboard
                    </Link>
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">ช่วงเวลา</label>
                <Select
                  value={dateRange}
                  onValueChange={(v) => {
                    setDateRange(v as "7d" | "14d" | "30d");
                    setCompareEnabled(false);
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 วัน</SelectItem>
                    <SelectItem value="14d">14 วัน</SelectItem>
                    <SelectItem value="30d">30 วัน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Campaign selector */}
            {adAccountId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  เลือกแคมเปญ (2-3 แคมเปญ)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Selected campaign chips */}
                  {selectedCampaigns.map((c, idx) => (
                    <div
                      key={c.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${CAMPAIGN_BG[idx]} ${CAMPAIGN_TEXT[idx]}`}
                    >
                      <span className="max-w-[180px] truncate">{c.name}</span>
                      <button
                        onClick={() => removeCampaign(c.id)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add campaign dropdown */}
                  {selectedCampaigns.length < 3 && (
                    <Select onValueChange={addCampaign} value="">
                      <SelectTrigger className="w-auto gap-1.5 h-8 text-sm border-dashed">
                        {campaignsLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>เพิ่มแคมเปญ</span>
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {(campaignList ?? [])
                          .filter((c) => !selectedCampaigns.find((s) => s.id === c.id))
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[260px]">{c.name}</span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs shrink-0 ${
                                    c.status === "ACTIVE"
                                      ? "text-green-600 border-green-300"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {c.status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        {(campaignList ?? []).length === 0 && !campaignsLoading && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            ไม่พบแคมเปญ
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Compare button */}
                <Button
                  onClick={handleCompare}
                  disabled={selectedCampaigns.length < 2 || compareLoading}
                  className="gap-2 mt-1"
                >
                  {compareLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <GitCompare className="w-4 h-4" />
                  )}
                  เปรียบเทียบ {selectedCampaigns.length} แคมเปญ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error state */}
        {compareError && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm">{compareError.message}</p>
          </div>
        )}

        {/* Loading state */}
        {compareLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">กำลังดึงข้อมูลแคมเปญ...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {campaigns.length >= 2 && !compareLoading && (
          <>
            {/* Winner Banner */}
            {overallWinner >= 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <Trophy className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    🏆 แคมเปญที่ชนะโดยรวม:{" "}
                    <span className="font-bold">{campaigns[overallWinner].campaignName}</span>
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    ชนะ {wins[overallWinner]} จาก {METRICS.length} เมตริก
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  {wins.map((w, i) => (
                    <div key={i} className={`text-center px-3 py-1 rounded-lg border ${CAMPAIGN_BG[i]}`}>
                      <div className={`text-lg font-bold ${CAMPAIGN_TEXT[i]}`}>{w}</div>
                      <div className={`text-xs ${CAMPAIGN_TEXT[i]}`}>wins</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  เปรียบเทียบ Side-by-Side
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground w-52">
                        เมตริก
                      </th>
                      {campaigns.map((c, idx) => (
                        <th key={c.campaignId} className="px-4 py-3 text-center min-w-[160px]">
                          <div className={`inline-flex flex-col items-center gap-1`}>
                            <span
                              className={`font-semibold text-sm ${CAMPAIGN_TEXT[idx]} max-w-[150px] truncate block`}
                            >
                              {c.campaignName}
                            </span>
                            {overallWinner === idx && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                🏆 ชนะ
                              </Badge>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {METRICS.map((metric, mIdx) => {
                      const values = campaigns.map((c) => (c[metric.key] as number) ?? 0);
                      const winnerIdx = getWinnerIndex(values, metric.winnerIs);
                      const loserIdx = getLoserIndex(values, metric.winnerIs);

                      return (
                        <tr
                          key={metric.key}
                          className={`border-b border-border/50 ${mIdx % 2 === 0 ? "bg-muted/20" : ""}`}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            <div className="flex items-center gap-1.5">
                              {metric.winnerIs === "higher" ? (
                                <TrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              )}
                              {metric.label}
                            </div>
                          </td>
                          {campaigns.map((c, cIdx) => {
                            const val = (c[metric.key] as number) ?? 0;
                            const isWinner = cIdx === winnerIdx;
                            const isLoser = cIdx === loserIdx;

                            return (
                              <td
                                key={c.campaignId}
                                className={`px-4 py-3 text-center font-mono transition-colors ${
                                  isWinner
                                    ? "bg-green-50 text-green-700 font-semibold"
                                    : isLoser
                                    ? "bg-red-50 text-red-600"
                                    : "text-foreground"
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  {metric.format(val)}
                                  {isWinner && campaigns.length > 1 && (
                                    <span className="text-green-600 text-xs">✓</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Bar Chart Comparison */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">กราฟเปรียบเทียบ Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="metric"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      {campaigns.map((c, idx) => (
                        <Bar
                          key={c.campaignId}
                          dataKey={c.campaignName.slice(0, 20)}
                          fill={CAMPAIGN_COLORS[idx]}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={60}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Spend vs Revenue Bar Chart */}
            {spendChartData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Spend vs Revenue เปรียบเทียบ</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={spendChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        formatter={(value: number) => `฿${value.toLocaleString("th-TH")}`}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="spend" name="Spend (฿)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      <Bar dataKey="revenue" name="Revenue (฿)" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Spend Comparison Card */}
            <div className={`grid gap-4 grid-cols-1 sm:grid-cols-${campaigns.length}`}>
              {campaigns.map((c, idx) => (
                <Card key={c.campaignId} className={`border-2 ${CAMPAIGN_BG[idx]}`}>
                  <CardContent className="p-4">
                    <div className={`text-xs font-medium mb-2 ${CAMPAIGN_TEXT[idx]}`}>
                      Campaign {idx + 1}
                    </div>
                    <div className={`font-bold text-sm mb-3 ${CAMPAIGN_TEXT[idx]} truncate`}>
                      {c.campaignName}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Spend</div>
                        <div className="font-semibold text-foreground">
                          ฿{c.spend.toLocaleString("th-TH")}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">ROAS</div>
                        <div className="font-semibold text-foreground">
                          {c.roas > 0 ? `${c.roas.toFixed(2)}x` : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CTR</div>
                        <div className="font-semibold text-foreground">{c.ctr.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CPA</div>
                        <div className="font-semibold text-foreground">
                          {c.cpa > 0 ? `฿${c.cpa.toFixed(2)}` : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Conv Rate</div>
                        <div className="font-semibold text-foreground">
                          {c.conversionRate.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Wins</div>
                        <div className={`font-bold ${CAMPAIGN_TEXT[idx]}`}>
                          {wins[idx] ?? 0} / {METRICS.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!compareEnabled && selectedCampaigns.length < 2 && (
          <div className="text-center py-16">
            <GitCompare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              เปรียบเทียบแคมเปญแบบ Side-by-Side
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              เลือก 2-3 แคมเปญจาก Ad Account ของคุณ แล้วกด "เปรียบเทียบ" เพื่อดูว่าแคมเปญไหน
              มี Cost per Result ต่ำกว่า และ Conversion Rate สูงกว่า
              พร้อม highlight สีเขียวในช่องที่ชนะ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
