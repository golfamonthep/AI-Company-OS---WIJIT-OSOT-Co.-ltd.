"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentChannel, ContentCommandResult, ContentFormat } from "@/modules/orchestration/content-workflow";

const channels: { label: string; value: ContentChannel }[] = [
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "TikTok", value: "tiktok" },
  { label: "LINE", value: "line" },
  { label: "Website", value: "website" }
];

const formats: { label: string; value: ContentFormat }[] = [
  { label: "โพสต์ Social", value: "social_post" },
  { label: "สคริปต์วิดีโอสั้น", value: "short_video_script" },
  { label: "ไอเดียแคมเปญ", value: "campaign_ideas" },
  { label: "ปฏิทินคอนเทนต์", value: "content_calendar" }
];

export function ContentCommandForm() {
  const [brief, setBrief] = useState("สร้างคอนเทนต์โปรโมทชาสมุนไพรสำหรับคนทำงานที่อยากดูแลสุขภาพแบบง่าย ๆ");
  const [productName, setProductName] = useState("ชาสมุนไพร");
  const [audience, setAudience] = useState("คนทำงานอายุ 25-45 ปีที่สนใจสุขภาพ");
  const [channel, setChannel] = useState<ContentChannel>("facebook");
  const [format, setFormat] = useState<ContentFormat>("social_post");
  const [tone, setTone] = useState("friendly");
  const [result, setResult] = useState<ContentCommandResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function generateContent() {
    startTransition(async () => {
      const response = await fetch("/api/content/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, productName, audience, channel, format, tone })
      });
      const data = (await response.json()) as ContentCommandResult;
      setResult(data);
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold">ชื่อสินค้า/แบรนด์</span>
          <input value={productName} onChange={(event) => setProductName(event.target.value)} className="w-full rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">กลุ่มเป้าหมาย</span>
          <input value={audience} onChange={(event) => setAudience(event.target.value)} className="w-full rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold">ช่องทาง</span>
          <select value={channel} onChange={(event) => setChannel(event.target.value as ContentChannel)} className="w-full rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-primary">
            {channels.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">รูปแบบคอนเทนต์</span>
          <select value={format} onChange={(event) => setFormat(event.target.value as ContentFormat)} className="w-full rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-primary">
            {formats.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">โทนภาษา</span>
          <select value={tone} onChange={(event) => setTone(event.target.value)} className="w-full rounded-md border border-border px-3 py-2.5 text-sm outline-none focus:border-primary">
            <option value="friendly">เป็นกันเอง</option>
            <option value="professional">มืออาชีพ</option>
            <option value="premium">พรีเมียม</option>
            <option value="educational">ให้ความรู้</option>
            <option value="urgent">กระตุ้นการตัดสินใจ</option>
          </select>
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Brief</span>
        <textarea value={brief} onChange={(event) => setBrief(event.target.value)} className="min-h-28 w-full resize-none rounded-md border border-border p-4 text-sm leading-6 outline-none focus:border-primary" />
      </label>
      <div className="flex justify-end">
        <Button onClick={generateContent} disabled={isPending || brief.trim().length === 0}>
          <Sparkles className="mr-2 size-4" />
          {isPending ? "กำลังสร้างคอนเทนต์..." : "สร้างคอนเทนต์"}
        </Button>
      </div>
      {result ? (
        <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">ผลลัพธ์จาก Content Creator AI</p>
              <h3 className="text-lg font-bold text-blue-950">{result.contentTitle}</h3>
            </div>
            <p className="text-sm font-semibold text-blue-700">
              {result.channel} / {result.format}
            </p>
          </div>
          <div className="mt-4 whitespace-pre-line rounded-md bg-white p-4 text-sm leading-7 text-slate-800">{result.draft}</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-blue-950">Hook</p>
              <p className="mt-1 text-sm text-blue-900">{result.hook}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-blue-950">CTA</p>
              <p className="mt-1 text-sm text-blue-900">{result.callToAction}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.hashtags.map((tag) => (
              <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                {tag}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
