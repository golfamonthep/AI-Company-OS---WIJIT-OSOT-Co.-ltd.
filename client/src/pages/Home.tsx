import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, TrendingUp, AlertTriangle, BarChart3, Lightbulb, Building2, Users, Download, Trash2, Plus } from "lucide-react";


/**
 * Design: Facebook Ads Performance Analyzer
 * - Deep Blue (#1e3a8a) for trust and analytics
 * - Vibrant Green (#10b981) for positive metrics
 * - Purple (#a855f7) for business health
 * - Data-driven dashboard aesthetic
 */

interface AdMetrics {
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  productType: string;
  targetAudience: string;
  adContent: string;
}

interface AnalysisResult {
  roas: number;
  cpc: number;
  ctr: number;
  conversionRate: number;
  complianceIssues: string[];
  recommendations: string[];
  score: number;
}

interface BusinessHealthCheck {
  audienceScore: number;
  promotionScore: number;
  creativeScore: number;
  systemScore: number;
  overallScore: number;
  issues: string[];
  rootCauses: string[];
  holisticRecommendations: string[];
}

interface LookalikeCustomer {
  name: string;
  age: number;
  interests: string;
  purchaseFrequency: string;
}

interface AnalysisHistory {
  id: string;
  timestamp: number;
  metrics: AdMetrics;
  analysis: AnalysisResult;
  businessHealth: BusinessHealthCheck | null;
}

