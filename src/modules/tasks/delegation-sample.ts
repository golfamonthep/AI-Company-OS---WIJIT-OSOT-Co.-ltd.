export const delegationStages = [
  { key: "intake", label: "Intake", count: 3 },
  { key: "assigned", label: "Assigned", count: 5 },
  { key: "accepted", label: "Accepted", count: 4 },
  { key: "in_progress", label: "In Progress", count: 7 },
  { key: "review", label: "Review", count: 3 },
  { key: "approval", label: "Approval", count: 2 },
  { key: "completed", label: "Completed", count: 12 }
];

export const delegatedTasks = [
  {
    id: "delegation-001",
    title: "Create 7-day herbal tea content calendar",
    owner: "Content Creator AI",
    delegator: "CEO AI",
    priority: "high",
    deadline: "2026-05-10",
    stage: "in_progress",
    progress: 64,
    collaborators: ["Marketing AI", "Admin AI"],
    expectedOutput: "Calendar, captions, hooks, CTA and production notes"
  },
  {
    id: "delegation-002",
    title: "Review AI Company OS database scaling risks",
    owner: "CTO AI",
    delegator: "CEO AI",
    priority: "critical",
    deadline: "2026-05-09",
    stage: "approval",
    progress: 92,
    collaborators: ["CEO AI"],
    expectedOutput: "Risk report and approval recommendation"
  },
  {
    id: "delegation-003",
    title: "Prepare product claim research notes",
    owner: "R&D AI",
    delegator: "Content Creator AI",
    priority: "medium",
    deadline: "2026-05-12",
    stage: "assigned",
    progress: 12,
    collaborators: ["Content Creator AI"],
    expectedOutput: "Approved claim notes for content SOP"
  }
];

export const approvalQueue = [
  { id: "approval-001", title: "Approve technical risk report", requester: "CTO AI", approver: "CEO AI", status: "requested" },
  { id: "approval-002", title: "Approve herbal claim wording", requester: "Content Creator AI", approver: "R&D AI", status: "requested" }
];

export const taskHistory = [
  "CEO AI delegated content calendar to Content Creator AI",
  "Content Creator AI accepted task and added Marketing AI as collaborator",
  "Content Creator AI submitted 64% progress update",
  "CTO AI requested approval for critical database risk report"
];
