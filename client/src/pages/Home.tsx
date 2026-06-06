import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Zap, TrendingUp, Users, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Design: Modern Performance Dashboard Aesthetic
 * - Navy Blue (#1a2a4a) for trust and professionalism
 * - Teal (#00d9ff) for energy and innovation
 * - Asymmetric layouts with data-driven visuals
 * - Smooth scroll-triggered animations
 */

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border transition-all duration-300" style={{
        boxShadow: isScrolled ? "0 4px 12px rgba(26, 42, 74, 0.1)" : "none"
      }}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a2a4a] to-[#00d9ff] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg text-[#1a2a4a]">Facebook Ads Guide</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-sm font-medium text-foreground hover:text-[#00d9ff] transition-colors">คอร์ส</a>
            <a href="#benefits" className="text-sm font-medium text-foreground hover:text-[#00d9ff] transition-colors">ประโยชน์</a>
            <a href="#contact" className="text-sm font-medium text-foreground hover:text-[#00d9ff] transition-colors">ติดต่อ</a>
          </nav>
          <Button className="bg-[#1a2a4a] hover:bg-[#0f1a2e] text-white">เริ่มเรียน</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
          backgroundImage: "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/9QoJ5Cubkj26oTDQZSjwZJ/hero-bg-LDv2sQQsZenjWZUiDNMMkn.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "opacity(0.3)"
        }} />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-[#00d9ff]/10 text-[#1a2a4a] text-sm font-semibold">
                  ✨ ยิงโฆษณา Facebook Ads ด้วย AI
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1a2a4a] leading-tight">
                ยิงแอด<br />
                <span className="text-[#00d9ff]">แบบเต็มระบบ</span>
              </h1>
              
              <p className="text-lg text-foreground max-w-lg">
                เรียนรู้เทคนิคการยิงโฆษณา Facebook Ads ด้วย AI ตั้งแต่พื้นฐาน ไปจนถึงการเพิ่มประสิทธิภาพและกำไรสูง
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-[#1a2a4a] hover:bg-[#0f1a2e] text-white gap-2">
                  เริ่มเรียนฟรี <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-[#1a2a4a] text-[#1a2a4a] hover:bg-[#1a2a4a]/5">
                  ดูรายละเอียด
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-8 border-t border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00d9ff]" />
                  <span className="text-sm text-muted-foreground">500+ นักเรียน</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00d9ff]" />
                  <span className="text-sm text-muted-foreground">ROAS 3.1x</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-full flex items-center justify-center animate-fade-in-delay">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/9QoJ5Cubkj26oTDQZSjwZJ/course-module-illustration-5HRKe78qsTAccNafZ3k5q7.webp"
                alt="AI Facebook Ads Optimization"
                className="w-full max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ROAS Improvement Section */}
      <section className="py-20 bg-gradient-to-b from-[#f5f7fa] to-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1a2a4a] mb-4">ผลลัพธ์ที่พิสูจน์แล้ว</h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              ผู้เรียนของเราได้ประสบความสำเร็จในการเพิ่ม ROAS และลดต้นทุนโฆษณา
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#1a2a4a]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROAS เฉลี่ย</p>
                  <p className="text-3xl font-bold text-[#1a2a4a]">3.1x</p>
                </div>
              </div>
              <p className="text-sm text-foreground">เพิ่มขึ้น 212% เทียบกับช่วงก่อนหน้า</p>
            </Card>

            <Card className="p-8 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#1a2a4a]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">รายได้เพิ่มขึ้น</p>
                  <p className="text-3xl font-bold text-[#1a2a4a]">2.47M</p>
                </div>
              </div>
              <p className="text-sm text-foreground">เพิ่มขึ้น 186% เทียบกับช่วงก่อนหน้า</p>
            </Card>

            <Card className="p-8 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#1a2a4a]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ค่า Conversion</p>
                  <p className="text-3xl font-bold text-[#1a2a4a]">2.8x</p>
                </div>
              </div>
              <p className="text-sm text-foreground">เพิ่มขึ้น 164% เทียบกับช่วงก่อนหน้า</p>
            </Card>
          </div>

          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/9QoJ5Cubkj26oTDQZSjwZJ/roas-improvement-visual-fuKQFofgdE46i8UhoaHbMq.webp"
              alt="ROAS Performance Chart"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Course Content Section */}
      <section id="courses" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1a2a4a] mb-4">เนื้อหาคอร์สที่สอน</h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              เรียนรู้เทคนิกและกลยุทธ์ที่ใช้ได้จริงจากประสบการณ์จริง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "การเลือกกลุ่มเป้าหมายด้วย AI",
                description: "ใช้ AI เพื่อวิเคราะห์และเลือกกลุ่มเป้าหมายที่เหมาะสมที่สุด",
                icon: "🎯"
              },
              {
                title: "สร้าง Lead ด้วย AI Automation",
                description: "อัตโนมัติการสร้างรายชื่อลูกค้าและการติดตามผลด้วย AI",
                icon: "🤖"
              },
              {
                title: "สร้าง Content ด้วย AI",
                description: "ใช้ AI สร้างคอนเทนต์โฆษณาที่매력และมีประสิทธิภาพ",
                icon: "✍️"
              },
              {
                title: "Optimize & Scale Ads",
                description: "เทคนิคการปรับปรุงและขยายแคมเปญโฆษณาอย่างมีประสิทธิภาพ",
                icon: "📈"
              },
              {
                title: "วิเคราะห์คู่แข่ง",
                description: "ใช้ Data Scraper วิเคราะห์กลยุทธ์ของคู่แข่ง",
                icon: "🔍"
              },
              {
                title: "การอ่าน Report & Optimize",
                description: "วิเคราะห์รีพอร์ตและปรับปรุงโฆษณาด้วย AI",
                icon: "📊"
              }
            ].map((course, idx) => (
              <Card key={idx} className="p-8 border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{course.icon}</div>
                <h3 className="text-xl font-bold text-[#1a2a4a] mb-3">{course.title}</h3>
                <p className="text-foreground text-sm">{course.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-[#f5f7fa]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-[#1a2a4a]">ทำไมต้องเลือกคอร์สนี้</h2>
              
              {[
                {
                  title: "เรียนจากประสบการณ์จริง",
                  desc: "สอนจากการทำงานจริงและเทคนิคที่ผ่านการทดสอบแล้ว"
                },
                {
                  title: "เนื้อหาเข้มข้น ใช้ได้ทันที",
                  desc: "เนื้อหาใหม่ 100% ที่สามารถนำไปใช้ได้ในทันที"
                },
                {
                  title: "AI Tools ให้กลับบ้านไปใช้",
                  desc: "ได้รับ AI Tools พิเศษที่สามารถใช้ได้ในการทำงาน"
                },
                {
                  title: "กลุ่มสำหรับถาม-ตอบ",
                  desc: "มีกลุ่มสำหรับติดต่อและถามคำถามหลังเรียนจบ"
                }
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#00d9ff] mt-1" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a2a4a] mb-1">{benefit.title}</h3>
                    <p className="text-foreground text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/9QoJ5Cubkj26oTDQZSjwZJ/ai-automation-icon-2F3ke3ibaLGCwwLTSqGprY.webp"
                alt="AI Automation Workflow"
                className="w-full drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-[#1a2a4a] to-[#0f1a2e] text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-4xl font-bold">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            เข้าร่วมคอร์สและเรียนรู้วิธีการยิงโฆษณา Facebook Ads ด้วย AI อย่างมีประสิทธิภาพ
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="bg-[#00d9ff] hover:bg-[#00c0e0] text-[#1a2a4a] font-bold">
              เริ่มเรียนฟรี
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              ติดต่อเราก่อน
            </Button>
          </div>

          <p className="text-sm text-blue-200 pt-4">
            ✨ ฟรี! คอร์สออนไลน์ปรับพื้นฐานก่อนเรียน
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a2a4a] to-[#00d9ff] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="font-bold text-[#1a2a4a]">Facebook Ads Guide</span>
              </div>
              <p className="text-sm text-muted-foreground">เรียนรู้การยิงโฆษณา Facebook Ads ด้วย AI</p>
            </div>
            <div>
              <h4 className="font-bold text-[#1a2a4a] mb-4">คอร์ส</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#00d9ff]">เรียนสด</a></li>
                <li><a href="#" className="hover:text-[#00d9ff]">คอร์สออนไลน์</a></li>
                <li><a href="#" className="hover:text-[#00d9ff]">เนื้อหาขยาย</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#1a2a4a] mb-4">บริษัท</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#00d9ff]">เกี่ยวกับเรา</a></li>
                <li><a href="#" className="hover:text-[#00d9ff]">ติดต่อ</a></li>
                <li><a href="#" className="hover:text-[#00d9ff]">บล็อก</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#1a2a4a] mb-4">ติดต่อ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Line: @maxideastudio</li>
                <li><a href="mailto:info@maxideastudio.com" className="hover:text-[#00d9ff]">Email</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 AI Facebook Ads Guide. สงวนลิขสิทธิ์
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}
