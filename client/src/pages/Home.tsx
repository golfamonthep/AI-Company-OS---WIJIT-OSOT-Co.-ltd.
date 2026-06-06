import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, TrendingUp, AlertTriangle, BarChart3, Lightbulb } from "lucide-react";

/**
 * Design: Facebook Ads Performance Analyzer
 * - Deep Blue (#1e3a8a) for trust and analytics
 * - Vibrant Green (#10b981) for positive metrics
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
  const [activeTab, setActiveTab] = useState("input");

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

    setAnalysis({
      roas: Math.round(roas * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      complianceIssues,
      recommendations,
      score: Math.max(0, score)
    });

    setActiveTab("results");
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
                    <li>{'• '}กรอกข้อมูลจากโฆษณา Facebook ที่ยิงไปแล้ว</li>
                    <li>{'• '}ระบบจะวิเคราะห์ ROAS, CTR, Conversion Rate</li>
                    <li>{'• '}ตรวจสอบ Compliance กับนโยบาย Facebook</li>
                    <li>{'• '}ได้รับคำแนะนำการปรับปรุง</li>
                  </ul>
                </Card>

                <Card className="p-6 border-0 shadow-lg bg-green-50">
                  <h3 className="font-bold text-green-900 mb-4">เมตริกที่สำคัญ</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li><strong>ROAS:</strong> Return on Ad Spend (เป้า: {'>'} 2.5x)</li>
                    <li><strong>CTR:</strong> Click-Through Rate (เป้า: {'>'} 2%)</li>
                    <li><strong>CPC:</strong> Cost Per Click</li>
                    <li><strong>Conversion Rate:</strong> (เป้า: {'>'} 2%)</li>
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
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setActiveTab("input")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    วิเคราะห์โฆษณาอื่น
                  </Button>
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 font-semibold py-3"
                  >
                    เริ่มใหม่
                  </Button>
                </div>
              </div>
            </div>
          )}
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
