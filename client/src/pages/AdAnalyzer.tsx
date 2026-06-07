import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  BarChart3,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  History,
  Trash2,
  LineChart,
  Target,
  Zap,
  RefreshCw,
} from "lucide-react";

interface AnalysisResult {
  roas: number;
  cpc: number;
  ctr: number;
  conversionRate: number;
  score: number;
  complianceIssues: string[];
  recommendations: string[];
  aiAnalysis: string;
}

const productTypes = [
  "สมุนไพรทั่วไป",
  "อาหารเสริมบำรุงกระดูก",
  "อาหารเสริมลดน้ำหนัก",
  "ชาสมุนไพร",
  "วิตามินและแร่ธาตุ",
  "ครีมบำรุงผิว",
  "ผลิตภัณฑ์ความงาม",
  "เสื้อผ้าแฟชั่น",
  "อุปกรณ์อิเล็กทรอนิกส์",
  "อาหารและเครื่องดื่ม",
  "บริการและคอร์สออนไลน์",
  "อสังหาริมทรัพย์",
  "อื่นๆ",
];

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return <Badge className="bg-green-100 text-green-700 border-green-200 text-lg px-4 py-1">{score}/100 ดีเยี่ยม</Badge>;
  if (score >= 60) return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-lg px-4 py-1">{score}/100 ดี</Badge>;
  if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-lg px-4 py-1">{score}/100 พอใช้</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200 text-lg px-4 py-1">{score}/100 ต้องปรับปรุง</Badge>;
}

function MetricCard({ label, value, unit, color, sublabel }: {
  label: string; value: number; unit: string; color: string; sublabel?: string;
}) {
  return (
    <Card className="p-5 border border-border">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
        <span className={`text-sm font-medium ${color}`}>{unit}</span>
      </div>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </Card>
  );
}

