import type { ContentCreatorStructuredOutput } from "@/modules/content-creator-agent/contracts";
import type { QualityCategory } from "@/modules/live-mvp/content-quality-evaluation";

export type ContentPackItemType = "hook" | "caption" | "script" | "cta" | "thumbnail" | "shooting_note" | "hashtag";

export type ContentPackQualityScore = {
  itemId: string;
  outputType: ContentPackItemType;
  outputIndex: number;
  text: string;
  score: number;
  category: QualityCategory;
  rationale: string;
};

export type ProductionContentPack = {
  schemaVersion: "production-content-pack.v1";
  campaignAngle: string;
  targetAudienceInsight: string;
  hooks: string[];
  captions: Array<{
    caption: string;
    hashtags: string[];
  }>;
  scripts: Array<{
    title: string;
    scenes: string[];
  }>;
  ctaOptions: string[];
  thumbnailTextIdeas: string[];
  shootingDirection: string[];
  hashtagSuggestions: string[];
  qualityScores: ContentPackQualityScore[];
  packSummary: {
    totalReviewableItems: number;
    averageQualityScore: number;
    readyForHumanReview: boolean;
    governanceNotes: string[];
  };
};

type ContentPackInput = {
  campaignBrief: string;
  productName?: string;
  targetAudience?: string;
  marketing: {
    segment: string;
    painPoints: string[];
    trustTriggers: string[];
    objections: string[];
    contentAngle: string;
  };
  content: ContentCreatorStructuredOutput;
};

export function buildProductionContentPack(input: ContentPackInput): ProductionContentPack {
  const productName = input.productName?.trim() || "ผลิตภัณฑ์แม่และเด็ก";
  const targetAudience = input.targetAudience?.trim() || input.marketing.segment;
  const hooks = ensureTenHooks(input.content.hooks, productName);
  const captions = ensureFiveCaptions(input.content.captions, productName);
  const scripts = ensureThreeScripts(input.content.scripts, productName);
  const ctaOptions = ensureCtas(input.content.ctas);
  const thumbnailTextIdeas = buildThumbnailTextIdeas(productName);
  const shootingDirection = buildShootingDirection(productName);
  const hashtagSuggestions = uniqueHashtags([
    ...captions.flatMap((caption) => caption.hashtags),
    "#แม่และเด็ก",
    "#ของใช้ลูกน้อย",
    "#แม่มือใหม่",
    "#TikTokขายของ",
    "#รีวิวของใช้เด็ก"
  ]);

  const qualityScores = buildQualityScores({
    hooks,
    captions,
    scripts,
    ctaOptions,
    thumbnailTextIdeas,
    shootingDirection,
    hashtagSuggestions
  });
  const averageQualityScore = roundScore(qualityScores.reduce((sum, item) => sum + item.score, 0) / qualityScores.length);

  return {
    schemaVersion: "production-content-pack.v1",
    campaignAngle: input.marketing.contentAngle || `คอนเทนต์ให้ความมั่นใจกับ ${targetAudience} ก่อนตัดสินใจซื้อ`,
    targetAudienceInsight: summarizeAudienceInsight(input.marketing, targetAudience),
    hooks,
    captions,
    scripts,
    ctaOptions,
    thumbnailTextIdeas,
    shootingDirection,
    hashtagSuggestions,
    qualityScores,
    packSummary: {
      totalReviewableItems: qualityScores.length,
      averageQualityScore,
      readyForHumanReview: true,
      governanceNotes: [
        "ต้องให้มนุษย์อนุมัติก่อนนำไปเผยแพร่ภายนอก",
        "หลีกเลี่ยงคำกล่าวอ้างด้านสุขภาพ ความปลอดภัย หรือผลลัพธ์ที่ไม่มีหลักฐานรองรับ",
        "รายการที่อนุมัติจะใช้เป็น pattern ที่ดีได้ ส่วนรายการที่ปฏิเสธจะใช้เป็นบทเรียนสำหรับปรับปรุง"
      ]
    }
  };
}