export default function Home() {
  const [metrics, setMetrics] = useState<AdMetrics>({
    budget: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    productType: "สมุนไพรทั่วไป",
    targetAudience: "ผู้หญิง 25-45 ปี",
    adContent: "",
  });

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [businessHealth, setBusinessHealth] = useState<BusinessHealthCheck | null>(null);
  const [activeTab, setActiveTab] = useState("input");
  const [lookalikeCustomers, setLookalikeCustomers] = useState<LookalikeCustomer[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [newCustomer, setNewCustomer] = useState<LookalikeCustomer>({
    name: "",
    age: 0,
    interests: "",
    purchaseFrequency: "monthly"
  });

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("analysisHistory");
    if (saved) {
      try {
        setAnalysisHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newAnalysis: AnalysisResult, newBusinessHealth: BusinessHealthCheck | null) => {
    const newEntry: AnalysisHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      metrics: { ...metrics },
      analysis: newAnalysis,
      businessHealth: newBusinessHealth
    };
    const updated = [newEntry, ...analysisHistory].slice(0, 20); // Keep last 20
    setAnalysisHistory(updated);
    localStorage.setItem("analysisHistory", JSON.stringify(updated));
  };

  const handleInputChange = (field: keyof AdMetrics, value: any) => {
    setMetrics(prev => ({
      ...prev,
      [field]: field === "budget" || field === "impressions" || field === "clicks" || field === "conversions" || field === "revenue" 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const analyzeAds = () => {
    if (metrics.budget === 0 || metrics.impressions === 0) {
      alert("กรุณากรอกข้อมูล Budget และ Impressions");
      return;
    }

    // Calculate metrics
    const roas = metrics.revenue / metrics.budget;
    const cpc = metrics.budget / metrics.clicks || 0;
    const ctr = (metrics.clicks / metrics.impressions) * 100 || 0;
    const conversionRate = (metrics.conversions / metrics.clicks) * 100 || 0;

    // Compliance check
    const complianceIssues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for health/medical claims
    const healthKeywords = ["รักษา", "หายจาก", "ยา", "โรค", "อาการ", "ผ่าตัด"];
    const hasHealthClaims = healthKeywords.some(keyword => 
      metrics.adContent.toLowerCase().includes(keyword)
    );

    if (hasHealthClaims) {
      complianceIssues.push("⚠️ ตรวจพบคำกล่าวอ้างเกี่ยวกับสุขภาพ - อาจละเมิดนโยบาย Facebook");
      score -= 20;
    }

    // Check ROAS
    if (roas < 1.5) {
      recommendations.push("🔴 ROAS ต่ำกว่า 1.5x - ต้องปรับปรุงกลยุทธ์ targeting");
      score -= 15;
    } else if (roas < 2.5) {
      recommendations.push("🟡 ROAS อยู่ในระดับปกติ (1.5-2.5x) - มีโอกาสปรับปรุง");
      score -= 5;
    } else {
      recommendations.push("✅ ROAS ดีเยี่ยม (>2.5x) - ทำให้ดีต่อไป");
    }

    // Check CTR
    if (ctr < 1.5) {
      recommendations.push("📉 CTR ต่ำ - ปรับปรุง Creative หรือ Headline ให้น่าสนใจมากขึ้น");
      score -= 10;
    } else if (ctr > 3) {
      recommendations.push("✅ CTR ดี - ผู้ชมสนใจโฆษณาของคุณ");
    }

    // Check Conversion Rate
    if (conversionRate < 1) {
      recommendations.push("⚠️ Conversion Rate ต่ำ - ปรับปรุง Landing Page หรือ Call-to-Action");
      score -= 15;
    } else if (conversionRate > 3) {
      recommendations.push("🎯 Conversion Rate ดี - ลูกค้าสนใจสินค้าของคุณ");
    }

    // AI-based recommendations
    if (metrics.productType.includes("สมุนไพร") || metrics.productType.includes("อาหารเสริม")) {
      recommendations.push("💡 สำหรับสินค้าสุขภาพ: ใช้ Testimonial จากลูกค้าจริง แทนการอ้างสิทธิ์ทางการแพทย์");
      recommendations.push("💡 ลองใช้ Lookalike Audience จากลูกค้าที่ซื้อแล้ว เพื่อหา Lead ที่มีคุณภาพ");
      recommendations.push("💡 ทดสอบ Retargeting แคมเปญ ให้ผู้ที่ดูแล้วแต่ยังไม่ซื้อ");
    }

    // CPC optimization
    if (cpc > 50) {
      recommendations.push("💰 CPC สูง - ลองปรับปรุง Audience Targeting เพื่อลดค่าใช้จ่าย");
      score -= 10;
    }

    // Budget scaling recommendation
    if (roas > 2 && metrics.budget < 10000) {
      recommendations.push("📈 ROAS ดี - พิจารณาเพิ่ม Budget เพื่อ Scale แคมเปญ");
    }

    const result = {
      roas: Math.round(roas * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      complianceIssues,
      recommendations,
      score: Math.max(0, score)
    };
    setAnalysis(result);
    saveToHistory(result, null);
    setActiveTab("results");
  };

  const analyzeBusinessHealth = () => {
    if (!analysis) return;

    // Calculate health scores based on metrics
    let audienceScore = 100;
    let promotionScore = 100;
    let creativeScore = 100;
    let systemScore = 100;

    // Audience Score
    if (metrics.clicks === 0) {
      audienceScore = 20;
    } else if (analysis.ctr < 1) {
      audienceScore = 40;
    } else if (analysis.ctr < 2) {
      audienceScore = 70;
    }

    // Promotion Score (based on ROAS)
    if (analysis.roas < 1) {
      promotionScore = 20;
    } else if (analysis.roas < 1.5) {
      promotionScore = 50;
    } else if (analysis.roas < 2.5) {
      promotionScore = 75;
    }

    // Creative Score (based on CTR and conversion)
    if (analysis.ctr < 1 || analysis.conversionRate < 1) {
      creativeScore = 40;
    } else if (analysis.ctr < 2 || analysis.conversionRate < 2) {
      creativeScore = 70;
    }

    // System Score (based on overall efficiency)
    const efficiency = (metrics.conversions / metrics.clicks) * 100 || 0;
    if (efficiency < 1) {
      systemScore = 50;
    } else if (efficiency < 2) {
      systemScore = 75;
    }

    const overallScore = Math.round((audienceScore + promotionScore + creativeScore + systemScore) / 4);

    // Identify issues
    const issues: string[] = [];
    const rootCauses: string[] = [];
    const holisticRecommendations: string[] = [];

    // Issue detection
    if (analysis.roas < 2) {
      issues.push("🔴 ROAS ต่ำ - ธุรกิจไม่ได้เติบโตตามที่คาดหวัง");
    }

    if (analysis.ctr < 1.5) {
      issues.push("🔴 CTR ต่ำ - ผู้ชมไม่สนใจโฆษณา");
    }

    if (analysis.conversionRate < 1) {
      issues.push("🔴 Conversion Rate ต่ำ - ลูกค้าไม่แปลงเป็นการซื้อ");
    }

    // Root cause analysis
    if (analysis.ctr < 1.5 && analysis.conversionRate > 2) {
      rootCauses.push("📍 ปัญหา: Audience ไม่ตรงกับกลุ่มเป้าหมาย");
      rootCauses.push("📍 ปัญหา: Creative ไม่น่าสนใจ");
    }

    if (analysis.ctr > 2 && analysis.conversionRate < 1) {
      rootCauses.push("📍 ปัญหา: Landing Page หรือ Call-to-Action ไม่ชัดเจน");
      rootCauses.push("📍 ปัญหา: ระบบการตลาดหลังคลิกไม่มีประสิทธิภาพ");
    }

    if (analysis.roas < 1.5) {
      rootCauses.push("📍 ปัญหา: โปรโมชั่นหรือราคาอาจไม่ดึงดูดใจ");
      rootCauses.push("📍 ปัญหา: ต้นทุนโฆษณาสูงเกินไป");
    }

    // Holistic recommendations
    holisticRecommendations.push("🎯 ตรวจสอบ Audience: ลองทำ Lookalike Audience จากลูกค้าที่ซื้อแล้ว");
    holisticRecommendations.push("🎯 ปรับปรุง Creative: ทดสอบ 3-5 Creative ต่างกัน เลือกตัวที่ CTR สูงสุด");
    holisticRecommendations.push("🎯 ปรับปรุง Promotion: ลองเพิ่มโปรโมชั่นหรือ Discount เพื่อเพิ่ม Conversion");
    holisticRecommendations.push("🎯 ปรับปรุง System: ตรวจสอบ Landing Page, Checkout Process, Customer Support");
    holisticRecommendations.push("🎯 ใช้ Retargeting: ทำ Remarketing แคมเปญให้ผู้ที่ดูแล้วแต่ยังไม่ซื้อ");
    holisticRecommendations.push("🎯 วิเคราะห์คู่แข่ง: ดูว่าคู่แข่งใช้ Creative, Promotion, Audience แบบไหน");

    const healthResult = {
      audienceScore,
      promotionScore,
      creativeScore,
      systemScore,
      overallScore,
      issues,
      rootCauses,
      holisticRecommendations,
    };
    setBusinessHealth(healthResult);
    if (analysis) {
      saveToHistory(analysis, healthResult);
    }
  };

  const addLookalikeCustomer = () => {
    if (!newCustomer.name || newCustomer.age === 0) {
      alert("กรุณากรอกชื่อและอายุ");
      return;
    }
    setLookalikeCustomers([...lookalikeCustomers, newCustomer]);
    setNewCustomer({ name: "", age: 0, interests: "", purchaseFrequency: "monthly" });
  };

  const removeLookalikeCustomer = (index: number) => {
    setLookalikeCustomers(lookalikeCustomers.filter((_, i) => i !== index));
  };

  const generateLookalikeProfile = () => {
    if (lookalikeCustomers.length === 0) {
      alert("กรุณาเพิ่มลูกค้าอย่างน้อย 1 คน");
      return;
    }

    const avgAge = Math.round(lookalikeCustomers.reduce((sum, c) => sum + c.age, 0) / lookalikeCustomers.length);
    const allInterests = lookalikeCustomers.flatMap(c => c.interests.split(",")).filter(i => i);
    const uniqueInterests = Array.from(new Set(allInterests));
    const topInterests = uniqueInterests.slice(0, 5);

    return {
      ageRange: `${Math.max(18, avgAge - 5)}-${avgAge + 5} ปี`,
      interests: topInterests,
      purchaseFrequency: lookalikeCustomers[0].purchaseFrequency,
      size: lookalikeCustomers.length
    };
  };

  const exportToJSON = () => {
    if (!analysis) {
      alert("กรุณาวิเคราะห์โฆษณาก่อน");
      return;
    }

    const report = {
      date: new Date().toLocaleDateString('th-TH'),
      metrics: metrics,
      analysis: analysis,
      businessHealth: businessHealth
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facebook-ads-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm("คุณแน่ใจว่าต้องการลบประวัติหมดเดิมหมดใช่หรือไม่")) {
      setAnalysisHistory([]);
      localStorage.removeItem("analysisHistory");
    }
  };

  const resetForm = () => {
    setMetrics({
      budget: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      productType: "สมุนไพรทั่วไป",
      targetAudience: "ผู้หญิง 25-45 ปี",
      adContent: "",
    });
    setAnalysis(null);
    setBusinessHealth(null);
    setActiveTab("input");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Facebook Ads Analyzer</h1>
                <p className="text-sm text-muted-foreground">ระบบตรวจสอบและวิเคราะห์ประสิทธิภาพโฆษณา</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Input Tab */}
          <div className={activeTab === "input" ? "block" : "hidden"}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Input Form */}
              <div className="lg:col-span-2">
                <Card className="p-8 border-0 shadow-lg">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6">ป้อนข้อมูลโฆษณา</h2>
                  
                  <div className="space-y-6">
                    {/* Product Type */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">ประเภทสินค้า</Label>
                      <select 
                        value={metrics.productType}
                        onChange={(e) => handleInputChange("productType", e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>สมุนไพรทั่วไป</option>
                        <option>อาหารเสริมบำรุงกระดูก</option>
                        <option>ชาสมุนไพร</option>
                        <option>วิตามิน</option>
                        <option>อื่นๆ</option>
                      </select>
                    </div>

                    {/* Budget */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">งบประมาณโฆษณา (บาท)</Label>
                      <Input 
                        type="number" 
                        placeholder="เช่น 5000"
                        value={metrics.budget || ""}
                        onChange={(e) => handleInputChange("budget", e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Impressions */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">Impressions (จำนวนครั้งที่แสดง)</Label>
                      <Input 
                        type="number" 
                        placeholder="เช่น 50000"
                        value={metrics.impressions || ""}
                        onChange={(e) => handleInputChange("impressions", e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Clicks */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">Clicks (จำนวนครั้งที่คลิก)</Label>
                      <Input 
                        type="number" 
                        placeholder="เช่น 1500"
                        value={metrics.clicks || ""}
                        onChange={(e) => handleInputChange("clicks", e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Conversions */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">Conversions (จำนวนการแปลง)</Label>
                      <Input 
                        type="number" 
                        placeholder="เช่น 45"
                        value={metrics.conversions || ""}
                        onChange={(e) => handleInputChange("conversions", e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Revenue */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">รายได้ที่ได้รับ (บาท)</Label>
                      <Input 
                        type="number" 
                        placeholder="เช่น 15000"
                        value={metrics.revenue || ""}
                        onChange={(e) => handleInputChange("revenue", e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">กลุ่มเป้าหมาย</Label>
                      <Input 
                        type="text" 
                        placeholder="เช่น ผู้หญิง 25-45 ปี"
                        value={metrics.targetAudience}
                        onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Ad Content */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">เนื้อหาโฆษณา (ตัวอย่าง)</Label>
                      <textarea 
                        placeholder="วางเนื้อหาโฆษณาของคุณที่นี่ เพื่อให้ระบบตรวจสอบ Compliance"
                        value={metrics.adContent}
                        onChange={(e) => handleInputChange("adContent", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={analyzeAds}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                      >
                        <TrendingUp className="w-5 h-5 mr-2" />
                        วิเคราะห์โฆษณา
                      </Button>
                      <Button 
                        onClick={resetForm}
                        variant="outline"
                        className="flex-1 font-semibold py-3 text-lg"
                      >
                        รีเซ็ต
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card className="p-6 border-0 shadow-lg bg-blue-50">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    เคล็ดลับการใช้งาน
                  </h3>
                  <ul className="space-y-3 text-sm text-blue-800">
                    <li>{'\u2022 '}กรอกข้อมูลจากโฆษณา Facebook ที่ยิงไปแล้ว</li>
                    <li>{'\u2022 '}ระบบจะวิเคราะห์ ROAS, CTR, Conversion Rate</li>
                    <li>{'\u2022 '}ตรวจสอบ Compliance กับนโยบาย Facebook</li>
                    <li>{'\u2022 '}ได้รับคำแนะนำการปรับปรุง</li>
                  </ul>
                </Card>

                <Card className="p-6 border-0 shadow-lg bg-green-50">
                  <h3 className="font-bold text-green-900 mb-4">เมตริกที่สำคัญ</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li><strong>ROAS:</strong> Return on Ad Spend ({'>'} 2.5x)</li>
                    <li><strong>CTR:</strong> Click-Through Rate ({'>'} 2%)</li>
                    <li><strong>CPC:</strong> Cost Per Click</li>
                    <li><strong>Conversion Rate:</strong> ({'>'} 2%)</li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>

          {/* Results Tab */}
          {analysis && (
            <div className={activeTab === "results" ? "block" : "hidden"}>
              <div className="space-y-8">
                {/* Overall Score */}
                <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-lg mb-2">คะแนนประสิทธิภาพโฆษณา</p>
                      <h2 className="text-5xl font-bold">{analysis.score}/100</h2>
                    </div>
                    <div className="text-6xl font-bold opacity-20">{analysis.score >= 70 ? "✓" : "⚠"}</div>
                  </div>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">ROAS</p>
                    <h3 className="text-3xl font-bold text-green-600">{analysis.roas}x</h3>
                    <p className="text-xs text-muted-foreground mt-2">Return on Ad Spend</p>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">CTR</p>
                    <h3 className="text-3xl font-bold text-blue-600">{analysis.ctr}%</h3>
                    <p className="text-xs text-muted-foreground mt-2">Click-Through Rate</p>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">CPC</p>
                    <h3 className="text-3xl font-bold text-amber-600">฿{analysis.cpc}</h3>
                    <p className="text-xs text-muted-foreground mt-2">Cost Per Click</p>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">Conversion Rate</p>
                    <h3 className="text-3xl font-bold text-purple-600">{analysis.conversionRate}%</h3>
                    <p className="text-xs text-muted-foreground mt-2">Conversion Rate</p>
                  </Card>
                </div>

                {/* Compliance Issues */}
                {analysis.complianceIssues.length > 0 && (
                  <Card className="p-6 border-0 shadow-lg border-l-4 border-red-500 bg-red-50">
                    <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      ⚠️ ประเด็น Compliance
                    </h3>
                    <ul className="space-y-2">
                      {analysis.complianceIssues.map((issue, idx) => (
                        <li key={idx} className="text-red-800 text-sm">{issue}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    💡 คำแนะนำการปรับปรุง
                  </h3>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-foreground text-sm p-3 bg-blue-50 rounded-lg border border-blue-200">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap">
                  <Button 
                    onClick={() => {
                      analyzeBusinessHealth();
                      setActiveTab("business");
                    }}
                    className="flex-1 min-w-max bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    🏢 สุขภาพธุรกิจ
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("lookalike")}
                    className="flex-1 min-w-max bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    👥 Lookalike
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("history")}
                    className="flex-1 min-w-max bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    📊 ประวัติ
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("input")}
                    className="flex-1 min-w-max bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    วิเคราะห์อื่น
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Business Health Tab */}
          {businessHealth && (
            <div className={activeTab === "business" ? "block" : "hidden"}>
              <div className="space-y-8">
                {/* Overall Business Health Score */}
                <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-lg mb-2">🏢 คะแนนสุขภาพธุรกิจ</p>
                      <h2 className="text-5xl font-bold">{businessHealth.overallScore}/100</h2>
                      <p className="text-purple-100 text-sm mt-2">ตรวจสอบ 4 ด้าน: Audience, Promotion, Creative, System</p>
                    </div>
                    <div className="text-6xl font-bold opacity-20">{businessHealth.overallScore >= 70 ? "✓" : "⚠"}</div>
                  </div>
                </Card>

                {/* Health Scores */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">👥 Audience</p>
                    <h3 className="text-3xl font-bold text-blue-600">{businessHealth.audienceScore}</h3>
                    <p className="text-xs text-muted-foreground mt-2">กลุ่มเป้าหมาย</p>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">🎁 Promotion</p>
                    <h3 className="text-3xl font-bold text-green-600">{businessHealth.promotionScore}</h3>
                    <p className="text-xs text-muted-foreground mt-2">โปรโมชั่น/ราคา</p>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">🎨 Creative</p>
                    <h3 className="text-3xl font-bold text-amber-600">{businessHealth.creativeScore}</h3>
                    <p className="text-xs text-muted-foreground mt-2">สร้างสรรค์/ดีไซน์</p>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">⚙️ System</p>
                    <h3 className="text-3xl font-bold text-purple-600">{businessHealth.systemScore}</h3>
                    <p className="text-xs text-muted-foreground mt-2">ระบบการตลาด</p>
                  </Card>
                </div>

                {/* Issues */}
                {businessHealth.issues.length > 0 && (
                  <Card className="p-6 border-0 shadow-lg border-l-4 border-red-500 bg-red-50">
                    <h3 className="font-bold text-red-900 mb-4">🚨 ปัญหาที่พบ</h3>
                    <ul className="space-y-2">
                      {businessHealth.issues.map((issue, idx) => (
                        <li key={idx} className="text-red-800 text-sm">{issue}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Root Causes */}
                {businessHealth.rootCauses.length > 0 && (
                  <Card className="p-6 border-0 shadow-lg border-l-4 border-orange-500 bg-orange-50">
                    <h3 className="font-bold text-orange-900 mb-4">🔍 สาเหตุหลัก</h3>
                    <ul className="space-y-2">
                      {businessHealth.rootCauses.map((cause, idx) => (
                        <li key={idx} className="text-orange-800 text-sm">{cause}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Holistic Recommendations */}
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    💡 คำแนะนำการปรับปรุงโดยรวม
                  </h3>
                  <ul className="space-y-3">
                    {businessHealth.holisticRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-foreground text-sm p-3 bg-purple-50 rounded-lg border border-purple-200">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setActiveTab("results")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    ← กลับไปดูผลวิเคราะห์โฆษณา
                  </Button>
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 font-semibold py-3"
                  >
                    เริ่มวิเคราะห์ใหม่
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Lookalike Audience Tab */}
          <div className={activeTab === "lookalike" ? "block" : "hidden"}>
            <div className="space-y-8">
              <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-lg mb-2">👥 Lookalike Audience Generator</p>
                    <h2 className="text-3xl font-bold">สร้าง Audience ที่คล้ายลูกค้าของคุณ</h2>
                  </div>
                  <Users className="w-16 h-16 opacity-20" />
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-2">
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-6">เพิ่มข้อมูลลูกค้า</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold mb-2 block">ชื่อลูกค้า</Label>
                        <Input 
                          placeholder="เช่น สมชาย"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label className="font-semibold mb-2 block">อายุ</Label>
                        <Input 
                          type="number" 
                          placeholder="เช่น 35"
                          value={newCustomer.age || ""}
                          onChange={(e) => setNewCustomer({...newCustomer, age: parseInt(e.target.value) || 0})}
                        />
                      </div>

                      <div>
                        <Label className="font-semibold mb-2 block">ความสนใจ (คั่นด้วยจุลภาค)</Label>
                        <Input 
                          placeholder="เช่น สุขภาพ, ฟิตเนส, สมุนไพร"
                          value={newCustomer.interests}
                          onChange={(e) => setNewCustomer({...newCustomer, interests: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label className="font-semibold mb-2 block">ความถี่ในการซื้อ</Label>
                        <select 
                          value={newCustomer.purchaseFrequency}
                          onChange={(e) => setNewCustomer({...newCustomer, purchaseFrequency: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="monthly">รายเดือน</option>
                          <option value="quarterly">รายไตรมาส</option>
                          <option value="yearly">รายปี</option>
                          <option value="once">ครั้งเดียว</option>
                        </select>
                      </div>

                      <Button 
                        onClick={addLookalikeCustomer}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        เพิ่มลูกค้า
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Lookalike Profile */}
                <div>
                  {lookalikeCustomers.length > 0 && (() => {
                    const profile = generateLookalikeProfile();
                    if (!profile) return null;
                    return (
                      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
                        <h3 className="font-bold text-blue-900 mb-4">📊 Lookalike Profile</h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">ช่วงอายุ</p>
                            <p className="font-semibold text-blue-900">{profile.ageRange}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">ความสนใจหลัก</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {profile.interests.map((interest, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-200 text-blue-900 rounded-full text-xs">
                                  {interest.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">ความถี่ซื้อ</p>
                            <p className="font-semibold text-blue-900">{profile.purchaseFrequency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">จำนวนลูกค้าตัวอย่าง</p>
                            <p className="font-semibold text-blue-900">{profile.size} คน</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
              </div>

              {/* Customer List */}
              {lookalikeCustomers.length > 0 && (
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="font-bold text-blue-900 mb-4">ลูกค้าที่เพิ่มแล้ว ({lookalikeCustomers.length})</h3>
                  <div className="space-y-2">
                    {lookalikeCustomers.map((customer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <p className="font-semibold text-blue-900">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.age} ปี • {customer.interests}</p>
                        </div>
                        <Button 
                          onClick={() => removeLookalikeCustomer(idx)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => setActiveTab("input")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  ← กลับไปวิเคราะห์โฆษณา
                </Button>
              </div>
            </div>
          </div>

          {/* History Tab */}
          <div className={activeTab === "history" ? "block" : "hidden"}>
            <div className="space-y-8">
              <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-lg mb-2">📊 ประวัติการวิเคราะห์</p>
                    <h2 className="text-3xl font-bold">บันทึกการวิเคราะห์ {analysisHistory.length} รายการ</h2>
                  </div>
                </div>
              </Card>

              {analysisHistory.length === 0 ? (
                <Card className="p-8 border-0 shadow-lg text-center">
                  <p className="text-muted-foreground text-lg">ยังไม่มีประวัติการวิเคราะห์</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {analysisHistory.map((entry, idx) => (
                    <Card key={entry.id} className="p-6 border-0 shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString('th-TH', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <div className="mt-3 grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">ROAS</p>
                              <p className="font-bold text-green-600">{entry.analysis.roas}x</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">CTR</p>
                              <p className="font-bold text-blue-600">{entry.analysis.ctr}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">CPC</p>
                              <p className="font-bold text-amber-600">฿{entry.analysis.cpc}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className="font-bold text-purple-600">{entry.analysis.score}/100</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={exportToJSON}
                  disabled={analysisHistory.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 disabled:opacity-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  ส่งออก JSON
                </Button>
                <Button 
                  onClick={clearHistory}
                  disabled={analysisHistory.length === 0}
                  variant="outline"
                  className="flex-1 font-semibold py-3 disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  ลบประวัติ
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-100">
            Facebook Ads Analyzer สำหรับวิจิตรโอสถ | ระบบตรวจสอบและวิเคราะห์ประสิทธิภาพโฆษณา
          </p>
          <p className="text-blue-200 text-sm mt-2">
            © 2026 WIJITOSOT CO., LTD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
