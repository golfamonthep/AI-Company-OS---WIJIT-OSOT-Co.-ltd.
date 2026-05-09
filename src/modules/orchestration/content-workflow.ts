import { contentCreatorAgent } from "@/modules/agents/content-creator";
import { buildReasoningTrace, type ContentReasoningTrace } from "@/modules/orchestration/content-reasoning-pipeline";

export type ContentFormat = "social_post" | "short_video_script" | "campaign_ideas" | "content_calendar";
export type ContentChannel = "facebook" | "instagram" | "tiktok" | "line" | "website";

export type ContentCommandInput = {
  brief: string;
  productName?: string;
  audience?: string;
  channel?: ContentChannel;
  format?: ContentFormat;
  tone?: "professional" | "friendly" | "premium" | "educational" | "urgent";
};

export type ContentCommandResult = {
  agentId: string;
  format: ContentFormat;
  channel: ContentChannel;
  contentTitle: string;
  hook: string;
  draft: string;
  hashtags: string[];
  callToAction: string;
  productionNotes: string[];
  assumptions: string[];
  reasoningTrace: ContentReasoningTrace;
};

function pickFormat(brief: string, requested?: ContentFormat): ContentFormat {
  if (requested) return requested;
  const lower = brief.toLowerCase();
  if (lower.includes("video") || lower.includes("วิดีโอ") || lower.includes("tiktok")) return "short_video_script";
  if (lower.includes("calendar") || lower.includes("ปฏิทิน")) return "content_calendar";
  if (lower.includes("campaign") || lower.includes("แคมเปญ")) return "campaign_ideas";
  return "social_post";
}

function pickChannel(brief: string, requested?: ContentChannel): ContentChannel {
  if (requested) return requested;
  const lower = brief.toLowerCase();
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("instagram") || lower.includes("ig")) return "instagram";
  if (lower.includes("line")) return "line";
  if (lower.includes("website") || lower.includes("เว็บ")) return "website";
  return "facebook";
}

function toneLabel(tone: ContentCommandInput["tone"]) {
  const labels = {
    professional: "มืออาชีพและน่าเชื่อถือ",
    friendly: "เป็นกันเองและเข้าถึงง่าย",
    premium: "พรีเมียมและมั่นใจ",
    educational: "ให้ความรู้และอธิบายชัด",
    urgent: "กระตุ้นการตัดสินใจ"
  };
  return labels[tone ?? "friendly"];
}

function buildDraft(input: Required<Pick<ContentCommandInput, "brief" | "audience" | "productName" | "tone">>, format: ContentFormat, channel: ContentChannel) {
  const tone = toneLabel(input.tone);
  const base = `สินค้า/บริการ: ${input.productName}\nกลุ่มเป้าหมาย: ${input.audience}\nโทน: ${tone}\nช่องทาง: ${channel}\n\n`;

  if (format === "short_video_script") {
    return `${base}สคริปต์วิดีโอสั้น:\n0-3 วินาที: เปิดด้วยปัญหาที่กลุ่มเป้าหมายเจอจาก "${input.brief}"\n4-12 วินาที: แนะนำ ${input.productName} พร้อมประโยชน์หลักแบบเข้าใจง่าย\n13-22 วินาที: ยกตัวอย่างสถานการณ์ใช้งานจริงและผลลัพธ์ที่คาดหวัง\n23-30 วินาที: ปิดด้วย CTA ให้ทักแชทหรือกดติดตามเพื่อรับข้อมูลเพิ่มเติม`;
  }

  if (format === "campaign_ideas") {
    return `${base}ไอเดียแคมเปญ:\n1. Hook Campaign: เปลี่ยน pain point จาก brief ให้เป็นคำถามเปิดบทสนทนา\n2. Proof Campaign: ใช้ความรู้/รีวิว/ขั้นตอนจริงเพื่อสร้างความเชื่อมั่น\n3. Action Campaign: เสนอ next step ที่ชัด เช่น ทักแชท รับคำปรึกษา หรือดูรายละเอียดสินค้า`;
  }

  if (format === "content_calendar") {
    return `${base}ปฏิทินคอนเทนต์ 7 วัน:\nDay 1: โพสต์ให้ความรู้จากปัญหาหลัก\nDay 2: โพสต์ story เบื้องหลังหรือที่มาของสินค้า\nDay 3: วิดีโอสั้นตอบคำถามยอดนิยม\nDay 4: โพสต์ social proof หรือ case example\nDay 5: โพสต์เปรียบเทียบก่อน/หลังหรือ checklist\nDay 6: Live/สั้น Q&A\nDay 7: สรุป offer และ CTA`;
  }

  return `${base}โพสต์พร้อมใช้:\nเคยเจอปัญหานี้ไหม: ${input.brief}\n\n${input.productName} ถูกออกแบบมาเพื่อช่วยให้เรื่องนี้ง่ายขึ้น ด้วยแนวทางที่เข้าใจง่าย ใช้ได้จริง และเหมาะกับชีวิตประจำวันของกลุ่มเป้าหมาย\n\nสิ่งที่น่าสนใจคือ คุณไม่จำเป็นต้องเริ่มจากศูนย์ แค่เลือกวิธีที่เหมาะกับตัวเอง แล้วค่อย ๆ ปรับให้ดีขึ้น\n\nสนใจรายละเอียดเพิ่มเติม ทักแชทหาเราได้เลย`;
}

export async function runContentCommand(input: ContentCommandInput): Promise<ContentCommandResult> {
  const format = pickFormat(input.brief, input.format);
  const channel = pickChannel(input.brief, input.channel);
  const productName = input.productName?.trim() || "แบรนด์/สินค้า";
  const audience = input.audience?.trim() || "ลูกค้าคนไทยที่สนใจสินค้าและต้องการข้อมูลที่เชื่อถือได้";
  const tone = input.tone ?? "friendly";
  const draft = buildDraft({ brief: input.brief, productName, audience, tone }, format, channel);

  return {
    agentId: contentCreatorAgent.id,
    format,
    channel,
    contentTitle: `คอนเทนต์สำหรับ ${productName}`,
    hook: `เริ่มจาก pain point: ${input.brief}`,
    draft,
    hashtags: ["#AICompanyOS", "#คอนเทนต์การตลาด", "#ธุรกิจไทย", `#${productName.replace(/\s+/g, "")}`],
    callToAction: channel === "line" ? "กดเพิ่มเพื่อนและทักแชทเพื่อรับข้อมูลเพิ่มเติม" : "ทักแชทหรือคอมเมนต์เพื่อรับรายละเอียดเพิ่มเติม",
    productionNotes: [
      "ใช้ภาพหรือวิดีโอที่เห็นสินค้าจริงชัดเจน",
      "เปิดคอนเทนต์ด้วยปัญหาที่ลูกค้าเข้าใจทันที",
      "หลีกเลี่ยงคำกล่าวอ้างเกินจริงถ้ายังไม่มีหลักฐานหรือเอกสารรองรับ",
      "บันทึกผลลัพธ์และ feedback เพื่อให้ Agent ปรับปรุงคอนเทนต์ครั้งถัดไป"
    ],
    assumptions: [
      "ยังไม่มี brand voice guideline จาก SOP จริง จึงใช้โทนภาษาไทยแบบเป็นกันเองและน่าเชื่อถือ",
      "ยังไม่มี analytics จริง จึงยังไม่คาดการณ์ยอด reach, click หรือ conversion"
    ],
    reasoningTrace: buildReasoningTrace({ ...input, productName, audience, channel, format, tone }, draft)
  };
}