function ensureTenHooks(hooks: string[], productName: string) {
  return fillToCount(
    hooks.filter(Boolean),
    [
      `แม่มือใหม่ต้องเช็ก 3 เรื่องนี้ก่อนเลือก${productName}`,
      `ถ้าอยากให้ลูกสบายขึ้น ลองดูวิธีเลือก${productName}แบบนี้`,
      `ของใช้ลูกชิ้นนี้เหมาะกับบ้านแบบไหน ดูให้จบก่อนซื้อ`,
      `คุณแม่หลายคนพลาดจุดนี้เวลาเลือกของให้ลูก`,
      `เลือก${productName}ยังไงให้ใช้จริงในชีวิตประจำวัน`,
      `บ้านที่มีลูกเล็กควรรู้ ก่อนซื้อของใช้ชิ้นนี้`,
      `ไม่ต้องซื้อเยอะ แค่เลือกให้ตรงกับลูกและบ้านของเรา`,
      `เช็กลิสต์สั้นๆ สำหรับแม่ที่กำลังหา${productName}`,
      `ถ้าลูกใช้ทุกวัน คุณแม่ควรดูรายละเอียดตรงนี้ก่อน`,
      `รีวิวแบบแม่ใช้จริง: ${productName}ช่วยงานบ้านตรงไหนได้บ้าง`
    ],
    10
  );
}

function ensureFiveCaptions(captions: ContentCreatorStructuredOutput["captions"], productName: string) {
  return fillToCount(
    captions.filter((caption) => caption.caption?.trim()).map((caption) => ({
      caption: caption.caption,
      hashtags: uniqueHashtags(caption.hashtags)
    })),
    [
      {
        caption: `ก่อนเลือก${productName}ให้ลูก ลองดูจากการใช้งานจริงของบ้านเราเป็นหลัก เลือกแบบที่เข้าใจง่าย ใช้สะดวก และดูแลต่อได้ไม่ยุ่งยาก`,
        hashtags: ["#แม่และเด็ก", "#แม่มือใหม่", "#ของใช้ลูกน้อย"]
      },
      {
        caption: `คอนเทนต์นี้สรุปจุดที่คุณแม่ควรเช็กก่อนตัดสินใจ เหมาะกับทีมขายที่อยากตอบคำถามลูกค้าแบบจริงใจและไม่ขายแรงเกินไป`,
        hashtags: ["#TikTokขายของ", "#รีวิวของใช้เด็ก", "#ธุรกิจไทย"]
      },
      {
        caption: `ถ้ายังไม่แน่ใจว่า${productName}เหมาะกับบ้านคุณไหม ทักมาถามรายละเอียดได้ ทีมงานช่วยแนะนำตามการใช้งานจริงได้ค่ะ`,
        hashtags: ["#แม่และเด็ก", "#ถามก่อนซื้อ", "#ของใช้เด็ก"]
      },
      {
        caption: `แม่แต่ละบ้านมีเงื่อนไขไม่เหมือนกัน ลองดูมุมใช้งานจริงก่อนเลือก เพื่อให้ซื้อแล้วได้ใช้จริง ไม่วางทิ้งไว้เฉยๆ`,
        hashtags: ["#แม่มือใหม่", "#บ้านมีลูกเล็ก", "#เลือกของให้ลูก"]
      },
      {
        caption: `คลิปสั้นนี้เหมาะสำหรับเปิดการสนทนากับลูกค้า ให้เห็นปัญหา วิธีเลือก และเหตุผลที่ควรถามรายละเอียดก่อนซื้อ`,
        hashtags: ["#คอนเทนต์ขายของ", "#TikTokธุรกิจ", "#แม่และเด็ก"]
      }
    ],
    5
  );
}

