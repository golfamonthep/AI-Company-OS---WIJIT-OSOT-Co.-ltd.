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
type WorkflowReviewDecision = "approved" | "rejected" | "revision_requested";
type MemoryCheckpointCandidate = {
  id: string;
  kind: "approved_campaign_style" | "tone_of_voice" | "preferred_messaging" | "rejected_pattern" | "workflow_preference";
  title: string;
  content: string;
  tags: string[];
  importance: number;
  source: "content_review" | "quality_evaluation" | "memory_curation" | "workflow_feedback";
  editable: boolean;
  save?: boolean;
};

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

type WorkflowPackage = {
  campaignAngle: string;
  executionState: {
    state: "waiting_for_approval" | "approved" | "executing" | "review_required" | "completed";
    currentStepId: string;
    progressPercent: number;
    nextRequiredAction: string;
  };
  ceoStrategy: string;
  postIdeas: string[];
  captions: string[];
  marketingReview: string[];
  creativeDirection: string[];
  finalOutputPackage: {
    hooks: number;
    captions: number;
    scripts: number;
    creativeDirections: number;
    reviewableItems: number;
  };
  nextRequiredApproval: {
    required: boolean;
    status: "waiting_approval" | "approved" | "rejected" | "revision_requested";
    approvalKey: string;
    label: string;
    reason: string;
  };
  memoryCandidate: {
    type: "campaign_learning";
    title: string;
    summary: string;
    approvalRequired: boolean;
    sourceWorkflowRunKey: string;
  };
  memoryCheckpoint?: {
    prompt: "บันทึกสิ่งนี้เป็นความจำของบริษัทหรือไม่?";
    status: "not_ready" | "pending_confirmation" | "saved" | "dismissed";
    sourceWorkflowRunKey: string;
    approvalKey: string;
    candidates: MemoryCheckpointCandidate[];
    savedCandidateIds?: string[];
  };
  steps: Array<{
    id: string;
    label: string;
    owner: string;
    status: "completed" | "waiting_approval" | "queued_after_approval";
    summary: string;
  }>;
};

type StartResult = {
  runKey: string;
  approvalKey: string;
  status: "waiting_approval" | "completed" | "rejected" | "revision_requested";
  marketing: {
    segment: string;
    painPoints: string[];
    trustTriggers: string[];
    objections: string[];
    contentAngle: string;
  };
  contentPack: ContentPack;
  workflowPackage: WorkflowPackage;
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
    workflowPackage?: WorkflowPackage | null;
    memoryCheckpoint?: WorkflowPackage["memoryCheckpoint"] | null;
  };
  workspace: {
    persistenceMode: string;
  };
};

const defaultBrief =
  "สร้างชุดคอนเทนต์ TikTok สำหรับโปรโมตผลิตภัณฑ์แม่และเด็กของไทย เน้นคุณแม่มือใหม่ ภาษาเป็นธรรมชาติ ถ่ายจริงได้ ไม่กล่าวอ้างเกินจริง และชวนทักแชทเพื่อขอรายละเอียด";

const criteria: Array<{ key: QualityCriterion; label: string; weight: string }> = [
  { key: "hookStrength", label: "พลังเปิดเรื่อง", weight: "สูง" },
  { key: "emotionalImpact", label: "อารมณ์ร่วม", weight: "สูง" },
  { key: "thaiNaturalness", label: "ภาษาไทยธรรมชาติ", weight: "สูง" },
  { key: "retentionPotential", label: "โอกาสดูต่อ", weight: "สูง" },
  { key: "ctaEffectiveness", label: "คำชวนติดต่อชัดเจน", weight: "ปกติ" },
  { key: "clarity", label: "เข้าใจง่าย", weight: "ปกติ" },
  { key: "businessUsefulness", label: "ใช้กับธุรกิจได้จริง", weight: "สูง" },
  { key: "audienceRelevance", label: "ตรงกลุ่มเป้าหมาย", weight: "สูง" }
];

const typeLabels: Record<ReviewItemType, string> = {
  hook: "ฮุกเปิดคลิป",
  caption: "แคปชัน",
  script: "สคริปต์",
  cta: "คำชวนติดต่อ",
  thumbnail: "ข้อความหน้าปก",
  shooting_note: "แนวทางถ่ายทำ",
  hashtag: "แฮชแท็ก"
};

