"use client";

import { useState, useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CEOCommandResult } from "@/modules/orchestration/types";

export function CommandForm() {
  const [command, setCommand] = useState("ช่วยวางแผน MVP สำหรับ AI Company OS และสร้างงานสำคัญให้ CEO AI");
  const [result, setResult] = useState<CEOCommandResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitCommand() {
    startTransition(async () => {
      const response = await fetch("/api/ceo/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });
      const data = (await response.json()) as CEOCommandResult;
      setResult(data);
    });
  }

  return (
    <div className="space-y-4">
      <textarea
        value={command}
        onChange={(event) => setCommand(event.target.value)}
        className="min-h-32 w-full resize-none rounded-md border border-border bg-white p-4 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        placeholder="พิมพ์คำสั่งให้ CEO AI เช่น วางแผนแคมเปญ สร้างงาน สรุปรายงาน หรือจัดลำดับความสำคัญ"
      />
      <div className="flex justify-end">
        <Button onClick={submitCommand} disabled={isPending || command.trim().length === 0}>
          <SendHorizontal className="mr-2 size-4" />
          {isPending ? "CEO AI กำลังคิด..." : "ส่งคำสั่ง"}
        </Button>
      </div>
      {result ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">ผลวิเคราะห์จาก CEO AI</h3>
          <p className="mt-2 text-sm leading-6 text-blue-900">{result.executiveSummary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-blue-900">ขั้นตอนแนะนำ</p>
              <ul className="mt-2 space-y-1 text-sm text-blue-900">
                {result.recommendedActions.map((action) => (
                  <li key={action}>- {action}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">งานที่สร้าง</p>
              <ul className="mt-2 space-y-1 text-sm text-blue-900">
                {result.createdTasks.length ? result.createdTasks.map((task) => <li key={task.id}>- {task.title}</li>) : <li>- ยังไม่มีงานใหม่</li>}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