function ensureThreeScripts(scripts: ContentCreatorStructuredOutput["scripts"], productName: string) {
  return fillToCount(
    scripts.filter((script) => script.title?.trim() && script.scenes?.length),
    [
      {
        title: "เช็กลิสต์ก่อนซื้อสำหรับแม่มือใหม่",
        scenes: [
          `เปิดคลิปด้วยภาพคุณแม่กำลังเปรียบเทียบ${productName}`,
          "พูด 3 จุดที่ควรเช็ก: ใช้งานง่าย เหมาะกับวัยลูก และดูแลต่อสะดวก",
          "ปิดด้วย CTA ให้ทักแชทเพื่อขอคำแนะนำตามการใช้งานจริง"
        ]
      },
      {
        title: "ปัญหาจริงในบ้านที่มีลูกเล็ก",
        scenes: [
          "เริ่มจากสถานการณ์บ้านยุ่ง ลูกต้องใช้ของหลายชิ้น",
          `โชว์ว่า${productName}เข้ามาช่วยให้งานประจำวันง่ายขึ้นอย่างไร โดยไม่กล่าวอ้างเกินจริง`,
          "สรุปว่าเหมาะกับบ้านแบบไหนและชวนถามรายละเอียด"
        ]
      },
      {
        title: "รีวิวแบบทีมขายตอบคำถามลูกค้า",
        scenes: [
          "ตั้งคำถามยอดฮิตจากคุณแม่ก่อนซื้อ",
          "ตอบด้วยภาษาง่าย มีภาพระยะใกล้ให้เห็นรายละเอียดสินค้า",
          "ปิดด้วยข้อความให้เซฟคลิปหรือทักแชทเพื่อดูตัวเลือก"
        ]
      }
    ],
    3
  );
}

function ensureCtas(ctas: string[]) {
  return fillToCount(
    ctas.filter(Boolean),
    [
      "ทักแชทเพื่อขอรายละเอียดก่อนตัดสินใจ",
      "คอมเมนต์คำว่า แม่ เพื่อรับเช็กลิสต์",
      "เซฟคลิปนี้ไว้ก่อนเลือกของให้ลูก",
      "ส่งคลิปนี้ให้คนที่กำลังเตรียมของให้ลูก",
      "ดูรายละเอียดสินค้าและถามทีมงานได้เลย"
    ],
    5
  );
}

function buildThumbnailTextIdeas(productName: string) {
  return [
    "แม่มือใหม่ต้องเช็ก",
    "ก่อนซื้อดูตรงนี้",
    "ใช้จริงในบ้านลูกเล็ก",
    `${productName} เหมาะกับใคร`,
    "อย่าซื้อก่อนรู้ข้อนี้"
  ];
}

function buildShootingDirection(productName: string) {
  return [
    "ถ่ายแนวตั้ง 9:16 แสงธรรมชาติ พื้นหลังบ้านจริงหรือมุมใช้งานจริง",
    `เปิด 2 วินาทีแรกด้วยมือหยิบ${productName}หรือสถานการณ์ที่คุณแม่เจอบ่อย`,
    "ใช้ช็อตใกล้เพื่อให้เห็นรายละเอียดสินค้า แต่หลีกเลี่ยงคำเคลมเกินจริงบนจอ",
    "ให้คนพูดใช้น้ำเสียงอบอุ่น เหมือนแนะนำกัน ไม่เร่งขาย",
    "ปิดคลิปด้วยภาพสินค้าและ CTA สั้นๆ ให้ทักแชทหรือเซฟคลิป"
  ];
}

function buildQualityScores(pack: {
  hooks: string[];
  captions: Array<{ caption: string; hashtags: string[] }>;
  scripts: Array<{ title: string; scenes: string[] }>;
  ctaOptions: string[];
  thumbnailTextIdeas: string[];
  shootingDirection: string[];
  hashtagSuggestions: string[];
}) {
  return [
    ...pack.hooks.map((text, index) => scoreItem("hook", index, text)),
    ...pack.captions.map((caption, index) => scoreItem("caption", index, `${caption.caption}\n${caption.hashtags.join(" ")}`)),
    ...pack.scripts.map((script, index) => scoreItem("script", index, `${script.title}: ${script.scenes.join(" ")}`)),
    ...pack.ctaOptions.map((text, index) => scoreItem("cta", index, text)),
    ...pack.thumbnailTextIdeas.map((text, index) => scoreItem("thumbnail", index, text)),
    ...pack.shootingDirection.map((text, index) => scoreItem("shooting_note", index, text)),
    ...pack.hashtagSuggestions.map((text, index) => scoreItem("hashtag", index, text))
  ];
}