const statusLabels = {
  running: { label: "กำลังประมวลผล", tone: "border-blue-200 bg-blue-50 text-blue-700" },
  ready: { label: "พร้อมเริ่มงาน", tone: "border-slate-200 bg-slate-50 text-slate-700" },
  waiting_approval: { label: "รอตรวจ", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  completed: { label: "อนุมัติแล้ว", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "ปฏิเสธ", tone: "border-rose-200 bg-rose-50 text-rose-700" },
  revision_requested: { label: "ขอให้แก้ไข", tone: "border-amber-200 bg-amber-50 text-amber-800" }
};
export function ContentDepartmentConsole() {
  const [brief, setBrief] = useState(defaultBrief);
  const [productName, setProductName] = useState("ผลิตภัณฑ์แม่และเด็ก");
  const [targetAudience, setTargetAudience] = useState("คุณแม่มือใหม่และครอบครัวไทยที่ต้องการข้อมูลก่อนตัดสินใจ");
  const [result, setResult] = useState<StartResult | null>(null);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [reviews, setReviews] = useState<PackReview[]>([]);
  const [memoryCandidates, setMemoryCandidates] = useState<MemoryCheckpointCandidate[]>([]);
  const [loading, setLoading] = useState<"start" | "approve" | "reject" | "memory" | "snapshot" | null>(null);
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
      if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error ?? "เริ่มงานไม่สำเร็จ");
      setResult(payload.data);
      setReviews(buildPackReviews(payload.data.contentPack));
      setMemoryCandidates([]);
      setQualityNotes("");
      setRejectionReason("");
      await refreshSnapshot();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "เริ่มงานไม่สำเร็จ");
    } finally {
      setLoading(null);
    }
  }

  async function reviewWorkflow(decision: WorkflowReviewDecision) {
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
          approvalNotes: reviewDecisionNote(decision),
          outputScore: reviewSummary.overallScore,
          thumbs,
          workflowSatisfaction,
          qualityNotes,
          rejectionReason: decision === "approved" ? undefined : rejectionReason,
          contentReviews: reviews.map((review) => ({
            ...review,
            feedbackNotes: review.feedbackNotes || undefined,
            improvementSuggestion: review.improvementSuggestion || undefined
          }))
        })
      });
      const payload = (await response.json()) as ApiEnvelope<{ status: "completed" | "rejected" | "revision_requested"; workflowPackage?: WorkflowPackage }>;
      if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error ?? "บันทึกผลรีวิวไม่สำเร็จ");
      setResult({ ...result, status: payload.data.status, workflowPackage: payload.data.workflowPackage ?? result.workflowPackage });
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
      if (response.ok && payload.ok && payload.data) {
        setSnapshot(payload.data);
        if (payload.data.contentDepartment.memoryCheckpoint?.status === "pending_confirmation") {
          setMemoryCandidates(payload.data.contentDepartment.memoryCheckpoint.candidates);
        }
      }
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

  function updateMemoryCandidate(index: number, update: Partial<MemoryCheckpointCandidate>) {
    setMemoryCandidates((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)));
  }

  async function confirmMemoryCheckpoint() {
    const runKey = snapshot?.contentDepartment.memoryCheckpoint?.sourceWorkflowRunKey ?? result?.runKey;
    if (!runKey) return;
    setLoading("memory");
    setError(null);
    try {
      const response = await fetch("/api/live/content-department/memory-checkpoint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ runKey, candidates: memoryCandidates })
      });
      const payload = (await response.json()) as ApiEnvelope<{ status: "saved" | "dismissed"; savedCount: number; workflowPackage?: WorkflowPackage }>;
      if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error ?? "บันทึกความจำไม่สำเร็จ");
      if (payload.data.workflowPackage && result) setResult({ ...result, workflowPackage: payload.data.workflowPackage });
      await refreshSnapshot();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกความจำไม่สำเร็จ");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-700">ตรวจงานกับ CEO AI</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">แคมเปญ TikTok สำหรับธุรกิจแม่และเด็ก</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              อ่านสรุปที่ CEO AI เตรียมไว้ ตัดสินใจว่าใช้ได้หรือควรแก้ และยืนยันบทเรียนที่จะเก็บไว้หลังจบงาน
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium ${status.tone}`}>{status.label}</span>
            <a href="/dashboard" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              กลับแดชบอร์ด
            </a>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <div className="space-y-5">
            <ConsolePanel title="ภาพรวมที่ต้องตัดสินใจ" empty={!result && !snapshot?.contentDepartment.workflowPackage} emptyText="ให้ CEO AI เสนอชุดคอนเทนต์ แล้วหน้านี้จะสรุปสิ่งที่ควรตรวจเป็นลำดับสั้น ๆ">
              <WorkflowPackageView packageData={result?.workflowPackage ?? snapshot?.contentDepartment.workflowPackage ?? null} />
            </ConsolePanel>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Play size={17} className="text-blue-600" />
                บอกโจทย์ให้ CEO AI
              </div>
              <label className="text-xs font-medium text-slate-500">สินค้า / ข้อเสนอ</label>
              <input value={productName} onChange={(event) => setProductName(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
              <label className="mt-4 block text-xs font-medium text-slate-500">กลุ่มเป้าหมาย</label>
              <input value={targetAudience} onChange={(event) => setTargetAudience(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
              <label className="mt-4 block text-xs font-medium text-slate-500">สิ่งที่อยากให้แคมเปญสื่อสาร</label>
              <textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={7} className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={startWorkflow} disabled={Boolean(loading)} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
                  {loading === "start" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  ให้ CEO AI เสนอชุดคอนเทนต์
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
            <ConsolePanel title="สรุปที่ CEO AI เสนอ" empty={!result} emptyText="เริ่มงานเพื่อดูมุมแคมเปญ กลุ่มลูกค้า และข้อควรระวังแบบอ่านเร็ว">
              {result ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <InfoBlock title="มุมแคมเปญ" items={[result.contentPack.campaignAngle]} />
                  <InfoBlock title="ข้อมูลลูกค้าเป้าหมาย" items={[result.contentPack.targetAudienceInsight]} />
                  <InfoBlock title="เหตุผลทางการตลาด" items={[result.marketing.contentAngle, ...result.marketing.painPoints.slice(0, 2)]} />
                  <InfoBlock title="ข้อควรพิจารณาก่อนลงโฆษณา" items={[result.adsPerformance.ctrPrediction.rationale, ...result.adsPerformance.optimizationSuggestions.slice(0, 2)]} />
                </div>
              ) : null}
            </ConsolePanel>

            <ConsolePanel title="ชุดคอนเทนต์" empty={!result} emptyText="หลัง CEO AI เสนอ คุณจะเห็นฮุกเปิดคลิป แคปชัน สคริปต์สั้น ข้อความหน้าปก แนวทางถ่ายทำ และแฮชแท็ก">
              {result ? <ContentPackView pack={result.contentPack} /> : null}
            </ConsolePanel>

            <ConsolePanel title="ตรวจรายการสำคัญ" empty={!result} emptyText="CEO AI จะจัดรายการที่ควรตรวจให้หลังสร้างชุดคอนเทนต์">
              <div className="space-y-3">
                {reviews.map((review, index) => (
                  <ReviewCard key={`${review.outputType}-${review.outputIndex}`} review={review} index={index} onUpdate={updateReview} onScore={updateReviewScore} />
                ))}
              </div>
            </ConsolePanel>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ShieldCheck size={17} className="text-amber-600" />
                ตัดสินใจและบันทึกบทเรียน
              </div>
              {result ? (
                <>
                  <p className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                    <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                    งานนี้ยังไม่ถูกนำไปใช้จริง CEO AI จะนำไปใช้ต่อหรือบันทึกบทเรียนหลังคุณยืนยันเท่านั้น
                  </p>
                  <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <TenPointInput label="ความมั่นใจในชุดงานนี้" value={workflowSatisfaction} onChange={setWorkflowSatisfaction} />
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
                      หมายเหตุถึง CEO AI
                      <textarea value={qualityNotes} onChange={(event) => setQualityNotes(event.target.value)} rows={3} className="resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="สรุปว่าแพ็กนี้ใช้ได้ตรงไหน และควรเลี่ยงอะไรในรอบถัดไป" />
                    </label>
                    <label className="grid gap-2 text-xs font-medium text-slate-500">
                      ถ้าต้องแก้ ให้บอกเหตุผลสั้น ๆ
                      <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="จำเป็นเมื่อกดขอแก้ไข" />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => reviewWorkflow("approved")} disabled={!approvalReady || Boolean(loading)} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50">
                      {loading === "approve" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      อนุมัติงาน
                    </button>
                    <button onClick={() => reviewWorkflow("rejected")} disabled={!approvalReady || Boolean(loading) || !rejectionReason.trim()} className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50">
                      {loading === "reject" ? <Loader2 size={16} className="animate-spin" /> : <ThumbsDown size={16} />}
                      ปฏิเสธและบันทึกสิ่งที่ควรหลีกเลี่ยง
                    </button>
                    <button onClick={() => reviewWorkflow("revision_requested")} disabled={!approvalReady || Boolean(loading) || !rejectionReason.trim()} className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:opacity-50">
                      {loading === "reject" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      ขอให้แก้ไขและบันทึกข้อเสนอแนะ
                    </button>
                  </div>
                  <MemoryCheckpointEditor
                    checkpoint={snapshot?.contentDepartment.memoryCheckpoint ?? result.workflowPackage.memoryCheckpoint ?? null}
                    candidates={memoryCandidates}
                    loading={loading === "memory"}
                    onUpdate={updateMemoryCandidate}
                    onConfirm={confirmMemoryCheckpoint}
                  />
                  <MemoryUpdateView snapshot={snapshot} />
                </>
              ) : (
                <p className="text-sm text-slate-500">จุดอนุมัติจะถูกสร้างหลังเริ่มงาน</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
function reviewDecisionNote(decision: WorkflowReviewDecision) {
  if (decision === "approved") return "คุณอนุมัติชุดคอนเทนต์สำหรับใช้งานต่อ";
  if (decision === "rejected") return "คุณไม่อนุมัติชุดคอนเทนต์นี้หลังตรวจคุณภาพ";
  return "คุณขอให้แก้ไขชุดคอนเทนต์ก่อนใช้งาน";
}
function WorkflowPackageView({ packageData }: { packageData: WorkflowPackage | null }) {
  if (!packageData) return null;
  const visibleSteps = packageData.steps.slice(0, 4);

  return (
    <div className="space-y-4">
      <ExecutionStateSummary packageData={packageData} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryStat label="ไอเดียโพสต์" value={packageData.postIdeas.length} />
        <SummaryStat label="รายการรอตรวจ" value={packageData.finalOutputPackage.reviewableItems} />
        <SummaryStat label="อนุมัติถัดไป" value={toApprovalStatusLabel(packageData.nextRequiredApproval.status)} />
        <SummaryStat label="ความคืบหน้า" value={`${packageData.executionState.progressPercent}%`} />
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
        <span className="font-semibold">ต้องรอคุณตัดสินใจก่อนใช้จริง</span>
        <p className="mt-1">{packageData.nextRequiredApproval.reason}</p>
      </div>
      <div className="grid gap-2">
        <p className="text-xs font-semibold text-slate-500">ลำดับงานแบบย่อ</p>
        {visibleSteps.map((step, index) => (
          <div key={step.id} className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">{index + 1}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-950">{step.label}</p>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${toWorkflowStepTone(step.status)}`}>{toWorkflowStepStatusLabel(step.status)}</span>
              </div>
              <p className="mt-1 break-words text-sm leading-6 text-slate-600">{step.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutionStateSummary({ packageData }: { packageData: WorkflowPackage }) {
  const currentStep = packageData.steps.find((step) => step.id === packageData.executionState.currentStepId);
  const progress = Math.max(0, Math.min(100, packageData.executionState.progressPercent));

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-blue-700">สถานะงานปัจจุบัน</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{toExecutionStateLabel(packageData.executionState.state)}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-700">ขั้นตอน: {currentStep?.label ?? packageData.executionState.currentStepId}</p>
        </div>
        <span className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-sm font-semibold text-blue-700">{progress}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 rounded-md border border-white bg-white/80 p-3 text-sm leading-6 text-slate-700">
        <span className="font-medium text-slate-950">ต่อไปให้คุณ: </span>
        {packageData.executionState.nextRequiredAction}
      </div>
    </div>
  );
}

