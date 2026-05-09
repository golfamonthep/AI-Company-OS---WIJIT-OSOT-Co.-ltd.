"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, Play, RefreshCw, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type QualityCriterion =
  | "hookStrength"
  | "emotionalImpact"
  | "thaiNaturalness"
  | "retentionPotential"
  | "ctaEffectiveness"
  | "clarity"
  | "businessUsefulness"
  | "audienceRelevance";

type ReviewItemType = "hook" | "caption" | "script" | "cta" | "thumbnail" | "shooting_note" | "hashtag";

type PackReview = {
  outputType: ReviewItemType;
  outputIndex: number;
  text: string;
  decision: "approved" | "rejected";
  scores: Record<QualityCriterion, number>;
  feedbackNotes: string;
  improvementSuggestion: string;
};

type ContentPack = {
  schemaVersion: "production-content-pack.v1";
  campaignAngle: string;
  targetAudienceInsight: string;
  hooks: string[];
  captions: Array<{ caption: string; hashtags: string[] }>;
  scripts: Array<{ title: string; scenes: string[] }>;
  ctaOptions: string[];
  thumbnailTextIdeas: string[];
  shootingDirection: string[];
  hashtagSuggestions: string[];
  qualityScores: Array<{
    itemId: string;
    outputType: ReviewItemType;
    outputIndex: number;
    text: string;
    score: number;
    category: string;
    rationale: string;
  }>;
  packSummary: {
    totalReviewableItems: number;
    averageQualityScore: number;
    readyForHumanReview: boolean;
    governanceNotes: string[];
  };
};

type StartResult = {
  runKey: string;
  approvalKey: string;
  status: "waiting_approval" | "completed" | "changes_requested";
  marketing: {
    segment: string;
    painPoints: string[];
    trustTriggers: string[];
    objections: string[];
    contentAngle: string;
  };
  contentPack: ContentPack;
  adsPerformance: {
    ctrPrediction: {
      expectedRange: string;
      confidence: number;
      rationale: string;
    };
    optimizationSuggestions: string[];
    audienceTargeting: {
      testSegments: string[];
    };
  };
  contentCreator: {
    output: {
      hooks: string[];
      scripts: Array<{ title: string; scenes: string[] }>;
      captions: Array<{ caption: string; hashtags: string[] }>;
      assumptions: string[];
      guardrailNotes: string[];
    };
    guardrails: {
      passed: boolean;
      requiredApprovals: string[];
      notes: string[];
    };
    selectedSkills: string[];
  };
};

type DashboardSnapshot = {
  contentDepartment: {
    activeAgent?: string;
    approvalStatus?: string;
    activeRuns: number;
    completedRuns: number;
    pendingApprovals: number;
    contentPack?: ContentPack | null;
    qualityReviewSummary?: {
      overallScore: number;
      qualityCategory: string;
      approvedCount: number;
      rejectedCount: number;
      reviewedOutputCount: number;
    };
    memoryCurationSummary?: {
      approvedPatternCount: number;
      rejectedPatternCount: number;
      reviewerInsightCount: number;
      repeatedIssueAlerts: string[];
    };
    bestPerformingOutputs?: Array<{ text: string; weightedScore: number }>;
    lowPerformingOutputAlerts?: Array<{ text: string; weightedScore: number; reason: string }>;
    memoryUpdateSummary?: Array<{ title: string; summary?: string; type?: string; tags?: string[] }>;
  };
  workspace: {
    persistenceMode: string;
  };
};

const defaultBrief =
  "สร้าง Production Content Pack สำหรับ TikTok โปรโมตผลิตภัณฑ์แม่และเด็กของไทย เน้นคุณแม่มือใหม่ ภาษาธรรมชาติ ใช้ถ่ายจริงได้ ไม่กล่าวอ้างเกินจริง และมี CTA ให้ทักแชทเพื่อขอรายละเอียด";

const criteria: Array<{ key: QualityCriterion; label: string; weight: string }> = [
  { key: "hookStrength", label: "พลังเปิดเรื่อง", weight: "สูง" },
  { key: "emotionalImpact", label: "อารมณ์ร่วม", weight: "สูง" },
  { key: "thaiNaturalness", label: "ภาษาไทยธรรมชาติ", weight: "สูง" },
  { key: "retentionPotential", label: "โอกาสดูต่อ", weight: "สูง" },
  { key: "ctaEffectiveness", label: "CTA ชัดเจน", weight: "ปกติ" },
  { key: "clarity", label: "เข้าใจง่าย", weight: "ปกติ" },
  { key: "businessUsefulness", label: "ใช้กับธุรกิจได้จริง", weight: "สูง" },
  { key: "audienceRelevance", label: "ตรงกลุ่มเป้าหมาย", weight: "สูง" }
];

