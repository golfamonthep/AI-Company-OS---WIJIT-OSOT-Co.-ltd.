import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { sampleSkills } from "@/modules/skills/sample";

export default function SkillsPage() {
  return (
    <AppShell>
      <h2 className="text-2xl font-bold">คลังทักษะ</h2>
      <p className="mt-2 text-sm text-muted">Skill tree สำหรับพัฒนา Agent ให้เชี่ยวชาญขึ้นตาม feedback และผลงาน</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {sampleSkills.map((skill) => (
          <Panel key={skill.id}>
            <div className="flex items-center justify-between">
              <Badge tone="blue">{skill.category}</Badge>
              <span className="text-sm font-semibold text-muted">Level {skill.level}/10</span>
            </div>
            <h3 className="mt-4 font-bold">{skill.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{skill.description}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