function toExecutionStateLabel(state: WorkflowPackage["executionState"]["state"]) {
  const labels: Record<WorkflowPackage["executionState"]["state"], string> = {
    waiting_for_approval: "รออนุมัติ",
    approved: "อนุมัติแล้ว",
    executing: "กำลังดำเนินงาน",
    review_required: "ต้องรีวิวอีกครั้ง",
    completed: "เสร็จสมบูรณ์"
  };

  return labels[state];
}

function toApprovalStatusLabel(status: WorkflowPackage["nextRequiredApproval"]["status"]) {
  if (status === "approved") return "อนุมัติแล้ว";
  if (status === "rejected") return "ไม่อนุมัติ";
  if (status === "revision_requested") return "ขอแก้ไข";
  return "รออนุมัติ";
}

function toWorkflowStepStatusLabel(status: WorkflowPackage["steps"][number]["status"]) {
  if (status === "completed") return "เสร็จแล้ว";
  if (status === "queued_after_approval") return "รอหลังอนุมัติ";
  return "รออนุมัติ";
}

function toWorkflowStepTone(status: WorkflowPackage["steps"][number]["status"]) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "queued_after_approval") return "border-slate-200 bg-slate-50 text-slate-600";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function ContentPackView({ pack }: { pack: ContentPack }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <OutputCard title="ฮุกเปิดคลิป" items={pack.hooks} />
      <OutputCard title="แคปชัน" items={pack.captions.map((caption) => `${caption.caption}\n${caption.hashtags.join(" ")}`)} />
      <OutputCard title="สคริปต์" items={pack.scripts.map((script) => `${script.title}\n${script.scenes.join("\n")}`)} />
      <OutputCard title="คำชวนติดต่อ" items={pack.ctaOptions} />
      <OutputCard title="ข้อความหน้าปก" items={pack.thumbnailTextIdeas} />
      <OutputCard title="แนวทางถ่ายทำ" items={pack.shootingDirection} />
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
    improvementSuggestion: score.score >= 7 ? "เก็บแนวทางนี้ไว้ใช้ต่อถ้าคนรีวิวเห็นว่าภาษาไทยเป็นธรรมชาติ" : "ปรับให้เฉพาะเจาะจงขึ้น ลดคำกว้าง และเลี่ยงการขายแรงเกินไป"
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
  const updateOverallScore = (value: number) => {
    criteria.forEach((criterion) => onScore(index, criterion.key, value));
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3">
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
      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <TenPointInput label="คะแนนรวมที่คุณให้" value={Math.round(score)} onChange={updateOverallScore} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onUpdate(index, { decision: "approved" })} className={`rounded-md border px-3 py-2 text-sm font-medium ${review.decision === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"}`}>
          ใช้ได้
        </button>
        <button type="button" onClick={() => onUpdate(index, { decision: "rejected" })} className={`rounded-md border px-3 py-2 text-sm font-medium ${review.decision === "rejected" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700"}`}>
          ควรแก้
        </button>
      </div>
      <textarea value={review.feedbackNotes} onChange={(event) => onUpdate(index, { feedbackNotes: event.target.value })} rows={2} className="mt-3 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="บอก CEO AI สั้น ๆ ว่าดีตรงไหน หรือควรเลี่ยงอะไร" />
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
      <h2 className="text-sm font-semibold text-slate-950">ความพร้อมก่อนอนุมัติ</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <SummaryStat label="คะแนนรวม" value={summary.overallScore ? `${summary.overallScore}/10` : "-"} />
        <SummaryStat label="ใช้ได้" value={summary.approvedCount} />
        <SummaryStat label="ควรแก้" value={summary.rejectedCount} />
        <SummaryStat label="ต้องดูใกล้ ๆ" value={summary.lowCount} />
      </div>
      {pack ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          CEO AI ประเมินเบื้องต้น {pack.packSummary.averageQualityScore}/10 จาก {pack.packSummary.totalReviewableItems} รายการ
        </div>
      ) : null}
      {apiQuality ? (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          ผลตรวจล่าสุด {apiQuality.overallScore}/10 จาก {apiQuality.reviewedOutputCount} รายการ
        </div>
      ) : null}
      {snapshot?.contentDepartment.memoryCurationSummary ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
          บทเรียนที่บันทึกหลังยืนยัน: ผ่าน {snapshot.contentDepartment.memoryCurationSummary.approvedPatternCount}, ต้องปรับ {snapshot.contentDepartment.memoryCurationSummary.rejectedPatternCount}, ข้อสังเกต {snapshot.contentDepartment.memoryCurationSummary.reviewerInsightCount}
        </div>
      ) : null}
    </div>
  );
}

