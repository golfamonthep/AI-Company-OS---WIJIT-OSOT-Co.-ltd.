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
  Sparkles,
  Copy,
  Loader2,
  ArrowLeft,
  History,
  Trash2,
  RefreshCw,
  CheckCircle2,
  LineChart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const tones = [
  { value: "professional", label: "มืออาชีพ" },
  { value: "friendly", label: "เป็นกันเอง" },
  { value: "urgent", label: "เร่งด่วน/ดึงดูด" },
  { value: "emotional", label: "อารมณ์/ความรู้สึก" },
  { value: "humorous", label: "ขำขัน/สนุก" },
];

const objectives = [
  { value: "sales", label: "กระตุ้นยอดขาย" },
  { value: "leads", label: "สร้าง Lead" },
  { value: "awareness", label: "สร้างการรับรู้แบรนด์" },
  { value: "traffic", label: "เพิ่มการเข้าชมเว็บ" },
  { value: "engagement", label: "เพิ่ม Engagement" },
];

interface GeneratedCopy {
  headline: string;
  body: string;
  cta: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("คัดลอกแล้ว!");
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs gap-1">
      {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "คัดลอกแล้ว" : "คัดลอก"}
    </Button>
  );
}

function AdCopyCard({ copy, index }: { copy: GeneratedCopy; index: number }) {
  const [expanded, setExpanded] = useState(true);

  const fullText = `Headline: ${copy.headline}\n\nBody:\n${copy.body}\n\nCTA: ${copy.cta}`;

  return (
    <Card className="border border-border overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {index + 1}
          </div>
          <span className="font-semibold text-foreground">{copy.headline}</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={fullText} />
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Body Text</span>
              <CopyButton text={copy.body} />
            </div>
            <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{copy.body}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2">CTA</span>
              <Badge className="bg-primary text-primary-foreground">{copy.cta}</Badge>
            </div>
            <CopyButton text={copy.cta} />
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdCopyGenerator() {
  const { isAuthenticated } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [copies, setCopies] = useState<GeneratedCopy[]>([]);

  const [form, setForm] = useState({
    productName: "",
    productDescription: "",
    targetAudience: "",
    tone: "friendly",
    objective: "sales",
    count: 3,
  });

  const generateMutation = trpc.adCopy.generate.useMutation({
    onSuccess: (data) => {
      setCopies(data.copies);
      toast.success(`สร้าง Ad Copy ${data.copies.length} ชุดสำเร็จ!`);
    },
    onError: (err) => {
      toast.error("เกิดข้อผิดพลาด: " + err.message);
    },
  });

  const historyQuery = trpc.adCopy.getHistory.useQuery(undefined, {
    enabled: isAuthenticated && showHistory,
  });

  const handleGenerate = () => {
    if (!form.productName) {
      toast.error("กรุณากรอกชื่อสินค้า");
      return;
    }
    generateMutation.mutate({
      productName: form.productName,
      productDescription: form.productDescription || undefined,
      targetAudience: form.targetAudience || undefined,
      tone: form.tone,
      objective: form.objective,
      count: form.count,
    });
  };

  const handleReset = () => {
    setForm({
      productName: "",
      productDescription: "",
      targetAudience: "",
      tone: "friendly",
      objective: "sales",
      count: 3,
    });
    setCopies([]);
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
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-foreground">Ad Copy Generator</span>
                  <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">สร้างข้อความโฆษณาด้วย AI</span>
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
          <div className="mb-8">
            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  ประวัติ Ad Copy
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>ปิด</Button>
              </div>

              {historyQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !historyQuery.data || historyQuery.data.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ยังไม่มีประวัติ Ad Copy</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {historyQuery.data.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground truncate">{item.productName}</span>
                          {item.tone && <Badge variant="outline" className="text-xs flex-shrink-0">{item.tone}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Array.isArray(item.generatedCopies) ? `${item.generatedCopies.length} ชุด` : ""}
                          {" · "}
                          {new Date(item.createdAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
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
                <Sparkles className="w-5 h-5 text-purple-600" />
                ข้อมูลสินค้า
              </h2>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">ชื่อสินค้า *</Label>
                  <Input
                    placeholder="เช่น สมุนไพรบำรุงข้อเข่า"
                    value={form.productName}
                    onChange={(e) => setForm(f => ({ ...f, productName: e.target.value }))}
                  />
                </div>

                {/* Product Description */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">รายละเอียดสินค้า</Label>
                  <Textarea
                    placeholder="เช่น ส่วนผสมจากธรรมชาติ 100%, ผ่านการรับรอง อย., ลดอาการปวดข้อ"
                    value={form.productDescription}
                    onChange={(e) => setForm(f => ({ ...f, productDescription: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">กลุ่มเป้าหมาย</Label>
                  <Input
                    placeholder="เช่น ผู้สูงอายุ 50-70 ปี มีปัญหาข้อเข่า"
                    value={form.targetAudience}
                    onChange={(e) => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                  />
                </div>

                {/* Tone */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">โทนการสื่อสาร</Label>
                  <Select value={form.tone} onValueChange={(v) => setForm(f => ({ ...f, tone: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Objective */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">วัตถุประสงค์</Label>
                  <Select value={form.objective} onValueChange={(v) => setForm(f => ({ ...f, objective: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {objectives.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Count */}
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">จำนวนชุด (1-5)</Label>
                  <Select value={String(form.count)} onValueChange={(v) => setForm(f => ({ ...f, count: parseInt(v) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} ชุด</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  {isAuthenticated ? (
                    <Button
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          กำลังสร้าง...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          สร้าง Ad Copy
                        </>
                      )}
                    </Button>
                  ) : (
                    <a href={getLoginUrl()} className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        เข้าสู่ระบบเพื่อสร้าง
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" onClick={handleReset} size="icon">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            {copies.length === 0 && !generateMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">สร้าง Ad Copy ด้วย AI</h3>
                <p className="text-muted-foreground max-w-sm">
                  กรอกข้อมูลสินค้าในฟอร์มทางซ้าย แล้วกด "สร้าง Ad Copy" เพื่อรับข้อความโฆษณาคุณภาพสูง
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 w-full max-w-sm">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>ปฏิบัติตามนโยบาย Facebook Ads</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>ภาษาไทยที่เข้าใจง่าย น่าสนใจ</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>สร้างหลายชุดเพื่อ A/B Testing</span>
                  </div>
                </div>
              </div>
            )}

            {generateMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI กำลังสร้าง Ad Copy...</h3>
                <p className="text-muted-foreground">กรุณารอสักครู่</p>
              </div>
            )}

            {copies.length > 0 && !generateMutation.isPending && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Ad Copy {copies.length} ชุด
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    สร้างใหม่
                  </Button>
                </div>

                {copies.map((copy, i) => (
                  <AdCopyCard key={i} copy={copy} index={i} />
                ))}

                {/* Copy All Button */}
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  onClick={() => {
                    const fullText = copies.map((c, i) =>
                      `=== ชุดที่ ${i + 1} ===\nHeadline: ${c.headline}\nBody: ${c.body}\nCTA: ${c.cta}`
                    ).join('\n\n');
                    navigator.clipboard.writeText(fullText);
                    toast.success("คัดลอก Ad Copy ทั้งหมดแล้ว!");
                  }}
                >
                  <Copy className="w-4 h-4" />
                  คัดลอกทั้งหมด ({copies.length} ชุด)
                </Button>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link href="/analyzer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <LineChart className="w-4 h-4" />
                      วิเคราะห์โฆษณา
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
