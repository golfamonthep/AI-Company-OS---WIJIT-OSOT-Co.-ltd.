import type { ContentChannel, ContentCommandInput, ContentFormat } from "@/modules/orchestration/content-workflow";

export type ObjectiveAnalysis = {
  businessGoal: string;
  productName: string;
  audience: string;
  channel: ContentChannel;
  format: ContentFormat;
  tone: NonNullable<ContentCommandInput["tone"]>;
  requiredClaims: string[];
  missingInputs: string[];
  assumptions: string[];
};

export type ContentStrategy = {
  keyMessage: string;
  hookStrategy: string;
  proofStrategy: string;
  ctaStrategy: string;
  complianceNotes: string[];
};

export type SelfEvaluation = {
  totalScore: number;
  scores: {
    objectiveFit: number;
    audienceFit: number;
    brandVoiceAlignment: number;
    clarity: number;
    ctaStrength: number;
    channelFit: number;
    complianceSafety: number;
    originality: number;
    actionability: number;
  };
  weaknesses: string[];
  revisionInstructions: string[];
  passed: boolean;
};

export type ContentReasoningTrace = {
  objective: ObjectiveAnalysis;
  retrievalPlan: string[];
  requiredSkills: string[];
  strategy: ContentStrategy;
  selfEvaluation: SelfEvaluation;
};

export function analyzeObjective(input: ContentCommandInput): ObjectiveAnalysis {
  return {
    businessGoal: "สร้างคอนเทนต์ที่นำไปเผยแพร่ได้จริงและกระตุ้นให้กลุ่มเป้าหมายสนใจ",
    productName: input.productName?.trim() || "แบรนด์/สินค้า",
    audience: input.audience?.trim() || "ลูกค้าคนไทยที่ต้องการข้อมูลน่าเชื่อถือ",
    channel: input.channel ?? "facebook",
    format: input.format ?? "social_post",
    tone: input.tone ?? "friendly",
    requiredClaims: [],
    missingInputs: input.productName ? [] : ["ชื่อสินค้า/แบรนด์เฉพาะ"],
    assumptions: ["ยังไม่มี brand voice profile และ performance history จริง จึงใช้ค่าเริ่มต้นของระบบ"]
  };
}

export function buildRetrievalPlan(objective: ObjectiveAnalysis) {
  return [
    `brand voice for ${objective.productName}`,
    `audience insights for ${objective.audience}`,
    `successful ${objective.channel} ${objective.format} examples`,
    `feedback lessons for ${objective.format}`,
    `SOP rules for content and compliance`
  ];
}

export function selectRequiredSkills(objective: ObjectiveAnalysis) {
  const base = ["Thai Copywriting", "Brand Voice", "CTA Writing"];
  if (objective.format === "short_video_script") return [...base, "Short-form Scriptwriting", "Hook Writing"];
  if (objective.format === "content_calendar") return [...base, "Content Strategy", "Campaign Planning"];
  if (objective.format === "campaign_ideas") return [...base, "Campaign Ideation", "Audience Segmentation"];
  return base;
}

export function generateStrategy(objective: ObjectiveAnalysis): ContentStrategy {
  return {
    keyMessage: `${objective.productName} ช่วยตอบโจทย์ของ ${objective.audience} ด้วยวิธีที่เข้าใจง่ายและน่าเชื่อถือ`,
    hookStrategy: "เปิดด้วย pain point ที่กลุ่มเป้าหมายรู้สึกทันที",
    proofStrategy: "ใช้เหตุผล ประโยชน์ และตัวอย่างสถานการณ์จริง โดยไม่กล่าวอ้างเกินหลักฐาน",
    ctaStrategy: "ชวนให้ทักแชทหรือขอข้อมูลเพิ่มเติมด้วยคำสั่งที่ชัดเจน",
    complianceNotes: ["หลีกเลี่ยงคำกล่าวอ้างผลลัพธ์เกินจริง", "ระบุ assumption เมื่อข้อมูลสินค้าไม่ครบ"]
  };
}

export function selfEvaluateDraft(draft: string): SelfEvaluation {
  const clarity = draft.length > 120 ? 4 : 3;
  const ctaStrength = draft.includes("ทัก") || draft.toLowerCase().includes("cta") ? 4 : 3;
  const complianceSafety = draft.includes("หาย") || draft.includes("รักษา") ? 2 : 4;
  const scores = {
    objectiveFit: 4,
    audienceFit: 4,
    brandVoiceAlignment: 4,
    clarity,
    ctaStrength,
    channelFit: 4,
    complianceSafety,
    originality: 3,
    actionability: 4
  };
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) * (100 / 45);
  const weaknesses = [
    ...(scores.complianceSafety < 3 ? ["มีความเสี่ยงด้านคำกล่าวอ้างเกินจริง"] : []),
    ...(scores.originality < 4 ? ["ควรเพิ่มมุมสร้างสรรค์หรือ insight เฉพาะแบรนด์"] : [])
  ];

  return {
    totalScore: Math.round(totalScore),
    scores,
    weaknesses,
    revisionInstructions: weaknesses.map((weakness) => `ปรับปรุง: ${weakness}`),
    passed: totalScore >= 80 && scores.complianceSafety >= 3
  };
}

export function buildReasoningTrace(input: ContentCommandInput, draft: string): ContentReasoningTrace {
  const objective = analyzeObjective(input);
  return {
    objective,
    retrievalPlan: buildRetrievalPlan(objective),
    requiredSkills: selectRequiredSkills(objective),
    strategy: generateStrategy(objective),
    selfEvaluation: selfEvaluateDraft(draft)
  };
}
