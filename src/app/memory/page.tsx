import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { sampleMemories } from "@/modules/memory/sample";

export default function MemoryPage() {
  return (
    <AppShell>
      <h2 className="text-2xl font-bold">หน่วยความจำองค์กร</h2>
      <p className="mt-2 text-sm text-muted">Long-term memory สำหรับ Agent พร้อม pgvector semantic search</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {sampleMemories.map((memory) => (
          <Panel key={memory.id}>
            <div className="flex items-center justify-between gap-3">
              <Badge tone="blue">{memory.type}</Badge>
              <span className="text-sm font-semibold text-muted">ความสำคัญ {memory.importance}/10</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-foreground">{memory.content}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