const typeLabels: Record<ReviewItemType, string> = {
  hook: "ฮุกเปิดคลิป",
  caption: "แคปชัน",
  script: "สคริปต์",
  cta: "CTA",
  thumbnail: "ข้อความหน้าปก",
  shooting_note: "แนวทางถ่ายทำ",
  hashtag: "แฮชแท็ก"
};

const statusLabels = {
  running: { label: "กำลังประมวลผล", tone: "border-blue-200 bg-blue-50 text-blue-700" },
  ready: { label: "พร้อมเริ่มงาน", tone: "border-slate-200 bg-slate-50 text-slate-700" },
  waiting_approval: { label: "รอรีวิว", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  completed: { label: "อนุมัติแล้ว", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  changes_requested: { label: "ขอแก้ไข", tone: "border-rose-200 bg-rose-50 text-rose-700" }
};

export function ContentDepartmentConsole() {
  const [brief, setBrief] = useState(defaultBrief);
  const [productName, setProductName] = useState("ผลิตภัณฑ์แม่และเด็ก");
  const [targetAudience, setTargetAudience] = useState("คุณแม่มือใหม่และครอบครัวไทยที่ต้องการข้อมูลก่อนตัดสินใจ");
  const [result, setResult] = useState<StartResult | null>(null);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [reviews, setReviews] = useState<PackReview[]>([]);
  const [loading, setLoading] = useState<"start" | "approve" | "reject" | "snapshot" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workflowSatisfaction, setWorkflowSatisfaction] = useState(8);
  const [thumbs, setThumbs] = useState<"up" | "down">("up");
  const [qualityNotes, setQualityNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const approvalReady = result?.status === "waiting_approval";
  const reviewSummary = useMemo(() => summarizeReviews(reviews), [reviews]);
  const status = useMemo(() => {
    if (loading) return statusLabels.running;
    if (result?.status) return statusLabels[result.status];
    return statusLabels.ready;
  }, [loading, result?.status]);

  async function startWorkflow() {
    setLoading("start");
    setError(null);
    try {
      const response = await fetch("/api/live/content-department/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          campaignBrief: brief,
          productName,
          targetAudience,
          channel: "tiktok",
          contentGoal: "engagement",
          tone: "friendly"
        })
      });
      const payload = (await response.json()) as ApiEnvelope<StartResult>;
      if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error ?? "เริ่ม workflow ไม่สำเร็จ");
      setResult(payload.data);
      setReviews(buildPackReviews(payload.data.contentPack));
      setQualityNotes("");
      setRejectionReason("");
      await refreshSnapshot();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "เริ่ม workflow ไม่สำเร็จ");
    } finally {
      setLoading(null);
    }
  }

  async function reviewWorkflow(decision: "approved" | "changes_requested") {
    if (!result) return;
    setLoading(decision === "approved" ? "approve" : "reject");
    setError(null);
    try {
      const response = await fetch("/api/live/content-department/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runKey: result.runKey,
          decision,
          approvalNotes: decision === "approved" ? "ผู้รีวิวอนุมัติชุดคอนเทนต์สำหรับใช้งานต่อ" : "ผู้รีวิวขอแก้ไขหลังตรวจชุดคอนเทนต์",
          outputScore: reviewSummary.overallScore,
          thumbs,
          workflowSatisfaction,
          qualityNotes,
          rejectionReason: decision === "changes_requested" ? rejectionReason : undefined,
          contentReviews: reviews.map((review) => ({
            ...review,
            feedbackNotes: review.feedbackNotes || undefined,
            improvementSuggestion: review.improvementSuggestion || undefined
          }))
        })
      });
      const payload = (await response.json()) as ApiEnvelope<{ status: "completed" | "changes_requested" }>;
      if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error ?? "บันทึกผลรีวิวไม่สำเร็จ");
      setResult({ ...result, status: payload.data.status });
      await refreshSnapshot();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกผลรีวิวไม่สำเร็จ");
    } finally {
      setLoading(null);
    }
  }

  async function refreshSnapshot() {
    setLoading((current) => current ?? "snapshot");
    try {
      const response = await fetch("/api/live/content-department/dashboard");
      const payload = (await response.json()) as ApiEnvelope<DashboardSnapshot>;
      if (response.ok && payload.ok && payload.data) setSnapshot(payload.data);
    } finally {
      setLoading((current) => (current === "snapshot" ? null : current));
    }
  }

  function updateReview(index: number, update: Partial<PackReview>) {
    setReviews((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)));
  }

  function updateReviewScore(index: number, criterion: QualityCriterion, value: number) {
    setReviews((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, scores: { ...item.scores, [criterion]: value } } : item))
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-700">Content Creator AI Production Pack</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">ชุดคอนเทนต์ TikTok สำหรับธุรกิจแม่และเด็ก</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              สร้างแพ็กคอนเทนต์ครบชุด ให้ทีมไทยรีวิว อนุมัติ ปฏิเสธ และส่งผลกลับเข้า learning + memory อย่างมี governance
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium ${status.tone}`}>{status.label}</span>
            <a href="/dashboard" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              กลับแดชบอร์ด
            </a>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[400px_1fr]">
          <div className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Play size={17} className="text-blue-600" />
                บรีฟแคมเปญ
              </div>
              <label className="text-xs font-medium text-slate-500">สินค้า</label>
              <input value={productName} onChange={(event) => setProductName(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
              <label className="mt-4 block text-xs font-medium text-slate-500">กลุ่มเป้าหมาย</label>
              <input value={targetAudience} onChange={(event) => setTargetAudience(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
              <label className="mt-4 block text-xs font-medium text-slate-500">บรีฟแคมเปญ</label>
              <textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={7} className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={startWorkflow} disabled={Boolean(loading)} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
                  {loading === "start" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  สร้างชุดคอนเทนต์
                </button>
                <button onClick={refreshSnapshot} disabled={Boolean(loading)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-60">
                  <RefreshCw size={16} />
                  รีเฟรช
                </button>
              </div>
              {error ? <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
            </div>

            <QualitySummaryCard summary={reviewSummary} snapshot={snapshot} pack={result?.contentPack ?? snapshot?.contentDepartment.contentPack ?? null} />
          </div>

          <div className="space-y-5">
            <ConsolePanel title="สรุปแคมเปญ" empty={!result} emptyText="เริ่ม workflow เพื่อดูมุมแคมเปญและ insight ของกลุ่มเป้าหมาย">
              {result ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <InfoBlock title="มุมแคมเปญ" items={[result.contentPack.campaignAngle]} />
                  <InfoBlock title="Insight กลุ่มเป้าหมาย" items={[result.contentPack.targetAudienceInsight]} />
                  <InfoBlock title="สัญญาณจาก Marketing AI" items={[result.marketing.contentAngle, ...result.marketing.painPoints.slice(0, 2)]} />
                  <InfoBlock title="รีวิวจาก Ads Performance AI" items={[result.adsPerformance.ctrPrediction.rationale, ...result.adsPerformance.optimizationSuggestions.slice(0, 2)]} />
                </div>
              ) : null}
            </ConsolePanel>

            <ConsolePanel title="ชุดคอนเทนต์" empty={!result} emptyText="ระบบจะแสดง hooks, captions, scripts, CTA, ข้อความหน้าปก, แนวทางถ่ายทำ และแฮชแท็กหลังสร้างแพ็ก">
              {result ? <ContentPackView pack={result.contentPack} /> : null}
            </ConsolePanel>

            <ConsolePanel title="รีวิวและอนุมัติ" empty={!result} emptyText="การ์ดรีวิวจะถูกสร้างจากทุก output ในชุดคอนเทนต์">
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <ReviewCard key={`${review.outputType}-${review.outputIndex}`} review={review} index={index} onUpdate={updateReview} onScore={updateReviewScore} />
                ))}
              </div>
            </ConsolePanel>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ShieldCheck size={17} className="text-amber-600" />
                บันทึกผลรีวิวและอัปเดต Memory
              </div>
              {result ? (
                <>
                  <p className="text-sm leading-6 text-slate-600">Approval key: {result.approvalKey}</p>
                  <p className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                    <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                    การอนุมัตินี้ไม่เผยแพร่ภายนอก ระบบจะบันทึกคะแนน รีวิว pattern ที่ดี จุดอ่อน และข้อเสนอปรับ skill เพื่อรอ human approval เท่านั้น
                  </p>
                  <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <TenPointInput label="ความพอใจต่อ workflow" value={workflowSatisfaction} onChange={setWorkflowSatisfaction} />
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">ภาพรวม</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setThumbs("up")} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${thumbs === "up" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"}`}>
                          <ThumbsUp size={15} /> คุณภาพดี
                        </button>
                        <button onClick={() => setThumbs("down")} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${thumbs === "down" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700"}`}>
                          <ThumbsDown size={15} /> ต้องปรับ
                        </button>
                      </div>
                    </div>
                    <label className="grid gap-2 text-xs font-medium text-slate-500">
                      หมายเหตุรีวิว
                      <textarea value={qualityNotes} onChange={(event) => setQualityNotes(event.target.value)} rows={3} className="resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="สรุปว่าแพ็กนี้ใช้ได้ตรงไหน ควรเลี่ยง pattern ไหน" />
                    </label>
                    <label className="grid gap-2 text-xs font-medium text-slate-500">
                      เหตุผลที่ขอแก้ไข
                      <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="จำเป็นเมื่อกดขอแก้ไข" />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => reviewWorkflow("approved")} disabled={!approvalReady || Boolean(loading)} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50">
                      {loading === "approve" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      อนุมัติและบันทึกบทเรียน
                    </button>
                    <button onClick={() => reviewWorkflow("changes_requested")} disabled={!approvalReady || Boolean(loading) || !rejectionReason.trim()} className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50">
                      {loading === "reject" ? <Loader2 size={16} className="animate-spin" /> : <ThumbsDown size={16} />}
                      ขอแก้ไขและบันทึกจุดอ่อน
                    </button>
                  </div>
                  <MemoryUpdateView snapshot={snapshot} />
                </>
              ) : (
                <p className="text-sm text-slate-500">จุดอนุมัติจะถูกสร้างหลังเริ่ม workflow</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ContentPackView({ pack }: { pack: ContentPack }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <OutputCard title="ฮุกเปิดคลิป" items={pack.hooks} />
      <OutputCard title="แคปชัน" items={pack.captions.map((caption) => `${caption.caption}\n${caption.hashtags.join(" ")}`)} />
      <OutputCard title="สคริปต์" items={pack.scripts.map((script) => `${script.title}\n${script.scenes.join("\n")}`)} />
      <OutputCard title="CTA" items={pack.ctaOptions} />
      <OutputCard title="ข้อความหน้าปก" items={pack.thumbnailTextIdeas} />
      <OutputCard title="แนวทางถ่ายทำ" items={pack.shootingDirection} />
      <OutputCard title="แฮชแท็ก" items={pack.hashtagSuggestions} />
      <QualityScoreList scores={pack.qualityScores} />
    </div>
  );
}

