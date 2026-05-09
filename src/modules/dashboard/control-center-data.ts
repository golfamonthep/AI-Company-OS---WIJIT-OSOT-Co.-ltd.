import { BrainCircuit, Building2, Clapperboard, Coins, FlaskConical, Megaphone, PenLine, Settings2, ShieldCheck, Workflow } from "lucide-react";

export const companyOverview = [
  { label: "Neural workforce", value: "2", detail: "Autonomous agents online", trend: "CEO + Content" },
  { label: "Operating divisions", value: "7", detail: "Company departments mapped", trend: "v1 structure" },
  { label: "Live workflows", value: "4", detail: "Strategic loops in motion", trend: "82% healthy" },
  { label: "Execution rate", value: "68%", detail: "Task throughput this cycle", trend: "+12%" },
  { label: "Reasoning index", value: "84", detail: "Self-eval + feedback score", trend: "+7 pts" },
  { label: "Memory graph", value: "128", detail: "Institutional memories indexed", trend: "+24" }
];

export const taskStatus = [
  { label: "Backlog", value: 18, percent: 35 },
  { label: "In Progress", value: 9, percent: 52 },
  { label: "Review", value: 5, percent: 38 },
  { label: "Blocked", value: 2, percent: 12 }
];

export const agentCommandMatrix = [
  {
    name: "CEO AI",
    role: "Company Supervisor",
    status: "Strategic orbit",
    memory: 46,
    skillScore: 86,
    performance: 88,
    currentTask: "Prioritize AI Company OS v1 roadmap"
  },
  {
    name: "Content Creator AI",
    role: "Thai Content Specialist",
    status: "Creative synthesis",
    memory: 82,
    skillScore: 79,
    performance: 84,
    currentTask: "Draft social content for herbal product campaign"
  }
];

export const departments = [
  { name: "CEO Office", icon: ShieldCheck, agents: 1, workflows: 2, status: "Command online" },
  { name: "Marketing", icon: Megaphone, agents: 0, workflows: 1, status: "Planned" },
  { name: "Content", icon: PenLine, agents: 1, workflows: 2, status: "Active" },
  { name: "Video Production", icon: Clapperboard, agents: 0, workflows: 0, status: "Queued" },
  { name: "R&D", icon: FlaskConical, agents: 0, workflows: 1, status: "Designing" },
  { name: "Finance", icon: Coins, agents: 0, workflows: 0, status: "Planned" },
  { name: "Operations", icon: Settings2, agents: 0, workflows: 1, status: "Mapped" }
];

export const workflowLanes = [
  {
    name: "CEO Command Pipeline",
    icon: Workflow,
    nodes: ["Objective", "Memory", "Plan", "Tasks", "Report"],
    activeNode: 3
  },
  {
    name: "Content Production Pipeline",
    icon: PenLine,
    nodes: ["Brief", "Skills", "Strategy", "Draft", "Evaluate"],
    activeNode: 4
  },
  {
    name: "Learning Loop",
    icon: BrainCircuit,
    nodes: ["Output", "Feedback", "XP", "Memory", "SOP"],
    activeNode: 2
  }
];

export const memoryLearning = {
  retrievals: [
    "Brand voice: friendly, credible, Thai-first",
    "Audience: working adults interested in wellness",
    "Successful content: pain-point hooks outperform generic openings"
  ],
  skills: [
    { name: "Thai Copywriting", level: 8, xp: 76 },
    { name: "SOP Reasoning", level: 7, xp: 64 },
    { name: "Strategic Planning", level: 8, xp: 82 }
  ],
  history: ["Content feedback converted into Thai Copywriting XP", "CEO AI promoted MVP scope decision to memory", "SOP improvement suggested for herbal content claims"],
  outputs: ["7-day content calendar", "Short-form video script", "Executive roadmap report"]
};
