import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Users,
  Megaphone,
  Palette,
  Settings2,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface HealthScores {
  audienceScore: number;
  promotionScore: number;
  creativeScore: number;
  systemScore: number;
  overallScore: number;
  issues: string[];
  rootCauses: string[];
  holisticRecommendations: string[];
  aiSummary?: string;
}

function ScoreRing({ score, label, icon: Icon, color }: {
  score: number;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-blue-600";
    if (s >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return "bg-green-50 border-green-200";
    if (s >= 60) return "bg-blue-50 border-blue-200";
    if (s >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <Card className={`p-5 border ${getBgColor(score)} text-center`}>
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
      <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
      <div className="mt-2">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </Card>
  );
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
  "อื่นๆ",
];

function calculateHealthScores(form: {
  roas: number;
  ctr: number;
  conversionRate: number;
  cpc: number;
  budget: number;
  productType: string;
  targetAudience: string;
  hasLandingPage: string;
  hasRetargeting: string;
  adVariants: number;
}): HealthScores {
  // Audience Score
  let audienceScore = 100;
  if (form.ctr < 0.5) audienceScore = 20;
  else if (form.ctr < 1) audienceScore = 45;
  else if (form.ctr < 1.5) audienceScore = 65;
  else if (form.ctr < 2) audienceScore = 80;
  if (!form.targetAudience) audienceScore = Math.min(audienceScore, 70);
  if (form.hasRetargeting === "no") audienceScore = Math.min(audienceScore, 80);

  // Promotion Score
  let promotionScore = 100;
  if (form.roas < 1) promotionScore = 20;
  else if (form.roas < 1.5) promotionScore = 45;
  else if (form.roas < 2) promotionScore = 65;
  else if (form.roas < 2.5) promotionScore = 80;

  // Creative Score
  let creativeScore = 100;
  if (form.ctr < 1 && form.conversionRate < 1) creativeScore = 30;
  else if (form.ctr < 1.5 || form.conversionRate < 1) creativeScore = 55;
  else if (form.ctr < 2 || form.conversionRate < 2) creativeScore = 75;
  if (form.adVariants < 2) creativeScore = Math.min(creativeScore, 60);
  else if (form.adVariants >= 3) creativeScore = Math.min(100, creativeScore + 10);

  // System Score
  let systemScore = 100;
  if (form.conversionRate < 0.5) systemScore = 25;
  else if (form.conversionRate < 1) systemScore = 50;
  else if (form.conversionRate < 2) systemScore = 75;
  if (form.hasLandingPage === "no") systemScore = Math.min(systemScore, 50);

  audienceScore = Math.max(0, Math.min(100, Math.round(audienceScore)));
  promotionScore = Math.max(0, Math.min(100, Math.round(promotionScore)));
  creativeScore = Math.max(0, Math.min(100, Math.round(creativeScore)));
  systemScore = Math.max(0, Math.min(100, Math.round(systemScore)));
  const overallScore = Math.round((audienceScore + promotionScore + creativeScore + systemScore) / 4);

  const issues: string[] = [];
  const rootCauses: string[] = [];
  const holisticRecommendations: string[] = [];

  if (form.roas < 2) issues.push("ROAS ต่ำกว่าเป้าหมาย - ธุรกิจยังไม่เติบโตเต็มที่");
  if (form.ctr < 1.5) issues.push("CTR ต่ำ - ผู้ชมไม่สนใจโฆษณาเท่าที่ควร");
  if (form.conversionRate < 1) issues.push("Conversion Rate ต่ำ - ลูกค้าไม่แปลงเป็นการซื้อ");
  if (form.cpc > 50) issues.push("CPC สูงเกินไป - ต้นทุนต่อคลิกสูงกว่าค่าเฉลี่ย");
  if (form.adVariants < 2) issues.push("Creative ไม่หลากหลาย - ขาดการทดสอบ A/B");

  if (form.ctr < 1.5 && form.conversionRate > 2) {
    rootCauses.push("Audience ไม่ตรงกลุ่มเป้าหมาย - ผู้ชมเห็นโฆษณาแต่ไม่คลิก");
    rootCauses.push("Creative ไม่ดึงดูดความสนใจเพียงพอ");
  }
  if (form.ctr > 2 && form.conversionRate < 1) {
    rootCauses.push("Landing Page ไม่ตรงกับสิ่งที่โฆษณาสัญญา");
    rootCauses.push("ขั้นตอน Checkout ซับซ้อนเกินไป");
  }
  if (form.roas < 1.5) {
    rootCauses.push("ราคาสินค้าหรือโปรโมชั่นไม่ดึงดูดพอ");
    rootCauses.push("Budget ถูกใช้กับ Audience ที่ไม่มีคุณภาพ");
  }
  if (rootCauses.length === 0 && issues.length > 0) {
    rootCauses.push("ต้องวิเคราะห์ข้อมูลเพิ่มเติมเพื่อหาสาเหตุที่แท้จริง");
  }

  holisticRecommendations.push("ทำ Lookalike Audience จากลูกค้าที่ซื้อแล้วเพื่อหา Prospect ที่มีคุณภาพ");
  holisticRecommendations.push("ทดสอบ Creative อย่างน้อย 3-5 ชิ้นพร้อมกัน เลือก CTR สูงสุดมา Scale");
  holisticRecommendations.push("ปรับปรุง Landing Page ให้ตรงกับ Message ในโฆษณา");
  holisticRecommendations.push("ตั้ง Retargeting Campaign ให้ผู้ที่เคยเข้าเว็บแต่ยังไม่ซื้อ");
  if (form.roas < 2) holisticRecommendations.push("พิจารณาเพิ่มโปรโมชั่นหรือ Bundle Deal เพื่อเพิ่ม Average Order Value");
  if (form.cpc > 50) holisticRecommendations.push("แคบ Audience Targeting ให้เฉพาะเจาะจงมากขึ้นเพื่อลด CPC");

  return {
    audienceScore,
    promotionScore,
    creativeScore,
    systemScore,
    overallScore,
    issues,
    rootCauses,
    holisticRecommendations,
  };
}

export default function HealthCheck() {
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState<HealthScores | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [form, setForm] = useState({
    roas: "",
    ctr: "",
    conversionRate: "",
    cpc: "",
    budget: "",
    productType: "สมุนไพรทั่วไป",
    targetAudience: "",
    hasLandingPage: "yes",
    hasRetargeting: "no",
    adVariants: "1",
  });

  const handleAnalyze = () => {
    if (!form.roas || !form.ctr) {
      toast.error("กรุณากรอก ROAS และ CTR เป็นอย่างน้อย");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      const scores = calculateHealthScores({
        roas: parseFloat(form.roas) || 0,
        ctr: parseFloat(form.ctr) || 0,
        conversionRate: parseFloat(form.conversionRate) || 0,
        cpc: parseFloat(form.cpc) || 0,
        budget: parseFloat(form.budget) || 0,
        productType: form.productType,
        targetAudience: form.targetAudience,
        hasLandingPage: form.hasLandingPage,
        hasRetargeting: form.hasRetargeting,
        adVariants: parseInt(form.adVariants) || 1,
      });
      setResult(scores);
      setIsAnalyzing(false);
      toast.success("ตรวจสุขภาพธุรกิจสำเร็จ!");
    }, 800);
  };

  const handleReset = () => {
    setForm({
      roas: "",
      ctr: "",
      conversionRate: "",
      cpc: "",
      budget: "",
      productType: "สมุนไพรทั่วไป",
      targetAudience: "",
      hasLandingPage: "yes",
      hasRetargeting: "no",
      adVariants: "1",
    });
    setResult(null);
  };

  const getOverallLabel = (score: number) => {
    if (score >= 80) return { label: "สุขภาพดีเยี่ยม", color: "text-green-600", bg: "bg-green-50 border-green-200" };
    if (score >= 60) return { label: "สุขภาพดี", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    if (score >= 40) return { label: "ต้องปรับปรุง", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
    return { label: "วิกฤต - ต้องแก้ไขด่วน", color: "text-red-600", bg: "bg-red-50 border-red-200" };
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
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-foreground">Business Health Check</span>
                  <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">ตรวจสุขภาพธุรกิจ 4 มิติ</span>
                </div>
              </div>
            </div>
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="sm">เข้าสู่ระบบ</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 border border-border sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                ข้อมูลแคมเปญ
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

                {/* ROAS & CTR */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">ROAS *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 2.5"
                      value={form.roas}
                      onChange={(e) => setForm(f => ({ ...f, roas: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">CTR (%) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 2.1"
                      value={form.ctr}
                      onChange={(e) => setForm(f => ({ ...f, ctr: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Conversion Rate & CPC */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Conv. Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 3.2"
                      value={form.conversionRate}
                      onChange={(e) => setForm(f => ({ ...f, conversionRate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">CPC (฿)</Label>
                    <Input
                      type="number"
                      placeholder="เช่น 15"
                      value={form.cpc}
                      onChange={(e) => setForm(f => ({ ...f, cpc: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">กลุ่มเป้าหมาย</Label>
                  <Input
                    placeholder="เช่น ผู้หญิง 25-45 ปี"
                    value={form.targetAudience}
                    onChange={(e) => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                  />
                </div>

                {/* Ad Variants */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">จำนวน Creative ที่ทดสอบ</Label>
                  <Select value={form.adVariants} onValueChange={(v) => setForm(f => ({ ...f, adVariants: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 ชิ้น (ไม่มี A/B Test)</SelectItem>
                      <SelectItem value="2">2 ชิ้น</SelectItem>
                      <SelectItem value="3">3 ชิ้น</SelectItem>
                      <SelectItem value="5">5+ ชิ้น</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Landing Page */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">มี Landing Page แยกต่างหาก?</Label>
                  <Select value={form.hasLandingPage} onValueChange={(v) => setForm(f => ({ ...f, hasLandingPage: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">มี Landing Page</SelectItem>
                      <SelectItem value="no">ไม่มี (ใช้หน้าเว็บหลัก)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Retargeting */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">ทำ Retargeting Campaign?</Label>
                  <Select value={form.hasRetargeting} onValueChange={(v) => setForm(f => ({ ...f, hasRetargeting: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">ทำ Retargeting</SelectItem>
                      <SelectItem value="no">ยังไม่ได้ทำ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4 mr-2" />
                        ตรวจสุขภาพธุรกิจ
                      </>
                    )}
                  </Button>
                  {result && (
                    <Button variant="outline" size="icon" onClick={handleReset} title="รีเซ็ต">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {!result ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                  <Building2 className="w-10 h-10 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">ตรวจสุขภาพธุรกิจของคุณ</h3>
                <p className="text-muted-foreground max-w-sm">
                  กรอกข้อมูลแคมเปญทางซ้าย แล้วกด "ตรวจสุขภาพธุรกิจ" เพื่อรับการวิเคราะห์ 4 มิติ
                </p>
                <div className="grid grid-cols-2 gap-3 mt-8 max-w-sm w-full">
                  {[
                    { icon: Users, label: "Audience", color: "text-blue-500" },
                    { icon: Megaphone, label: "Promotion", color: "text-green-500" },
                    { icon: Palette, label: "Creative", color: "text-purple-500" },
                    { icon: Settings2, label: "System", color: "text-orange-500" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-sm font-medium text-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Overall Score */}
                {(() => {
                  const { label, color, bg } = getOverallLabel(result.overallScore);
                  return (
                    <Card className={`p-6 border ${bg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">คะแนนสุขภาพธุรกิจโดยรวม</p>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-bold ${color}`}>{result.overallScore}</span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                          <Badge className={`mt-2 ${color} bg-transparent border-current`}>{label}</Badge>
                        </div>
                        <div className={`w-20 h-20 rounded-full border-4 ${
                          result.overallScore >= 80 ? "border-green-400" :
                          result.overallScore >= 60 ? "border-blue-400" :
                          result.overallScore >= 40 ? "border-yellow-400" : "border-red-400"
                        } flex items-center justify-center`}>
                          <Building2 className={`w-8 h-8 ${color}`} />
                        </div>
                      </div>
                    </Card>
                  );
                })()}

                {/* 4 Dimension Scores */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    คะแนนแต่ละมิติ
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ScoreRing score={result.audienceScore} label="Audience" icon={Users} color="bg-blue-500" />
                    <ScoreRing score={result.promotionScore} label="Promotion" icon={Megaphone} color="bg-green-500" />
                    <ScoreRing score={result.creativeScore} label="Creative" icon={Palette} color="bg-purple-500" />
                    <ScoreRing score={result.systemScore} label="System" icon={Settings2} color="bg-orange-500" />
                  </div>
                </div>

                {/* Issues */}
                {result.issues.length > 0 && (
                  <Card className="p-5 border border-red-200 bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      ปัญหาที่พบ ({result.issues.length})
                    </h3>
                    <ul className="space-y-2">
                      {result.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Root Causes */}
                {result.rootCauses.length > 0 && (
                  <Card className="p-5 border border-orange-200 bg-orange-50">
                    <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      สาเหตุที่เป็นไปได้
                    </h3>
                    <ul className="space-y-2">
                      {result.rootCauses.map((cause, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-orange-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    คำแนะนำเชิงองค์รวม
                  </h3>
                  <ul className="space-y-3">
                    {result.holisticRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-sm text-foreground leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href="/analyzer" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      วิเคราะห์โฆษณาเพิ่มเติม
                    </Button>
                  </Link>
                  <Link href="/copy-generator" className="flex-1">
                    <Button variant="outline" className="w-full bg-background">
                      สร้าง Ad Copy ใหม่
                    </Button>
                  </Link>
                </div>

                {/* Score Legend */}
                <Card className="p-4 border border-border bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">เกณฑ์คะแนน</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { range: "80-100", label: "ดีเยี่ยม", color: "text-green-600" },
                      { range: "60-79", label: "ดี", color: "text-blue-600" },
                      { range: "40-59", label: "พอใช้", color: "text-yellow-600" },
                      { range: "0-39", label: "ต้องปรับปรุงด่วน", color: "text-red-600" },
                    ].map(({ range, label, color }) => (
                      <div key={range} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${color}`} />
                        <span className="text-muted-foreground">{range}: <span className={color}>{label}</span></span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
