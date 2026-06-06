import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, TrendingUp, AlertTriangle, BarChart3, Lightbulb, Building2, Users, Download, Trash2, Plus, Zap, TrendingDown } from "lucide-react";


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

interface ABTestData {
  nameA: string;
  nameB: string;
  budgetA: number;
  impressionsA: number;
  clicksA: number;
  conversionsA: number;
  revenueA: number;
  budgetB: number;
  impressionsB: number;
  clicksB: number;
  conversionsB: number;
  revenueB: number;
}

interface BudgetOptimizationData {
  currentBudget: number;
  currentRoas: number;
  targetRoas: number;
  estimatedImpressions: number;
}

interface AudienceSegment {
  name: string;
  size: number;
  ageRange: string;
  interests: string;
  purchaseFrequency: string;
}

interface PerformanceData {
  date: string;
  roas: number;
  ctr: number;
  cpc: number;
  conversions: number;
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

  const [abTestData, setABTestData] = useState<ABTestData>({
    nameA: "Creative A",
    nameB: "Creative B",
    budgetA: 0, impressionsA: 0, clicksA: 0, conversionsA: 0, revenueA: 0,
    budgetB: 0, impressionsB: 0, clicksB: 0, conversionsB: 0, revenueB: 0
  });

  const [budgetOptData, setBudgetOptData] = useState<BudgetOptimizationData>({
    currentBudget: 0,
    currentRoas: 0,
    targetRoas: 0,
    estimatedImpressions: 0
  });

  const [abTestResult, setABTestResult] = useState<any>(null);
  const [budgetOptResult, setBudgetOptResult] = useState<any>(null);

  const [audiences, setAudiences] = useState<AudienceSegment[]>([]);
  const [newAudience, setNewAudience] = useState<AudienceSegment>({
    name: "",
    size: 0,
    ageRange: "18-35",
    interests: "",
    purchaseFrequency: "monthly"
  });

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([
    { date: "Day 1", roas: 2.1, ctr: 1.8, cpc: 12, conversions: 5 },
    { date: "Day 2", roas: 2.3, ctr: 1.9, cpc: 11, conversions: 7 },
    { date: "Day 3", roas: 2.5, ctr: 2.1, cpc: 10, conversions: 9 },
    { date: "Day 4", roas: 2.4, ctr: 2.0, cpc: 10.5, conversions: 8 },
    { date: "Day 5", roas: 2.8, ctr: 2.3, cpc: 9, conversions: 11 },
    { date: "Day 6", roas: 3.0, ctr: 2.4, cpc: 8.5, conversions: 13 },
    { date: "Day 7", roas: 3.2, ctr: 2.5, cpc: 8, conversions: 15 }
  ]);

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

  const addAudience = () => {
    if (!newAudience.name || newAudience.size === 0) {
      alert("กรุณากรอกชื่อและขนาด Audience");
      return;
    }
    setAudiences([...audiences, newAudience]);
    setNewAudience({
      name: "",
      size: 0,
      ageRange: "18-35",
      interests: "",
      purchaseFrequency: "monthly"
    });
  };

  const removeAudience = (index: number) => {
    setAudiences(audiences.filter((_, i) => i !== index));
  };

  const analyzeABTest = () => {
    if (abTestData.budgetA === 0 || abTestData.budgetB === 0) {
      alert("กรุณากรอกข้อมูล Budget สำหรับทั้ง A และ B");
      return;
    }

    const roasA = abTestData.revenueA / abTestData.budgetA;
    const roasB = abTestData.revenueB / abTestData.budgetB;
    const ctrA = (abTestData.clicksA / abTestData.impressionsA) * 100 || 0;
    const ctrB = (abTestData.clicksB / abTestData.impressionsB) * 100 || 0;
    const cpcA = abTestData.budgetA / abTestData.clicksA || 0;
    const cpcB = abTestData.budgetB / abTestData.clicksB || 0;
    const convRateA = (abTestData.conversionsA / abTestData.clicksA) * 100 || 0;
    const convRateB = (abTestData.conversionsB / abTestData.clicksB) * 100 || 0;

    const winner = roasA > roasB ? "A" : roasB > roasA ? "B" : "Draw";
    const roasDiff = Math.abs(roasA - roasB);
    const roasDiffPercent = ((roasDiff / Math.min(roasA, roasB)) * 100).toFixed(1);

    setABTestResult({
      winner,
      roasA: Math.round(roasA * 100) / 100,
      roasB: Math.round(roasB * 100) / 100,
      roasDiffPercent,
      ctrA: Math.round(ctrA * 100) / 100,
      ctrB: Math.round(ctrB * 100) / 100,
      cpcA: Math.round(cpcA * 100) / 100,
      cpcB: Math.round(cpcB * 100) / 100,
      convRateA: Math.round(convRateA * 100) / 100,
      convRateB: Math.round(convRateB * 100) / 100
    });
    setActiveTab("abtest-result");
  };