export default function AdAnalyzer() {
  const { isAuthenticated, user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [form, setForm] = useState({
    budget: "",
    impressions: "",
    clicks: "",
    conversions: "",
    revenue: "",
    productType: "สมุนไพรทั่วไป",
    targetAudience: "",
    adContent: "",
  });

  const analyzeMutation = trpc.adAnalysis.analyze.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("วิเคราะห์โฆษณาสำเร็จ!");
    },
    onError: (err) => {
      toast.error("เกิดข้อผิดพลาด: " + err.message);
    },
  });

  const historyQuery = trpc.adAnalysis.getHistory.useQuery(undefined, {
    enabled: isAuthenticated && showHistory,
  });

  const deleteMutation = trpc.adAnalysis.deleteHistory.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
      toast.success("ลบประวัติสำเร็จ");
    },
  });

  const handleAnalyze = () => {
    if (!form.budget || !form.impressions) {
      toast.error("กรุณากรอก Budget และ Impressions");
      return;
    }
    analyzeMutation.mutate({
      budget: parseFloat(form.budget) || 0,
      impressions: parseFloat(form.impressions) || 0,
      clicks: parseFloat(form.clicks) || 0,
      conversions: parseFloat(form.conversions) || 0,
      revenue: parseFloat(form.revenue) || 0,
      productType: form.productType,
      targetAudience: form.targetAudience || undefined,
      adContent: form.adContent || undefined,
    });
  };

  const handleReset = () => {
    setForm({
      budget: "",
      impressions: "",
      clicks: "",
      conversions: "",
      revenue: "",
      productType: "สมุนไพรทั่วไป",
      targetAudience: "",
      adContent: "",
    });
    setResult(null);
  };

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
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-bold text-foreground">AI Ad Analyzer</span>
                  <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">วิเคราะห์โฆษณา Facebook</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">ประวัติ</span>
                </Button>
              )}
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button size="sm">เข้าสู่ระบบ</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* History Panel */}
        {showHistory && isAuthenticated && (
          <div className="mb-8 animate-in">
            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  ประวัติการวิเคราะห์
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>ปิด</Button>
              </div>

              {historyQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : historyQuery.data?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ยังไม่มีประวัติการวิเคราะห์</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {historyQuery.data?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground truncate">{item.productType}</span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {item.score}/100
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>ROAS: {item.roas?.toFixed(2)}x</span>
                          <span>CTR: {item.ctr?.toFixed(2)}%</span>
                          <span>{new Date(item.createdAt).toLocaleDateString('th-TH')}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive ml-2"
                        onClick={() => deleteMutation.mutate({ id: item.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 border border-border sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                ข้อมูลโฆษณา
              </h2>

              <div className="space-y-4">
                {/* Product Type */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">ประเภทสินค้า</Label>
                  <Select value={form.productType} onValueChange={(v) => setForm(f => ({ ...f, productType: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">งบประมาณโฆษณา (฿) *</Label>
                  <Input
                    type="number"
                    placeholder="เช่น 5000"
                    value={form.budget}
                    onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
                  />
                </div>

                {/* Impressions & Clicks */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Impressions *</Label>
                    <Input
                      type="number"
                      placeholder="เช่น 50000"
                      value={form.impressions}
                      onChange={(e) => setForm(f => ({ ...f, impressions: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Clicks</Label>
                    <Input
                      type="number"
                      placeholder="เช่น 1500"
                      value={form.clicks}
                      onChange={(e) => setForm(f => ({ ...f, clicks: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Conversions & Revenue */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Conversions</Label>
                    <Input
                      type="number"
                      placeholder="เช่น 45"
                      value={form.conversions}
                      onChange={(e) => setForm(f => ({ ...f, conversions: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">รายได้ (฿)</Label>
                    <Input
                      type="number"
                      placeholder="เช่น 15000"
                      value={form.revenue}
                      onChange={(e) => setForm(f => ({ ...f, revenue: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">กลุ่มเป้าหมาย</Label>
                  <Input
                    placeholder="เช่น ผู้หญิง 25-45 ปี สนใจสุขภาพ"
                    value={form.targetAudience}
                    onChange={(e) => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                  />
                </div>

                {/* Ad Content */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">เนื้อหาโฆษณา (สำหรับตรวจ Compliance)</Label>
                  <Textarea
                    placeholder="วางข้อความโฆษณาของคุณที่นี่..."
                    value={form.adContent}
                    onChange={(e) => setForm(f => ({ ...f, adContent: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  {isAuthenticated ? (
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzeMutation.isPending}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          กำลังวิเคราะห์...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          วิเคราะห์ด้วย AI
                        </>
                      )}
                    </Button>
                  ) : (
                    <a href={getLoginUrl()} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        เข้าสู่ระบบเพื่อวิเคราะห์
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" onClick={handleReset} size="icon">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground text-center">
                    ต้องเข้าสู่ระบบเพื่อบันทึกผลการวิเคราะห์
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            {!result && !analyzeMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <LineChart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">พร้อมวิเคราะห์โฆษณา</h3>
                <p className="text-muted-foreground max-w-sm">
                  กรอกข้อมูลโฆษณาในฟอร์มทางซ้าย แล้วกด "วิเคราะห์ด้วย AI" เพื่อรับผลวิเคราะห์เชิงลึก
                </p>
              </div>
            )}

            {analyzeMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI กำลังวิเคราะห์...</h3>
                <p className="text-muted-foreground">กรุณารอสักครู่</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in">
                {/* Score Header */}
                <Card className="p-6 border border-border bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">คะแนนประสิทธิภาพโฆษณา</h3>
                      <p className="text-sm text-muted-foreground">วิเคราะห์โดย AI</p>
                    </div>
                    <ScoreBadge score={result.score} />
                  </div>

                  {result.aiAnalysis && (
                    <div className="mt-4 p-4 bg-background/60 rounded-lg border border-border">
                      <p className="text-sm text-foreground leading-relaxed">{result.aiAnalysis}</p>
                    </div>
                  )}
                </Card>

                {/* Key Metrics */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    เมตริกหลัก
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                      label="ROAS"
                      value={result.roas}
                      unit="x"
                      color={result.roas >= 2.5 ? "text-green-600" : result.roas >= 1.5 ? "text-yellow-600" : "text-red-600"}
                      sublabel="Return on Ad Spend"
                    />
                    <MetricCard
                      label="CTR"
                      value={result.ctr}
                      unit="%"
                      color={result.ctr >= 2 ? "text-green-600" : result.ctr >= 1.5 ? "text-yellow-600" : "text-red-600"}
                      sublabel="Click-Through Rate"
                    />
                    <MetricCard
                      label="CPC"
                      value={result.cpc}
                      unit="฿"
                      color={result.cpc <= 20 ? "text-green-600" : result.cpc <= 50 ? "text-yellow-600" : "text-red-600"}
                      sublabel="Cost Per Click"
                    />
                    <MetricCard
                      label="Conversion Rate"
                      value={result.conversionRate}
                      unit="%"
                      color={result.conversionRate >= 3 ? "text-green-600" : result.conversionRate >= 1 ? "text-yellow-600" : "text-red-600"}
                      sublabel="อัตราการแปลง"
                    />
                  </div>
                </div>

                {/* Compliance Issues */}
                {result.complianceIssues.length > 0 && (
                  <Card className="p-5 border border-red-200 bg-red-50">
                    <h3 className="text-base font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      ประเด็น Compliance ที่ต้องแก้ไข
                    </h3>
                    <div className="space-y-2">
                      {result.complianceIssues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <Card className="p-5 border border-border">
                    <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      คำแนะนำจาก AI
                    </h3>
                    <div className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg text-sm text-foreground">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link href="/health-check">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Target className="w-4 h-4" />
                      Business Health Check
                    </Button>
                  </Link>
                  <Link href="/copy-generator">
                    <Button variant="outline" size="sm" className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      สร้าง Ad Copy ใหม่
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    วิเคราะห์ใหม่
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
