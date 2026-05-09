export type MockMemoryRecord = {
  id: string;
  workspaceId: string;
  scope: "company" | "agent" | "workflow" | "decision" | "learning";
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

export class MockMemorySystem {
  private readonly records: MockMemoryRecord[] = [];

  seedMotherBabyCampaign(workspaceId = "test-workspace") {
    this.records.push(
      this.createRecord(workspaceId, "company", "Brand Voice", "Warm, practical, Thai-first, no exaggerated health claims.", ["brand", "content"]),
      this.createRecord(workspaceId, "agent", "Successful TikTok Hooks", "Checklist and reassurance hooks outperform generic claims.", ["tiktok", "hooks"]),
      this.createRecord(workspaceId, "decision", "Publishing Approval Required", "All social publishing requires governance approval before release.", ["governance", "approval"])
    );
  }

  write(record: Omit<MockMemoryRecord, "id" | "createdAt">) {
    const saved = this.createRecord(record.workspaceId, record.scope, record.title, record.content, record.tags);
    this.records.unshift(saved);
    return saved;
  }

  retrieve(input: { workspaceId: string; query: string; limit?: number }) {
    const tokens = input.query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.records
      .filter((record) => record.workspaceId === input.workspaceId)
      .map((record) => ({
        record,
        score: tokens.reduce((score, token) => score + (record.title.toLowerCase().includes(token) || record.content.toLowerCase().includes(token) || record.tags.includes(token) ? 1 : 0), 0)
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, input.limit ?? 5)
      .map((item) => item.record);
  }

  list(workspaceId: string) {
    return this.records.filter((record) => record.workspaceId === workspaceId);
  }

  private createRecord(workspaceId: string, scope: MockMemoryRecord["scope"], title: string, content: string, tags: string[]): MockMemoryRecord {
    return {
      id: `mem-${this.records.length + 1}-${Date.now()}`,
      workspaceId,
      scope,
      title,
      content,
      tags,
      createdAt: new Date().toISOString()
    };
  }
}