  const optimizeBudget = () => {
    if (budgetOptData.currentBudget === 0 || budgetOptData.currentRoas === 0 || budgetOptData.targetRoas === 0) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const budgetMultiplier = budgetOptData.targetRoas / budgetOptData.currentRoas;
    const recommendedBudget = budgetOptData.currentBudget * budgetMultiplier;
    const budgetIncrease = recommendedBudget - budgetOptData.currentBudget;
    const estimatedRevenue = recommendedBudget * budgetOptData.targetRoas;
    const estimatedProfit = estimatedRevenue - recommendedBudget;

    setBudgetOptResult({
      currentBudget: budgetOptData.currentBudget,
      currentRoas: budgetOptData.currentRoas,
      targetRoas: budgetOptData.targetRoas,
      recommendedBudget: Math.round(recommendedBudget * 100) / 100,
      budgetIncrease: Math.round(budgetIncrease * 100) / 100,
      estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
      estimatedProfit: Math.round(estimatedProfit * 100) / 100,
      roi: Math.round(((estimatedRevenue - recommendedBudget) / recommendedBudget) * 100)
    });
    setActiveTab("budget-result");
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
                    onClick={() => setActiveTab("abtest")}
                    className="flex-1 min-w-max bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    ⚡ A/B Test
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("budget")}
                    className="flex-1 min-w-max bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    💰 Budget
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("audience")}
                    className="flex-1 min-w-max bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    👤 Audience
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("dashboard")}
                    className="flex-1 min-w-max bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    📈 Dashboard
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

          {/* A/B Testing Tab */}
          <div className={activeTab === "abtest" ? "block" : "hidden"}>
            <div className="space-y-8">
              <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-lg mb-2">⚡ A/B Testing Analyzer</p>
                    <h2 className="text-3xl font-bold">เปรียบเทียบประสิทธิภาพ Creative A vs B</h2>
                  </div>
                  <Zap className="w-16 h-16 opacity-20" />
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Creative A */}
                <Card className="p-6 border-0 shadow-lg border-l-4 border-indigo-500">
                  <h3 className="text-xl font-bold text-indigo-900 mb-6">Creative A</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold mb-2 block">ชื่อ</Label>
                      <Input value={abTestData.nameA} onChange={(e) => setABTestData({...abTestData, nameA: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold mb-2 block">Budget (฿)</Label>
                        <Input type="number" value={abTestData.budgetA || ""} onChange={(e) => setABTestData({...abTestData, budgetA: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div>
                        <Label className="font-semibold mb-2 block">Impressions</Label>
                        <Input type="number" value={abTestData.impressionsA || ""} onChange={(e) => setABTestData({...abTestData, impressionsA: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold mb-2 block">Clicks</Label>
                        <Input type="number" value={abTestData.clicksA || ""} onChange={(e) => setABTestData({...abTestData, clicksA: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div>
                        <Label className="font-semibold mb-2 block">Conversions</Label>
                        <Input type="number" value={abTestData.conversionsA || ""} onChange={(e) => setABTestData({...abTestData, conversionsA: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold mb-2 block">Revenue (฿)</Label>
                      <Input type="number" value={abTestData.revenueA || ""} onChange={(e) => setABTestData({...abTestData, revenueA: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                </Card>

                {/* Creative B */}
                <Card className="p-6 border-0 shadow-lg border-l-4 border-purple-500">
                  <h3 className="text-xl font-bold text-purple-900 mb-6">Creative B</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold mb-2 block">ชื่อ</Label>
                      <Input value={abTestData.nameB} onChange={(e) => setABTestData({...abTestData, nameB: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold mb-2 block">Budget (฿)</Label>
                        <Input type="number" value={abTestData.budgetB || ""} onChange={(e) => setABTestData({...abTestData, budgetB: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div>
                        <Label className="font-semibold mb-2 block">Impressions</Label>
                        <Input type="number" value={abTestData.impressionsB || ""} onChange={(e) => setABTestData({...abTestData, impressionsB: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold mb-2 block">Clicks</Label>
                        <Input type="number" value={abTestData.clicksB || ""} onChange={(e) => setABTestData({...abTestData, clicksB: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div>
                        <Label className="font-semibold mb-2 block">Conversions</Label>
                        <Input type="number" value={abTestData.conversionsB || ""} onChange={(e) => setABTestData({...abTestData, conversionsB: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold mb-2 block">Revenue (฿)</Label>
                      <Input type="number" value={abTestData.revenueB || ""} onChange={(e) => setABTestData({...abTestData, revenueB: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button onClick={analyzeABTest} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3">
                  <Zap className="w-5 h-5 mr-2" />
                  เปรียบเทียบ A vs B
                </Button>
                <Button onClick={() => setActiveTab("input")} variant="outline" className="flex-1 font-semibold py-3">
                  ← กลับ
                </Button>
              </div>
            </div>
          </div>

          {/* A/B Test Result Tab */}
          {abTestResult && (
            <div className={activeTab === "abtest-result" ? "block" : "hidden"}>
              <div className="space-y-8">
                <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-lg mb-2">🏆 ผลการเปรียบเทียบ</p>
                      <h2 className="text-3xl font-bold">Creative {abTestResult.winner} ชนะ! ({abTestResult.roasDiffPercent}% ดีกว่า)</h2>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Creative A Results */}
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="text-xl font-bold text-indigo-900 mb-6">{abTestData.nameA}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                        <span className="text-muted-foreground">ROAS</span>
                        <span className="font-bold text-indigo-900">{abTestResult.roasA}x</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-muted-foreground">CTR</span>
                        <span className="font-bold text-blue-900">{abTestResult.ctrA}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <span className="text-muted-foreground">CPC</span>
                        <span className="font-bold text-amber-900">฿{abTestResult.cpcA}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-muted-foreground">Conversion Rate</span>
                        <span className="font-bold text-purple-900">{abTestResult.convRateA}%</span>
                      </div>
                    </div>
                  </Card>

                  {/* Creative B Results */}
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="text-xl font-bold text-purple-900 mb-6">{abTestData.nameB}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-muted-foreground">ROAS</span>
                        <span className="font-bold text-purple-900">{abTestResult.roasB}x</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-muted-foreground">CTR</span>
                        <span className="font-bold text-blue-900">{abTestResult.ctrB}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <span className="text-muted-foreground">CPC</span>
                        <span className="font-bold text-amber-900">฿{abTestResult.cpcB}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-muted-foreground">Conversion Rate</span>
                        <span className="font-bold text-purple-900">{abTestResult.convRateB}%</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recommendation */}
                <Card className="p-6 border-0 shadow-lg bg-green-50 border-l-4 border-green-500">
                  <h3 className="font-bold text-green-900 mb-4">✅ คำแนะนำ</h3>
                  <ul className="space-y-2 text-green-800 text-sm">
                    <li>• ใช้ Creative {abTestResult.winner} เพราะมี ROAS สูงกว่า {abTestResult.roasDiffPercent}%</li>
                    <li>• หากต้องการ Scale ให้เพิ่ม Budget ของ Creative {abTestResult.winner}</li>
                    <li>• ศึกษา Creative {abTestResult.winner} เพื่อนำไปปรับปรุง Creative อื่นๆ</li>
                  </ul>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button onClick={() => setActiveTab("abtest")} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3">
                    ← ทดสอบอีกครั้ง
                  </Button>
                  <Button onClick={() => setActiveTab("input")} variant="outline" className="flex-1 font-semibold py-3">
                    วิเคราะห์โฆษณาใหม่
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Budget Optimizer Tab */}
          <div className={activeTab === "budget" ? "block" : "hidden"}>
            <div className="space-y-8">
              <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-lg mb-2">💰 Campaign Budget Optimizer</p>
                    <h2 className="text-3xl font-bold">คำนวณ Budget ที่เหมาะสมเพื่อบรรลุเป้าหมาย</h2>
                  </div>
                  <TrendingUp className="w-16 h-16 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-orange-900 mb-6">ข้อมูลปัจจุบัน</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="font-semibold mb-2 block">Budget ปัจจุบัน (฿)</Label>
                    <Input type="number" placeholder="เช่น 5000" value={budgetOptData.currentBudget || ""} onChange={(e) => setBudgetOptData({...budgetOptData, currentBudget: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">ROAS ปัจจุบัน</Label>
                    <Input type="number" placeholder="เช่น 2.5" step="0.1" value={budgetOptData.currentRoas || ""} onChange={(e) => setBudgetOptData({...budgetOptData, currentRoas: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">เป้าหมาย ROAS</Label>
                    <Input type="number" placeholder="เช่น 3.5" step="0.1" value={budgetOptData.targetRoas || ""} onChange={(e) => setBudgetOptData({...budgetOptData, targetRoas: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button onClick={optimizeBudget} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  คำนวณ Budget ที่เหมาะสม
                </Button>
                <Button onClick={() => setActiveTab("input")} variant="outline" className="flex-1 font-semibold py-3">
                  ← กลับ
                </Button>
              </div>
            </div>
          </div>

          {/* Budget Optimizer Result Tab */}
          {budgetOptResult && (
            <div className={activeTab === "budget-result" ? "block" : "hidden"}>
              <div className="space-y-8">
                <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-orange-600 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-lg mb-2">📊 ผลการคำนวณ</p>
                      <h2 className="text-3xl font-bold">Budget ที่แนะนำ: ฿{budgetOptResult.recommendedBudget}</h2>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Current vs Recommended */}
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="font-bold text-orange-900 mb-6">📈 เปรียบเทียบ</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-muted-foreground">Budget ปัจจุบัน</span>
                        <span className="font-bold text-orange-900">฿{budgetOptResult.currentBudget}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-muted-foreground">Budget ที่แนะนำ</span>
                        <span className="font-bold text-green-900">฿{budgetOptResult.recommendedBudget}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-muted-foreground">เพิ่ม Budget</span>
                        <span className="font-bold text-blue-900">฿{budgetOptResult.budgetIncrease}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Projected Results */}
                  <Card className="p-6 border-0 shadow-lg">
                    <h3 className="font-bold text-orange-900 mb-6">🎯 ผลลัพธ์ที่คาดการณ์</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-muted-foreground">รายได้ที่คาดการณ์</span>
                        <span className="font-bold text-purple-900">฿{budgetOptResult.estimatedRevenue}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-muted-foreground">กำไรที่คาดการณ์</span>
                        <span className="font-bold text-green-900">฿{budgetOptResult.estimatedProfit}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <span className="text-muted-foreground">ROI</span>
                        <span className="font-bold text-amber-900">{budgetOptResult.roi}%</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recommendation */}
                <Card className="p-6 border-0 shadow-lg bg-green-50 border-l-4 border-green-500">
                  <h3 className="font-bold text-green-900 mb-4">✅ คำแนะนำ</h3>
                  <ul className="space-y-2 text-green-800 text-sm">
                    <li>• เพิ่ม Budget จาก ฿{budgetOptResult.currentBudget} เป็น ฿{budgetOptResult.recommendedBudget}</li>
                    <li>• คาดว่าจะได้รายได้ ฿{budgetOptResult.estimatedRevenue} และกำไร ฿{budgetOptResult.estimatedProfit}</li>
                    <li>• ROI ที่คาดการณ์ {budgetOptResult.roi}% - ลงทุนคุ้มค่า</li>
                  </ul>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button onClick={() => setActiveTab("budget")} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3">
                    ← คำนวณอีกครั้ง
                  </Button>
                  <Button onClick={() => setActiveTab("input")} variant="outline" className="flex-1 font-semibold py-3">
                    วิเคราะห์โฆษณาใหม่
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Audience Segmentation Tab */}
          <div className={activeTab === "audience" ? "block" : "hidden"}>
            <div className="space-y-8">
              <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100 text-lg mb-2">👤 Audience Segmentation Tool</p>
                    <h2 className="text-3xl font-bold">แบ่ง Audience เพื่อ Target ที่แม่นยำ</h2>
                  </div>
                  <Users className="w-16 h-16 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-rose-900 mb-6">สร้าง Audience Segment ใหม่</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold mb-2 block">ชื่อ Audience</Label>
                    <Input placeholder="เช่น Women 25-35" value={newAudience.name} onChange={(e) => setNewAudience({...newAudience, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold mb-2 block">ขนาด Audience</Label>
                      <Input type="number" placeholder="เช่น 50000" value={newAudience.size || ""} onChange={(e) => setNewAudience({...newAudience, size: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div>
                      <Label className="font-semibold mb-2 block">ช่วงอายุ</Label>
                      <select value={newAudience.ageRange} onChange={(e) => setNewAudience({...newAudience, ageRange: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md">
                        <option>18-25</option>
                        <option>25-35</option>
                        <option>35-45</option>
                        <option>45-55</option>
                        <option>55+</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">ความสนใจ</Label>
                    <Input placeholder="เช่น สุขภาพ, สมุนไพร" value={newAudience.interests} onChange={(e) => setNewAudience({...newAudience, interests: e.target.value})} />
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">ความถี่ซื้อ</Label>
                    <select value={newAudience.purchaseFrequency} onChange={(e) => setNewAudience({...newAudience, purchaseFrequency: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md">
                      <option value="monthly">รายเดือน</option>
                      <option value="quarterly">รายไตรมาส</option>
                      <option value="yearly">รายปี</option>
                      <option value="occasional">บางครั้ง</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Button onClick={addAudience} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3">
                <Plus className="w-5 h-5 mr-2" />
                เพิ่ม Audience Segment
              </Button>

              {audiences.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-rose-900">Audience Segments ({audiences.length})</h3>
                  {audiences.map((aud, idx) => (
                    <Card key={idx} className="p-6 border-0 shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-rose-900 mb-3">{aud.name}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">ขนาด</p>
                              <p className="font-semibold">{aud.size.toLocaleString()} คน</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">ช่วงอายุ</p>
                              <p className="font-semibold">{aud.ageRange} ปี</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">ความสนใจ</p>
                              <p className="font-semibold">{aud.interests}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">ความถี่ซื้อ</p>
                              <p className="font-semibold">{aud.purchaseFrequency === "monthly" ? "รายเดือน" : aud.purchaseFrequency === "quarterly" ? "รายไตรมาส" : aud.purchaseFrequency === "yearly" ? "รายปี" : "บางครั้ง"}</p>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => removeAudience(idx)} variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={() => setActiveTab("input")} variant="outline" className="flex-1 font-semibold py-3">
                  ← กลับ
                </Button>
              </div>
            </div>
          </div>

          {/* Performance Dashboard Tab */}
          <div className={activeTab === "dashboard" ? "block" : "hidden"}>
            <div className="space-y-8">
              <Card className="p-8 border-0 shadow-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-lg mb-2">📈 Campaign Performance Dashboard</p>
                    <h2 className="text-3xl font-bold">ติดตามประสิทธิภาพโฆษณาแบบ Real-Time</h2>
                  </div>
                  <BarChart3 className="w-16 h-16 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-teal-900 mb-6">แนวโน้ม ROAS (7 วัน)</h3>
                <div className="grid grid-cols-7 gap-2">
                  {performanceData.map((data, idx) => (
                    <div key={idx} className="text-center p-3 bg-teal-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">{data.date}</p>
                      <p className="font-bold text-teal-900 text-lg">{data.roas}x</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 border-0 shadow-lg">
                  <p className="text-muted-foreground text-sm mb-2">ROAS เฉลี่ย</p>
                  <h3 className="text-3xl font-bold text-teal-600">{(performanceData.reduce((a, b) => a + b.roas, 0) / performanceData.length).toFixed(2)}x</h3>
                  <p className="text-xs text-muted-foreground mt-2">Return on Ad Spend</p>
                </Card>
                <Card className="p-6 border-0 shadow-lg">
                  <p className="text-muted-foreground text-sm mb-2">CTR เฉลี่ย</p>
                  <h3 className="text-3xl font-bold text-cyan-600">{(performanceData.reduce((a, b) => a + b.ctr, 0) / performanceData.length).toFixed(2)}%</h3>
                  <p className="text-xs text-muted-foreground mt-2">Click-Through Rate</p>
                </Card>
                <Card className="p-6 border-0 shadow-lg">
                  <p className="text-muted-foreground text-sm mb-2">CPC เฉลี่ย</p>
                  <h3 className="text-3xl font-bold text-blue-600">฿{(performanceData.reduce((a, b) => a + b.cpc, 0) / performanceData.length).toFixed(1)}</h3>
                  <p className="text-xs text-muted-foreground mt-2">Cost Per Click</p>
                </Card>
              </div>

              <Card className="p-6 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-teal-900 mb-6">📊 สรุป 7 วัน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                    <span className="text-muted-foreground">Conversions ทั้งหมด</span>
                    <span className="font-bold text-teal-900">{performanceData.reduce((a, b) => a + b.conversions, 0)} conversions</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                    <span className="text-muted-foreground">ROAS สูงสุด</span>
                    <span className="font-bold text-cyan-900">{Math.max(...performanceData.map(d => d.roas))}x</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-muted-foreground">CPC ต่ำสุด</span>
                    <span className="font-bold text-blue-900">฿{Math.min(...performanceData.map(d => d.cpc))}</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button onClick={() => setActiveTab("input")} variant="outline" className="flex-1 font-semibold py-3">
                  ← กลับ
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