function buildPackReviews(pack: ContentPack): PackReview[] {
  return pack.qualityScores.map((score) => ({
    outputType: score.outputType,
    outputIndex: score.outputIndex,
    text: score.text,
    decision: score.score >= 6.5 ? "approved" : "rejected",
    scores: defaultScores(score.score),
    feedbackNotes: score.rationale,
    improvementSuggestion: score.score >= 7 ? "เก็บ pattern นี้ไว้ใช้ต่อถ้าคนรีวิวเห็นว่าภาษาไทยเป็นธรรมชาติ" : "ปรับให้เฉพาะเจาะจงขึ้น ลดคำกว้าง และเลี่ยงการขายแรงเกินไป"
  }));
}

function defaultScores(score: number) {
  const base = Math.max(1, Math.min(10, Math.round(score)));
  return Object.fromEntries(criteria.map((criterion) => [criterion.key, base])) as Record<QualityCriterion, number>;
}

function summarizeReviews(items: PackReview[]) {
  if (!items.length) return { overallScore: 0, approvedCount: 0, rejectedCount: 0, bestCount: 0, lowCount: 0 };
  const scores = items.map((item) => average(Object.values(item.scores)));
  const overallScore = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  return {
    overallScore,
    approvedCount: items.filter((item) => item.decision === "approved").length,
    rejectedCount: items.filter((item) => item.decision === "rejected").length,
    bestCount: scores.filter((score) => score >= 8).length,
    lowCount: items.filter((item, index) => item.decision === "rejected" || scores[index] < 6.5).length
  };
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ConsolePanel({ title, empty, emptyText, children }: { title: string; empty: boolean; emptyText: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-950">{title}</div>
      {empty ? <p className="text-sm leading-6 text-slate-500">{emptyText}</p> : children}
    </div>
  );
}

function ReviewCard({ review, index, onUpdate, onScore }: { review: PackReview; index: number; onUpdate: (index: number, update: Partial<PackReview>) => void; onScore: (index: number, criterion: QualityCriterion, value: number) => void }) {
  const score = Math.round(average(Object.values(review.scores)) * 10) / 10;

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-blue-700">
            {typeLabels[review.outputType]} #{review.outputIndex + 1}
          </p>
          <h3 className="mt-1 whitespace-pre-line break-words text-sm font-semibold leading-6 text-slate-950">{review.text}</h3>
        </div>
        <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${review.decision === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {score}/10
        </span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {criteria.map((criterion) => (
          <TenPointInput key={criterion.key} label={`${criterion.label} (${criterion.weight})`} value={review.scores[criterion.key]} onChange={(value) => onScore(index, criterion.key, value)} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onUpdate(index, { decision: "approved" })} className={`rounded-md border px-3 py-2 text-sm font-medium ${review.decision === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"}`}>
          อนุมัติรายการนี้
        </button>
        <button type="button" onClick={() => onUpdate(index, { decision: "rejected" })} className={`rounded-md border px-3 py-2 text-sm font-medium ${review.decision === "rejected" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700"}`}>
          ปฏิเสธรายการนี้
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <textarea value={review.feedbackNotes} onChange={(event) => onUpdate(index, { feedbackNotes: event.target.value })} rows={2} className="resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="ทำไมรายการนี้ดีหรือไม่ดี" />
        <textarea value={review.improvementSuggestion} onChange={(event) => onUpdate(index, { improvementSuggestion: event.target.value })} rows={2} className="resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="ควรปรับอย่างไรในรอบถัดไป" />
      </div>
    </article>
  );
}

function TenPointInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-2 text-xs font-medium text-slate-500">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span className="font-semibold text-slate-900">{value}/10</span>
      </span>
      <input type="range" min={1} max={10} value={value} onChange={(event) => onChange(Number(event.target.value))} className="accent-blue-600" />
    </label>
  );
}

function QualitySummaryCard({ summary, snapshot, pack }: { summary: ReturnType<typeof summarizeReviews>; snapshot: DashboardSnapshot | null; pack: ContentPack | null }) {
  const apiQuality = snapshot?.contentDepartment.qualityReviewSummary;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">คะแนนคุณภาพ</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <SummaryStat label="คะแนนรีวิวรวม" value={summary.overallScore ? `${summary.overallScore}/10` : "-"} />
        <SummaryStat label="อนุมัติ" value={summary.approvedCount} />
        <SummaryStat label="ปฏิเสธ" value={summary.rejectedCount} />
        <SummaryStat label="ต้องระวัง" value={summary.lowCount} />
      </div>
      {pack ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          คะแนนประเมินจากระบบ: {pack.packSummary.averageQualityScore}/10 จาก {pack.packSummary.totalReviewableItems} รายการ
        </div>
      ) : null}
      {apiQuality ? (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          Dashboard API บันทึกคะแนนล่าสุด {apiQuality.overallScore}/10 ({apiQuality.qualityCategory}) จาก {apiQuality.reviewedOutputCount} รายการ
        </div>
      ) : null}
      {snapshot?.contentDepartment.memoryCurationSummary ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
          Memory updates: ผ่าน {snapshot.contentDepartment.memoryCurationSummary.approvedPatternCount}, ต้องปรับ {snapshot.contentDepartment.memoryCurationSummary.rejectedPatternCount}, insight {snapshot.contentDepartment.memoryCurationSummary.reviewerInsightCount}
        </div>
      ) : null}
    </div>
  );
}

function MemoryUpdateView({ snapshot }: { snapshot: DashboardSnapshot | null }) {
  const updates = snapshot?.contentDepartment.memoryUpdateSummary ?? [];
  if (!updates.length) return null;
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">Memory Updates</p>
      <div className="mt-2 space-y-2">
        {updates.slice(0, 3).map((memory, index) => (
          <div key={`${memory.title}-${index}`} className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
            <span className="font-medium text-slate-950">{memory.title}</span>
            <span className="ml-2 text-xs text-slate-500">{memory.type}</span>
            <p className="mt-1 line-clamp-2">{memory.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function OutputCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="whitespace-pre-line break-words rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
            <span className="mb-1 block text-xs font-medium text-blue-700">#{index + 1}</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function QualityScoreList({ scores }: { scores: ContentPack["qualityScores"] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-950">คะแนนคุณภาพจากระบบ</h3>
      <div className="mt-3 space-y-2">
        {scores.slice(0, 12).map((score) => (
          <div key={score.itemId} className="break-words rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-slate-950">{typeLabels[score.outputType]} #{score.outputIndex + 1}</span>
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{score.score}/10</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{score.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="break-words text-sm leading-6 text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
