import type { ContentCreatorStructuredOutput } from "@/modules/content-creator-agent/contracts";
import type { MarketingAudienceAnalysis } from "@/modules/live-mvp/content-department";

export type AdsPerformanceReviewInput = {
  campaignName: string;
  marketing: MarketingAudienceAnalysis;
  content: ContentCreatorStructuredOutput;
  productName?: string;
  contentGoal?: "awareness" | "engagement" | "conversion" | "education";
};

export type AdsPerformanceReview = {
  agentKey: "ads-performance";
  ctrPrediction: {
    expectedRange: string;
    confidence: number;
    rationale: string;
  };
  audienceTargeting: {
    primarySegment: string;
    testSegments: string[];
    exclusions: string[];
  };
  creativePerformance: {
    strongestHooks: string[];
    weakSignals: string[];
    contentFeedback: string[];
  };
  optimizationSuggestions: string[];
  budgetEfficiency: {
    recommendation: string;
    riskLevel: "low" | "medium" | "high";
    guardrail: string;
  };
  reportingSummary: string;
  learningSignals: string[];
  governanceNotes: string[];
};

export function analyzeAdsPerformance(input: AdsPerformanceReviewInput): AdsPerformanceReview {
  const hookCount = input.content.hooks.length;
  const scriptCount = input.content.scripts.length;
  const hasChecklistAngle = `${input.marketing.contentAngle} ${input.content.hooks.join(" ")}`.toLowerCase().includes("checklist");
  const confidence = Math.min(0.88, 0.58 + hookCount * 0.03 + scriptCount * 0.02 + (hasChecklistAngle ? 0.08 : 0));
  const lowCtr = hasChecklistAngle ? 1.4 : 1.0;
  const highCtr = hasChecklistAngle ? 2.6 : 1.9;
  const strongestHooks = input.content.hooks.slice(0, 3);

  return {
    agentKey: "ads-performance",
    ctrPrediction: {
      expectedRange: `${lowCtr.toFixed(1)}%-${highCtr.toFixed(1)}%`,
      confidence: Math.round(confidence * 100) / 100,
      rationale: hasChecklistAngle
        ? "มุม checklist และการให้ความมั่นใจช่วยให้กลุ่มพ่อแม่เข้าใจเหตุผลในการคลิกได้ชัดขึ้น"
        : "แคมเปญมีจำนวนชิ้นงานเพียงพอสำหรับทดสอบ แต่ควรทำจุดดึงคลิกให้เฉพาะเจาะจงขึ้นก่อนยิงแอด"
    },
    audienceTargeting: {
      primarySegment: input.marketing.segment,
      testSegments: [
        "พ่อแม่มือใหม่ที่กำลังหาตัวเลือกดูแลลูกที่ใช้ได้จริง",
        "ครอบครัวไทยที่เปรียบเทียบตัวเลือกสินค้าอย่างรอบคอบ",
        "คุณแม่ที่ตอบสนองกับคอนเทนต์แบบ checklist และให้ความมั่นใจ"
      ],
      exclusions: [
        "ผู้ใช้ที่ต้องการคำแนะนำทางการแพทย์โดยตรง",
        "กลุ่มนอกพื้นที่หรือเงื่อนไขการขายที่อนุมัติไว้",
        "กลุ่มความสนใจ parenting ที่กว้างเกินไปและไม่มี engagement ล่าสุด"
      ]
    },
    creativePerformance: {
      strongestHooks,
      weakSignals: [
        "หลีกเลี่ยงภาษาที่สื่อว่ารับประกันผลลัพธ์ทางสุขภาพหรือประสิทธิภาพ",
        "ใช้หนึ่งข้อความหลักต่อหนึ่งวิดีโอ เพื่อลดความสับสนตอนผู้ชมเลื่อนผ่าน"
      ],
      contentFeedback: [
        "นำฮุก checklist ที่แข็งแรงที่สุดไปใช้เป็น ad variant แรก",
        "เปลี่ยนข้อกังวลของลูกค้าเป็น caption สั้นสำหรับ retargeting",
        "ใช้ CTA แบบไม่กดดัน เช่น ทักแชทเพื่อขอรายละเอียด แทนการเร่งให้ซื้อทันที"
      ]
    },
    optimizationSuggestions: [
      "ทดสอบ 3 ฮุกโดยใช้ CTA เดียวกัน เพื่อดูผลของฮุกอย่างชัดเจน",
      "แยกกลุ่ม cold audience และ warm retargeting ออกจากกัน",
      "หยุด variant ที่ CTR ต่ำกว่า 0.8% หลังมี impression เพียงพอ",
      "นำ variant ที่มี save/comment สูงไปต่อยอดใน content batch ถัดไป"
    ],
    budgetEfficiency: {
      recommendation: "ใช้งบทดสอบขนาดเล็กหลังมนุษย์อนุมัติเท่านั้น ห้ามใช้เงินอัตโนมัติ",
      riskLevel: "medium",
      guardrail: "การเปลี่ยนงบหรือเปิดแอดจริงต้องได้รับอนุมัติจากมนุษย์/CFO และใช้ ads harness ที่ได้รับอนุมัติแล้ว"
    },
    reportingSummary: `Ads Performance AI ประเมินว่า Mother-and-baby TikTok Campaign มีโอกาสได้ CTR ประมาณ ${lowCtr.toFixed(1)}%-${highCtr.toFixed(1)}% หากยังใช้มุม checklist เป็นแกนหลัก`,
    learningSignals: [
      hasChecklistAngle ? "มุม checklist เป็นสัญญาณบวกสำหรับ paid test" : "แคมเปญควรมีจุดดึงคลิกที่คมขึ้นก่อน paid test",
      "กลุ่มพ่อแม่ต้องการ copy ที่สร้างความเชื่อมั่นและระวังการกล่าวอ้าง",
      "ควรวัด creative variants ด้วย CTR, saves, comments และข้อความสอบถามที่มีคุณภาพ"
    ],
    governanceNotes: [
      "ยังไม่มีการใช้เงินโฆษณาจริง",
      "ยังไม่มีการดำเนินการบนแพลตฟอร์มภายนอก",
      "คำกล่าวอ้างและการเปลี่ยนงบต้องได้รับอนุมัติชัดเจนก่อนใช้งานจริง"
    ]
  };
}
