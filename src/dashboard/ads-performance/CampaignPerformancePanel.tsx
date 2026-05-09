"use client";

import { AlertTriangle, BarChart3, MousePointerClick, Target } from "lucide-react";
import { DashboardPanel, PanelHeader, StatusPill } from "@/dashboard/components/dashboard-primitives";
import type { LiveDashboardSnapshot } from "@/dashboard/types";

const riskTone = {
  low: "green",
  medium: "amber",
  high: "rose"
} as const;

export function CampaignPerformancePanel({ liveSnapshot }: { liveSnapshot?: LiveDashboardSnapshot | null }) {
  const review = liveSnapshot?.contentDepartment.adsPerformance;

  return (
    <DashboardPanel id="ads-performance">
      <PanelHeader title="วิเคราะห์โฆษณา" description="ประเมิน CTR กลุ่มเป้าหมาย จุดแข็งของครีเอทีฟ และข้อควรระวังด้านงบประมาณ" action={<StatusPill tone={review ? "green" : "cyan"}>{review ? "มีผลวิเคราะห์" : "รอเริ่มงาน"}</StatusPill>} />
      {review ? (
        <div className="grid gap-4 p-4 xl:grid-cols-[0.8fr_1.2fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <MousePointerClick size={17} className="text-blue-600" />
              ประเมิน CTR
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{review.ctrPrediction.expectedRange}</p>
            <p className="mt-2 text-sm text-slate-500">ความมั่นใจ {Math.round(review.ctrPrediction.confidence * 100)}%</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{review.ctrPrediction.rationale}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Target size={17} className="text-emerald-600" />
              กลุ่มเป้าหมาย
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{review.audienceTargeting.primarySegment}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ListBlock title="กลุ่มที่ควรทดสอบ" items={review.audienceTargeting.testSegments} />
              <ListBlock title="กลุ่มที่ควรเว้น" items={review.audienceTargeting.exclusions} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <AlertTriangle size={17} className="text-amber-600" />
                ข้อควรระวังงบประมาณ
              </div>
              <StatusPill tone={riskTone[review.budgetEfficiency.riskLevel]}>{review.budgetEfficiency.riskLevel}</StatusPill>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{review.budgetEfficiency.recommendation}</p>
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">{review.budgetEfficiency.guardrail}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 xl:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <BarChart3 size={17} className="text-indigo-600" />
              รีวิวครีเอทีฟ
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ListBlock title="Hook ที่น่าสนใจ" items={review.creativePerformance.strongestHooks} />
              <ListBlock title="จุดที่ควรระวัง" items={review.creativePerformance.weakSignals} />
              <ListBlock title="คำแนะนำคอนเทนต์" items={review.creativePerformance.contentFeedback} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-950">คำแนะนำปรับปรุง</div>
            <div className="mt-4 space-y-2">
              {review.optimizationSuggestions.map((item, index) => (
                <p key={`${item}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-600">{item}</p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">เริ่ม Mother-and-baby TikTok Campaign เพื่อแสดงผลวิเคราะห์โฆษณา</p>
        </div>
      )}
    </DashboardPanel>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="text-sm leading-5 text-slate-600">{item}</li>
        ))}
      </ul>
    </div>
  );
}
