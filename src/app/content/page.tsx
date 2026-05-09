import { PenLine } from "lucide-react";
import { ContentCommandForm } from "@/components/agents/content-command-form";
import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { contentCreatorAgent } from "@/modules/agents/content-creator";

export default function ContentPage() {
  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Badge tone="green">Functional Agent</Badge>
              <h2 className="mt-3 text-2xl font-bold">Content Creator AI</h2>
              <p className="mt-2 text-sm leading-6 text-muted">สร้างโพสต์ สคริปต์วิดีโอ ไอเดียแคมเปญ และปฏิทินคอนเทนต์ภาษาไทยจาก brief เดียว</p>
            </div>
            <div className="grid size-11 place-items-center rounded-md bg-blue-50 text-primary">
              <PenLine size={22} />
            </div>
          </div>
          <ContentCommandForm />
        </Panel>
        <aside className="space-y-5">
          <Panel>
            <h3 className="font-bold">{contentCreatorAgent.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{contentCreatorAgent.personality}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {contentCreatorAgent.skills.map((skill) => (
                <Badge key={skill} tone="blue">
                  {skill}
                </Badge>
              ))}
            </div>
          </Panel>
          <Panel>
            <h3 className="font-bold">เป้าหมายการทำงาน</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
              {contentCreatorAgent.goals.map((goal) => (
                <li key={goal}>- {goal}</li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