function scoreItem(outputType: ContentPackItemType, outputIndex: number, text: string): ContentPackQualityScore {
  let score = 7;
  const hasThai = /[\u0E00-\u0E7F]/.test(text);
  const isSpecific = /(แม่|ลูก|เด็ก|บ้าน|TikTok|ทัก|เช็ก|ใช้จริง|สินค้า|คลิป)/.test(text);
  const hasUnsupportedClaim = /(หาย|รักษา|ดีที่สุด|เห็นผลทันที|การันตี|100%)/i.test(text);
  const isTooLongHook = outputType === "hook" && text.length > 110;
  const hasCta = /(ทัก|คอมเมนต์|เซฟ|ส่ง|ดูรายละเอียด|ถาม)/.test(text);

  if (hasThai) score += 0.8;
  if (isSpecific) score += 0.8;
  if (hasCta && (outputType === "caption" || outputType === "cta" || outputType === "script")) score += 0.5;
  if (text.length >= 18 && text.length <= 180) score += 0.4;
  if (hasUnsupportedClaim) score -= 2;
  if (isTooLongHook) score -= 0.8;
  if (outputType === "hashtag" && text.startsWith("#")) score += 0.5;

  const rounded = Math.max(1, Math.min(10, roundScore(score)));
  return {
    itemId: `${outputType}-${outputIndex}`,
    outputType,
    outputIndex,
    text,
    score: rounded,
    category: categorizeScore(rounded),
    rationale: buildRationale({ hasThai, isSpecific, hasCta, hasUnsupportedClaim, isTooLongHook })
  };
}

function buildRationale(flags: { hasThai: boolean; isSpecific: boolean; hasCta: boolean; hasUnsupportedClaim: boolean; isTooLongHook: boolean }) {
  if (flags.hasUnsupportedClaim) return "ควรรีวิวเพิ่ม เพราะข้อความอาจสื่อถึงผลลัพธ์หรือคำกล่าวอ้างที่ยังไม่มีหลักฐานรองรับ";
  if (flags.isTooLongHook) return "ไอเดียใช้ได้ แต่ฮุกควรสั้นลงเพื่อให้เหมาะกับการดึงคนดูบน TikTok";
  if (flags.hasThai && flags.isSpecific) return "ภาษาไทยชัดเจนและเชื่อมกับกลุ่มเป้าหมายได้ดี";
  if (flags.hasCta) return "มีคำชวนให้ผู้ชมทำต่อชัดเจน";
  return "เป็นร่างที่ใช้ต่อได้ แต่ควรให้มนุษย์รีวิวความเป็นธรรมชาติและความเหมาะสมกับธุรกิจก่อน";
}

function summarizeAudienceInsight(marketing: ContentPackInput["marketing"], targetAudience: string) {
  const painPoint = marketing.painPoints[0] ?? "ต้องการข้อมูลที่เข้าใจง่ายก่อนซื้อ";
  const trustTrigger = marketing.trustTriggers[0] ?? "รีวิวที่จริงใจและไม่กล่าวอ้างเกินจริง";
  return `${targetAudience} มักตัดสินใจจากความเข้าใจง่าย ความน่าเชื่อถือ และตัวอย่างใช้งานจริง จุดกังวลหลักคือ ${painPoint} ดังนั้นคอนเทนต์ควรใช้ ${trustTrigger} เป็นตัวนำ`;
}

function fillToCount<T>(existing: T[], fallbacks: T[], count: number) {
  const output = [...existing];
  for (const fallback of fallbacks) {
    if (output.length >= count) break;
    output.push(fallback);
  }
  return output.slice(0, count);
}

function uniqueHashtags(hashtags: string[]) {
  return Array.from(new Set(hashtags.filter(Boolean).map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)))).slice(0, 12);
}

function categorizeScore(score: number): QualityCategory {
  if (score >= 8.5) return "excellent";
  if (score >= 7) return "strong";
  if (score >= 5) return "needs_revision";
  return "reject";
}

function roundScore(score: number) {
  return Math.round(score * 10) / 10;
}
