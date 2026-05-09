import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { ceoAgent } from "@/modules/agents/ceo";
import { contentCreatorAgent } from "@/modules/agents/content-creator";

const activeAgents = [ceoAgent, contentCreatorAgent];
const futureAgents = ["CTO AI", "CFO AI", "Marketing AI", "Video Editor AI", "R&D AI", "Ads Performance AI", "Customer Support AI", "Admin/Account AI"];

export default function AgentsPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h2 className="text-2xl font-bold">ตัวแทน AI</h2>
        <p className="mt-2 text-sm text-muted">Agent ที่พร้อมใช้งานใน MVP และ Agent ที่จะเพิ่มในรอบถัดไป</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {activeAgents.map((agent) => (
          <Panel key={agent.id}>
            <Badge tone="green">พร้อมทำงาน</Badge>
            <h3 className="mt-4 text-xl font-bold">{agent.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{agent.personality}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {agent.goals.map((goal) => (
                <li key={goal}>- {goal}</li>
              ))}
            </ul>
          </Panel>
        ))}
        <Panel>
          <Badge tone="gray">Roadmap</Badge>
          <h3 className="mt-4 text-xl font-bold">Agent ที่จะเพิ่มภายหลัง</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {futureAgents.map((agent) => (
              <Badge key={agent}>{agent}</Badge>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
