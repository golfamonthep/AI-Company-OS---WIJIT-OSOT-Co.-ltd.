import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  BarChart3,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Brain,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  LineChart,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI วิเคราะห์โฆษณา",
    description: "วิเคราะห์ประสิทธิภาพโฆษณา Facebook ด้วย AI ได้รับคำแนะนำเชิงลึกเพื่อปรับปรุง ROAS, CTR และ Conversion Rate",
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/analyzer",
  },
  {
    icon: Sparkles,
    title: "สร้าง Ad Copy ด้วย AI",
    description: "สร้างข้อความโฆษณาที่น่าสนใจและตรงกลุ่มเป้าหมายด้วย AI ในไม่กี่วินาที พร้อม Headline, Body และ CTA",
    color: "text-purple-600",
    bg: "bg-purple-50",
    href: "/copy-generator",
  },
  {
    icon: Shield,
    title: "ตรวจสอบ Compliance",
    description: "ตรวจสอบข้อความโฆษณาว่าสอดคล้องกับนโยบาย Facebook Ads หรือไม่ ป้องกันการถูก Reject ก่อนยิงโฆษณา",
    color: "text-green-600",
    bg: "bg-green-50",
    href: "/analyzer",
  },
  {
    icon: TrendingUp,
    title: "Business Health Check",
    description: "ตรวจสุขภาพธุรกิจแบบองค์รวม 4 มิติ: Audience, Promotion, Creative, System พร้อมแผนปรับปรุง",
    color: "text-orange-600",
    bg: "bg-orange-50",
    href: "/health-check",
  },
  {
    icon: Zap,
    title: "A/B Test Analyzer",
    description: "เปรียบเทียบประสิทธิภาพ Creative A vs B อย่างแม่นยำ ตัดสินใจได้ว่า Creative ไหนควรลงทุนต่อ",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    href: "/analyzer",
  },
  {
    icon: Users,
    title: "Audience Insights",
    description: "วิเคราะห์กลุ่มเป้าหมาย สร้าง Lookalike Audience Profile และแบ่ง Segment เพื่อ Targeting ที่แม่นยำ",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    href: "/analyzer",
  },
  {
    icon: LayoutDashboard,
    title: "Ads Dashboard (Meta API)",
    description: "ดูข้อมูล Spend, Impressions, Clicks, CTR, CPC, CPA, ROAS แบบ Real-time จาก Meta API พร้อมกราฟย้อนหลัง 7/30 วัน",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    href: "/dashboard",
  },
];

const stats = [
  { label: "เมตริกที่วิเคราะห์", value: "10+", icon: BarChart3 },
  { label: "ฟีเจอร์ AI", value: "6", icon: Brain },
  { label: "ประหยัดเวลา", value: "80%", icon: TrendingUp },
  { label: "ความแม่นยำ", value: "95%", icon: Target },
];

const benefits = [
  "วิเคราะห์ ROAS, CTR, CPC, Conversion Rate อัตโนมัติ",
  "AI ให้คำแนะนำเฉพาะสำหรับสินค้าของคุณ",
  "ตรวจสอบ Compliance กับนโยบาย Facebook",
  "สร้าง Ad Copy คุณภาพสูงในไม่กี่วินาที",
  "บันทึกประวัติการวิเคราะห์ทั้งหมด",
  "รองรับภาษาไทยอย่างสมบูรณ์",
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <LineChart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg text-foreground leading-none block">AI Ads Guide</span>
                <span className="text-xs text-muted-foreground leading-none">Facebook Ads Analyzer</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/analyzer">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  วิเคราะห์โฆษณา
                </Button>
              </Link>
              <Link href="/copy-generator">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  สร้าง Ad Copy
                </Button>
              </Link>
              <Link href="/health-check">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Health Check
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Button>
              </Link>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    สวัสดี, {user?.name || "ผู้ใช้"}
                  </span>
                  <Link href="/analyzer">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      เริ่มวิเคราะห์
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    เข้าสู่ระบบ
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent" />
              ขับเคลื่อนด้วย AI
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              วิเคราะห์โฆษณา Facebook
              <br />
              <span className="gradient-text">ด้วย AI อัจฉริยะ</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              เครื่องมือ AI สำหรับนักการตลาดไทย วิเคราะห์ประสิทธิภาพโฆษณา สร้าง Ad Copy
              และตรวจสอบ Compliance ในที่เดียว
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/analyzer">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 px-8">
                    <Brain className="w-5 h-5 mr-2" />
                    เริ่มวิเคราะห์โฆษณา
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 px-8">
                    <Brain className="w-5 h-5 mr-2" />
                    เริ่มใช้งานฟรี
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              )}
              <Link href="/analyzer">
                <Button size="lg" variant="outline" className="px-8 bg-background">
                  ดูตัวอย่างการใช้งาน
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ฟีเจอร์ครบครัน สำหรับ Facebook Ads
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              ทุกเครื่องมือที่คุณต้องการเพื่อเพิ่มประสิทธิภาพโฆษณา Facebook ในที่เดียว
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="p-6 border border-border hover:border-primary/30 card-hover cursor-pointer h-full">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                ทำไมต้องใช้ AI Ads Guide?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                ประหยัดเวลาวิเคราะห์ข้อมูลด้วย AI ที่เข้าใจบริบทธุรกิจไทย
                ได้รับคำแนะนำที่นำไปปฏิบัติได้จริงทันที
              </p>
              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="p-6 border border-border shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">ผลวิเคราะห์โฆษณา</div>
                    <div className="text-xs text-muted-foreground">สมุนไพรบำรุงสุขภาพ</div>
                  </div>
                  <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">85/100</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "ROAS", value: "3.2x", color: "text-green-600" },
                    { label: "CTR", value: "2.8%", color: "text-blue-600" },
                    { label: "CPC", value: "฿12.50", color: "text-orange-600" },
                    { label: "Conv. Rate", value: "4.2%", color: "text-purple-600" },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                      <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground mb-2">คำแนะนำ AI</div>
                  {[
                    "✅ ROAS ดีเยี่ยม - พิจารณาเพิ่ม Budget",
                    "💡 ลอง Lookalike Audience จากลูกค้าเดิม",
                    "🎯 ทดสอบ Video Ad เพื่อเพิ่ม CTR",
                  ].map((rec) => (
                    <div key={rec} className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
                      {rec}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-primary rounded-2xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                  พร้อมเพิ่มประสิทธิภาพโฆษณาแล้วหรือยัง?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-8">
                  เริ่มวิเคราะห์โฆษณา Facebook ของคุณด้วย AI วันนี้ ฟรี!
                </p>
                {isAuthenticated ? (
                  <Link href="/analyzer">
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 shadow-lg">
                      เริ่มวิเคราะห์เลย
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 shadow-lg">
                      เริ่มใช้งานฟรี
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <LineChart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">AI Facebook Ads Guide</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 AI Ads Guide. สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