function MemoryCheckpointEditor({
  checkpoint,
  candidates,
  loading,
  onUpdate,
  onConfirm
}: {
  checkpoint: WorkflowPackage["memoryCheckpoint"] | null;
  candidates: MemoryCheckpointCandidate[];
  loading: boolean;
  onUpdate: (index: number, update: Partial<MemoryCheckpointCandidate>) => void;
  onConfirm: () => void;
}) {
  if (!checkpoint) return null;
  if (checkpoint.status === "saved") {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
        บันทึกความจำของบริษัทเรียบร้อยแล้ว
      </div>
    );
  }
  if (checkpoint.status !== "pending_confirmation") return null;
  const selectedCount = candidates.filter((candidate) => candidate.save !== false).length;

  return (
    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-blue-700">บทเรียนที่จะจำไว้</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{checkpoint.prompt}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-700">เลือกสิ่งที่ CEO AI ควรจำไว้สำหรับงานรอบถัดไป</p>
        </div>
        <span className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-sm font-semibold text-blue-700">{selectedCount} รายการ</span>
      </div>
      <div className="mt-3 space-y-3">
        {candidates.map((candidate, index) => (
          <article key={candidate.id} className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                <input type="checkbox" checked={candidate.save !== false} onChange={(event) => onUpdate(index, { save: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                {toMemoryCandidateKindLabel(candidate.kind)}
              </label>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">{candidate.importance}/10</span>
            </div>
            <input value={candidate.title} onChange={(event) => onUpdate(index, { title: event.target.value })} className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
            <textarea value={candidate.content} onChange={(event) => onUpdate(index, { content: event.target.value })} rows={3} className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </article>
        ))}
      </div>
      <button onClick={onConfirm} disabled={loading || !selectedCount} className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        ยืนยันและบันทึกบทเรียน
      </button>
    </div>
  );
}

function toMemoryCandidateKindLabel(kind: MemoryCheckpointCandidate["kind"]) {
  const labels: Record<MemoryCheckpointCandidate["kind"], string> = {
    approved_campaign_style: "รูปแบบแคมเปญที่อนุมัติ",
    tone_of_voice: "น้ำเสียงของแบรนด์",
    preferred_messaging: "ข้อความที่ควรใช้",
    rejected_pattern: "รูปแบบที่ไม่ควรใช้",
    workflow_preference: "ความชอบต่อขั้นตอนงาน"
  };
  return labels[kind];
}

function MemoryUpdateView({ snapshot }: { snapshot: DashboardSnapshot | null }) {
  const updates = snapshot?.contentDepartment.memoryUpdateSummary ?? [];
  if (!updates.length) return null;
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">บทเรียนที่บันทึกไว้</p>
      <div className="mt-2 space-y-2">
        {updates.slice(0, 3).map((memory, index) => (
          <div key={`${memory.title}-${index}`} className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
            <span className="font-medium text-slate-950">{memory.title}</span>
            <span className="ml-2 text-xs text-slate-500">{toMemoryTypeLabel(memory.type)}</span>
            <p className="mt-1 line-clamp-2">{memory.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function toMemoryTypeLabel(value: string | undefined) {
  const labels: Record<string, string> = {
    brand: "แบรนด์",
    campaign: "แคมเปญ",
    company: "บริษัท",
    governance: "การอนุมัติ",
    workflow: "งาน"
  };

  return value ? labels[value] ?? "บทเรียน" : "บทเรียน";
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
