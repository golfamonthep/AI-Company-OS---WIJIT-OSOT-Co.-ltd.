export type PlatformStatus = "active" | "watch" | "needs_approval" | "paused";

export type PlatformAgent = {
  id: string;
  name: string;
  responsibility: string;
  activeTasks: number;
  pendingApprovals: number;
  performanceScore: number;
  status: PlatformStatus;
  accent: "cyan" | "orange" | "violet" | "blue" | "green" | "amber" | "sky";
};

export type PlatformTask = {
  id: string;
  platformId: string;
  title: string;
  owner: string;
  status: "queued" | "in_progress" | "waiting_approval" | "completed";
  progress: number;
};

export type PlatformMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: "good" | "watch" | "neutral";
};

export type PlatformWorkflow = {
  id: string;
  title: string;
  platformIds: string[];
  currentStep: string;
  progress: number;
  approvalRequired: boolean;
};

export type PlatformOutput = {
  id: string;
  title: string;
  platformId: string;
  type: string;
  status: "draft" | "ready_for_review" | "approved";
};

export type MultiPlatformCommandCenterModel = {
  platformAgents: PlatformAgent[];
  tasks: PlatformTask[];
  metrics: PlatformMetric[];
  workflows: PlatformWorkflow[];
  outputs: PlatformOutput[];
};

const platformAgents: PlatformAgent[] = [
  {
    id: "tiktok-office",
    name: "TikTok Office",
    responsibility: "วางแผนคลิปสั้น ฮุก แคปชัน และจังหวะโพสต์",
    activeTasks: 8,
    pendingApprovals: 3,
    performanceScore: 91,
    status: "needs_approval",
    accent: "cyan"
  },
  {
    id: "shopee-office",
    name: "Shopee Office",
    responsibility: "จัดหน้าสินค้า โปรโมชัน รีวิว และ conversion",
    activeTasks: 5,
    pendingApprovals: 1,
    performanceScore: 84,
    status: "active",
    accent: "orange"
  },
  {
    id: "lazada-office",
    name: "Lazada Office",
    responsibility: "บริหารแคมเปญ marketplace และ product ranking",
    activeTasks: 4,
    pendingApprovals: 1,
    performanceScore: 79,
    status: "watch",
    accent: "violet"
  },
  {
    id: "facebook-office",
    name: "Facebook Office",
    responsibility: "ดูแลเพจ โฆษณา remarketing และชุมชนลูกค้า",
    activeTasks: 6,
    pendingApprovals: 2,
    performanceScore: 86,
    status: "needs_approval",
    accent: "blue"
  },
  {
    id: "line-office",
    name: "LINE Office",
    responsibility: "บรอดแคสต์ แชทลูกค้า และ follow-up หลังการขาย",
    activeTasks: 3,
    pendingApprovals: 2,
    performanceScore: 88,
    status: "needs_approval",
    accent: "green"
  },
  {
    id: "google-seo-office",
    name: "Google SEO Office",
    responsibility: "บทความ SEO คีย์เวิร์ด และ traffic ระยะยาว",
    activeTasks: 4,
    pendingApprovals: 0,
    performanceScore: 82,
    status: "active",
    accent: "sky"
  },
  {
    id: "google-shopping-office",
    name: "Google Shopping Office",
    responsibility: "ฟีดสินค้า แคมเปญ shopping และ ROAS",
    activeTasks: 2,
    pendingApprovals: 1,
    performanceScore: 76,
    status: "watch",
    accent: "amber"
  }
];

const tasks: PlatformTask[] = [
  { id: "task-tiktok-hooks", platformId: "tiktok-office", title: "เตรียมฮุกคลิปแม่และเด็ก 12 แบบ", owner: "TikTok Office", status: "waiting_approval", progress: 72 },
  { id: "task-shopee-bundle", platformId: "shopee-office", title: "จัดชุดโปรโมชัน bundle สำหรับสินค้าเด่น", owner: "Shopee Office", status: "in_progress", progress: 58 },
  { id: "task-lazada-ranking", platformId: "lazada-office", title: "ตรวจอันดับสินค้าและข้อเสนอคู่แข่ง", owner: "Lazada Office", status: "queued", progress: 24 },
  { id: "task-facebook-retarget", platformId: "facebook-office", title: "ร่าง remarketing audience และ creative", owner: "Facebook Office", status: "waiting_approval", progress: 66 },
  { id: "task-line-broadcast", platformId: "line-office", title: "เขียนข้อความ LINE สำหรับลูกค้าเก่า", owner: "LINE Office", status: "waiting_approval", progress: 74 },
  { id: "task-seo-brief", platformId: "google-seo-office", title: "วางบทความ SEO สำหรับคำถามแม่มือใหม่", owner: "Google SEO Office", status: "in_progress", progress: 48 },
  { id: "task-shopping-feed", platformId: "google-shopping-office", title: "ตรวจ product feed และคำโฆษณาสินค้า", owner: "Google Shopping Office", status: "queued", progress: 18 }
];

const metrics: PlatformMetric[] = [
  { id: "metric-score", label: "คะแนนเฉลี่ยแพลตฟอร์ม", value: "84%", change: "+6% จากรอบก่อน", tone: "good" },
  { id: "metric-approval", label: "รออนุมัติ", value: "10", change: "ต้องตรวจวันนี้", tone: "watch" },
  { id: "metric-output", label: "ผลลัพธ์พร้อมตรวจ", value: "18", change: "จาก 7 offices", tone: "neutral" },
  { id: "metric-risk", label: "งานเสี่ยงสูง", value: "2", change: "เกี่ยวกับ ad spend / claim", tone: "watch" }
];

const workflows: PlatformWorkflow[] = [
  { id: "workflow-launch", title: "Mother-and-baby TikTok Campaign", platformIds: ["tiktok-office", "facebook-office", "line-office"], currentStep: "ตรวจแผนและข้อความก่อนเผยแพร่", progress: 68, approvalRequired: true },
  { id: "workflow-marketplace", title: "Marketplace Conversion Sprint", platformIds: ["shopee-office", "lazada-office", "google-shopping-office"], currentStep: "เทียบราคาและเตรียมข้อเสนอ", progress: 42, approvalRequired: true },
  { id: "workflow-seo", title: "Search Demand Capture", platformIds: ["google-seo-office", "google-shopping-office"], currentStep: "สร้าง brief คีย์เวิร์ด", progress: 36, approvalRequired: false },
  { id: "workflow-retention", title: "LINE Customer Retention", platformIds: ["line-office", "facebook-office"], currentStep: "รออนุมัติข้อความส่งหาลูกค้า", progress: 74, approvalRequired: true }
];

const outputs: PlatformOutput[] = [
  { id: "output-tiktok-plan", title: "แผนคลิป TikTok 7 วัน", platformId: "tiktok-office", type: "Content Plan", status: "ready_for_review" },
  { id: "output-shopee-pack", title: "ชุดข้อเสนอ Shopee Bundle", platformId: "shopee-office", type: "Marketplace Pack", status: "draft" },
  { id: "output-line-copy", title: "ข้อความ LINE Broadcast", platformId: "line-office", type: "Customer Message", status: "ready_for_review" },
  { id: "output-seo-brief", title: "SEO Article Brief", platformId: "google-seo-office", type: "Search Brief", status: "draft" }
];

export function createMultiPlatformCommandCenterModel(): MultiPlatformCommandCenterModel {
  return {
    platformAgents,
    tasks,
    metrics,
    workflows,
    outputs
  };
}
