import { useState, useMemo, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Video,
  Search,
  BarChart3,
  Target,
  MousePointerClick,
  DollarSign,
  Play,
  Trophy,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

type SortKey = "spend" | "roas" | "ctr" | "cpa" | "conversions" | "video3SecPlays";
type SortDir = "asc" | "desc";

interface CreativeItem {
  id: number;
  adId: string;
  adName: string;
  adsetName?: string | null;
  campaignName?: string | null;
  thumbnailUrl?: string | null;
  videoId?: string | null;
  creativeType?: string | null;
  spend?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  ctr?: number | null;
  cpc?: number | null;
  cpa?: number | null;
  roas?: number | null;
  conversions?: number | null;
  videoThruPlays?: number | null;
  video3SecPlays?: number | null;
  videoAvgPlayTime?: number | null;
}

function MetricBadge({ value, label, good }: { value: string; label: string; good?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-sm font-bold ${good === true ? "text-green-600" : good === false ? "text-red-600" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function CreativeCard({
  creative,
  rank,
  rankType,
  onClick,
}: {
  creative: CreativeItem;
  rank?: number;
  rankType?: "top" | "bottom";
  onClick: () => void;
}) {
  const isVideo = creative.creativeType === "video";
  const spend = creative.spend ?? 0;
  const roas = creative.roas ?? 0;
  const ctr = creative.ctr ?? 0;
  const cpa = creative.cpa ?? 0;
  const video3Sec = creative.video3SecPlays ?? 0;

  const borderClass =
    rankType === "top"
      ? "border-green-200 bg-green-50/30"
      : rankType === "bottom"
        ? "border-red-200 bg-red-50/30"
        : "border-border";

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${borderClass}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
            {creative.thumbnailUrl ? (
              <img
                src={creative.thumbnailUrl}
                alt={creative.adName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isVideo ? (
                  <Video className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            )}
            {isVideo && (
              <div className="absolute bottom-1 right-1 bg-black/60 rounded p-0.5">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
            )}
            {rank !== undefined && (
              <div
                className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${rankType === "top" ? "bg-green-500" : "bg-red-500"}`}
              >
                {rank}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                {creative.adName}
              </p>
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {isVideo ? "Video" : "Image"}
              </Badge>
            </div>
            {creative.campaignName && (
              <p className="text-xs text-muted-foreground truncate mb-2">
                {creative.campaignName}
              </p>
            )}

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-border/50">
              <MetricBadge
                value={`฿${spend.toFixed(0)}`}
                label="Spend"
              />
              <MetricBadge
                value={roas > 0 ? `${roas.toFixed(2)}x` : "—"}
                label="ROAS"
                good={roas > 0 ? roas >= 2 : undefined}
              />
              <MetricBadge
                value={`${ctr.toFixed(2)}%`}
                label="CTR"
                good={ctr >= 1}
              />
              {isVideo ? (
                <MetricBadge
                  value={video3Sec > 0 ? video3Sec.toLocaleString() : "—"}
                  label="3-sec"
                />
              ) : (
                <MetricBadge
                  value={cpa > 0 ? `฿${cpa.toFixed(0)}` : "—"}
                  label="CPA"
                  good={cpa > 0 ? cpa < 500 : undefined}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreativeDetailModal({
  creative,
  open,
  onClose,
}: {
  creative: CreativeItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!creative) return null;
  const isVideo = creative.creativeType === "video";

  const metrics = [
    { label: "Spend", value: `฿${(creative.spend ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "Impressions", value: (creative.impressions ?? 0).toLocaleString(), icon: Eye },
    { label: "Clicks", value: (creative.clicks ?? 0).toLocaleString(), icon: MousePointerClick },
    { label: "CTR", value: `${(creative.ctr ?? 0).toFixed(2)}%`, icon: Target },
    { label: "CPC", value: `฿${(creative.cpc ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "Conversions", value: (creative.conversions ?? 0).toLocaleString(), icon: TrendingUp },
    { label: "CPA", value: creative.cpa ? `฿${creative.cpa.toFixed(2)}` : "—", icon: Target },
    { label: "ROAS", value: creative.roas ? `${creative.roas.toFixed(2)}x` : "—", icon: TrendingUp },
  ];

  const videoMetrics = [
    { label: "3-Sec Video Plays", value: (creative.video3SecPlays ?? 0).toLocaleString() },
    { label: "ThruPlays", value: (creative.videoThruPlays ?? 0).toLocaleString() },
    { label: "Avg Play Time", value: creative.videoAvgPlayTime ? `${creative.videoAvgPlayTime.toFixed(1)}s` : "—" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base leading-tight pr-8">{creative.adName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Thumbnail */}
          {creative.thumbnailUrl && (
            <div className="rounded-lg overflow-hidden bg-muted aspect-video max-h-64">
              <img
                src={creative.thumbnailUrl}
                alt={creative.adName}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{isVideo ? "Video" : "Image"}</Badge>
            {creative.campaignName && (
              <Badge variant="outline">{creative.campaignName}</Badge>
            )}
            {creative.adsetName && (
              <Badge variant="outline" className="text-xs">{creative.adsetName}</Badge>
            )}
          </div>

          {/* Metrics grid */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-base font-bold text-foreground">{m.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Video metrics */}
          {isVideo && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Video Metrics</h4>
              <div className="grid grid-cols-3 gap-3">
                {videoMetrics.map((m) => (
                  <div key={m.label} className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-base font-bold text-blue-700">{m.value}</div>
                    <div className="text-xs text-blue-600 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad IDs */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
            <div>Ad ID: {creative.adId}</div>
            {creative.videoId && <div>Video ID: {creative.videoId}</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CreativePerformance() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [adAccountId, setAdAccountId] = useState("");
  const [inputAccountId, setInputAccountId] = useState("");
  const [dateRange, setDateRange] = useState<"7d" | "14d" | "30d">("7d");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterText, setFilterText] = useState("");
  const [selectedCreative, setSelectedCreative] = useState<CreativeItem | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  const utils = trpc.useUtils();

  // Fetch saved Meta connection status and ad accounts
  const { data: metaStatus } = trpc.meta.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: adAccounts } = trpc.meta.getAdAccounts.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Auto-populate from saved connection
  useEffect(() => {
    if (metaStatus?.selectedAdAccountId && !adAccountId) {
      setAdAccountId(metaStatus.selectedAdAccountId);
      setInputAccountId(metaStatus.selectedAdAccountId);
    }
  }, [metaStatus, adAccountId]);

  const [campaignFilter, setCampaignFilter] = useState<string>("all");

  // Fetch creative performance data
  const { data: perfData, isLoading: perfLoading, error: perfError } = trpc.creative.getCreativePerformance.useQuery(
    { adAccountId, dateRange, forceRefresh },
    {
      enabled: isAuthenticated && adAccountId.length > 0,
      staleTime: 5 * 60 * 1000,
    },
  );

  // Fetch summary KPIs
  const { data: kpiData } = trpc.creative.getSummaryKPIs.useQuery(
    { adAccountId, dateRange },
    { enabled: isAuthenticated && adAccountId.length > 0 },
  );

  // Fetch top performers
  const { data: topData } = trpc.creative.getTopPerformers.useQuery(
    { adAccountId, dateRange, sortBy: "roas", limit: 5 },
    { enabled: isAuthenticated && adAccountId.length > 0 },
  );

  // Fetch bottom performers
  const { data: bottomData } = trpc.creative.getBottomPerformers.useQuery(
    { adAccountId, dateRange, sortBy: "cpa", limit: 5 },
    { enabled: isAuthenticated && adAccountId.length > 0 },
  );

  // Unique campaign names for campaign filter dropdown
  const campaignNames = useMemo(() => {
    const names = new Set<string>();
    (perfData?.creatives ?? []).forEach((c: CreativeItem) => {
      if (c.campaignName) names.add(c.campaignName);
    });
    return Array.from(names).sort();
  }, [perfData]);

  // Sorted & filtered creatives
  const allCreatives: CreativeItem[] = useMemo(() => {
    const items = (perfData?.creatives ?? []) as CreativeItem[];
    let filtered = items;

    if (campaignFilter !== "all") {
      filtered = filtered.filter((c) => c.campaignName === campaignFilter);
    }

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.adName.toLowerCase().includes(q) ||
          (c.campaignName ?? "").toLowerCase().includes(q) ||
          (c.adsetName ?? "").toLowerCase().includes(q),
      );
    }

    return [...filtered].sort((a, b) => {
      const aVal = (a[sortKey] as number) ?? 0;
      const bVal = (b[sortKey] as number) ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [perfData, filterText, sortKey, sortDir]);

  const handleConnect = () => {
    const id = inputAccountId.trim();
    if (!id) {
      toast.error("กรุณากรอก Ad Account ID");
      return;
    }
    const normalized = id.startsWith("act_") ? id : `act_${id}`;
    setAdAccountId(normalized);
    setForceRefresh(false);
  };

  const handleRefresh = () => {
    setForceRefresh(true);
    utils.creative.getCreativePerformance.invalidate(undefined, { refetchType: "all" });
    utils.creative.getSummaryKPIs.invalidate(undefined, { refetchType: "all" });
    utils.creative.getTopPerformers.invalidate(undefined, { refetchType: "all" });
    utils.creative.getBottomPerformers.invalidate(undefined, { refetchType: "all" });
    setTimeout(() => setForceRefresh(false), 1000);
    toast.success("กำลังดึงข้อมูลใหม่จาก Meta API...");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortButton = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${sortKey === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
    >
      {label}
      {sortKey === k ? (
        sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      ) : null}
    </button>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Creative Performance</h2>
            <p className="text-muted-foreground mb-6">กรุณาเข้าสู่ระบบเพื่อดูประสิทธิภาพ Creative</p>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>เข้าสู่ระบบ</a>
            </Button>
          </CardContent>
        </Card>
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
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Creative Performance</span>
              </div>
            </div>
            {adAccountId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={perfLoading}
                className="gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${perfLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Connect / Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Ad Account
                </label>
                {adAccounts && adAccounts.length > 0 ? (
                  <Select
                    value={adAccountId}
                    onValueChange={(v) => {
                      setAdAccountId(v);
                      setInputAccountId(v);
                      setCampaignFilter("all");
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
                  <Input
                    placeholder="act_123456789 หรือ 123456789"
                    value={inputAccountId}
                    onChange={(e) => setInputAccountId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                    className="font-mono text-sm"
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  ช่วงเวลา
                </label>
                <Select value={dateRange} onValueChange={(v) => { setDateRange(v as "7d" | "14d" | "30d"); setCampaignFilter("all"); }}>
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
              <Button onClick={handleConnect} className="gap-2">
                <Search className="w-4 h-4" />
                ดึงข้อมูล
              </Button>
            </div>
            {adAccountId && (
              <p className="text-xs text-muted-foreground mt-2">
                กำลังแสดงข้อมูลของ <span className="font-mono font-medium">{adAccountId}</span>
                {perfData?.fromCache && (
                  <span className="ml-2 text-amber-600">(จาก cache)</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error state */}
        {perfError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">เกิดข้อผิดพลาด</p>
                <p className="text-xs text-red-600 mt-0.5">{perfError.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {perfLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">กำลังดึงข้อมูล Creative จาก Meta API...</p>
            </div>
          </div>
        )}

        {/* KPI Summary */}
        {kpiData && !perfLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: "Creatives", value: kpiData.totalCreatives.toString(), icon: ImageIcon, color: "text-blue-600" },
              { label: "Video", value: kpiData.videoCreatives.toString(), icon: Video, color: "text-purple-600" },
              { label: "Total Spend", value: `฿${(kpiData.totalSpend).toFixed(0)}`, icon: DollarSign, color: "text-green-600" },
              { label: "Avg CTR", value: `${kpiData.avgCtr.toFixed(2)}%`, icon: MousePointerClick, color: "text-cyan-600" },
              { label: "Avg ROAS", value: kpiData.avgRoas > 0 ? `${kpiData.avgRoas.toFixed(2)}x` : "—", icon: TrendingUp, color: "text-emerald-600" },
              { label: "Avg CPA", value: kpiData.avgCpa > 0 ? `฿${kpiData.avgCpa.toFixed(0)}` : "—", icon: Target, color: "text-orange-600" },
              { label: "Conversions", value: kpiData.totalConversions.toLocaleString(), icon: BarChart3, color: "text-indigo-600" },
              { label: "3-Sec Plays", value: kpiData.totalVideo3SecPlays.toLocaleString(), icon: Play, color: "text-pink-600" },
            ].map((kpi) => (
              <Card key={kpi.label} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 text-center">
                  <kpi.icon className={`w-4 h-4 mx-auto mb-1 ${kpi.color}`} />
                  <div className="text-base font-bold text-foreground">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Top & Bottom Performers */}
        {(topData?.topPerformers?.length ?? 0) > 0 && !perfLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-foreground">Top Performers</h3>
                <Badge className="bg-green-100 text-green-700 border-green-200">ROAS สูงสุด</Badge>
              </div>
              <div className="space-y-2">
                {(topData?.topPerformers ?? []).map((c, idx) => (
                  <CreativeCard
                    key={c.id}
                    creative={c as CreativeItem}
                    rank={idx + 1}
                    rankType="top"
                    onClick={() => setSelectedCreative(c as CreativeItem)}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Performers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-foreground">Losers</h3>
                <Badge className="bg-red-100 text-red-700 border-red-200">CPA สูงสุด</Badge>
              </div>
              <div className="space-y-2">
                {(bottomData?.bottomPerformers ?? []).map((c, idx) => (
                  <CreativeCard
                    key={c.id}
                    creative={c as CreativeItem}
                    rank={idx + 1}
                    rankType="bottom"
                    onClick={() => setSelectedCreative(c as CreativeItem)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Creatives Table */}
        {allCreatives.length > 0 && !perfLoading && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base">
                  Creative ทั้งหมด ({allCreatives.length})
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Campaign filter */}
                  {campaignNames.length > 0 && (
                    <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                      <SelectTrigger className="h-8 text-sm w-44">
                        <SelectValue placeholder="ทุก Campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุก Campaign</SelectItem>
                        {campaignNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหา..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="pl-8 h-8 text-sm w-40"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Sort:</span>
                    <SortButton k="spend" label="Spend" />
                    <SortButton k="roas" label="ROAS" />
                    <SortButton k="ctr" label="CTR" />
                    <SortButton k="cpa" label="CPA" />
                    <SortButton k="video3SecPlays" label="3-Sec" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {allCreatives.map((c) => (
                  <CreativeCard
                    key={c.id}
                    creative={c}
                    onClick={() => setSelectedCreative(c)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!adAccountId && !perfLoading && (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">วิเคราะห์ Creative Performance</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              กรอก Ad Account ID และเลือกช่วงเวลา แล้วกด "ดึงข้อมูล" เพื่อดูประสิทธิภาพของ Creative แต่ละชิ้น
              พร้อมจัดอันดับ Top Performers และ Losers
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              ต้องเชื่อมต่อ Meta API ที่หน้า{" "}
              <Link href="/dashboard" className="text-primary underline underline-offset-2">
                Dashboard
              </Link>{" "}
              ก่อน
            </p>
          </div>
        )}

        {adAccountId && !perfLoading && allCreatives.length === 0 && !perfError && (
          <div className="text-center py-16">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">ไม่พบข้อมูล Creative สำหรับ Account นี้ในช่วงเวลาที่เลือก</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <CreativeDetailModal
        creative={selectedCreative}
        open={!!selectedCreative}
        onClose={() => setSelectedCreative(null)}
      />
    </div>
  );
}
