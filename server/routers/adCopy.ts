import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { saveAdCopy, getAdCopiesByUserId } from "../db";

export const adCopyRouter = router({
  generate: protectedProcedure
    .input(z.object({
      productName: z.string().min(1),
      productDescription: z.string().optional(),
      targetAudience: z.string().optional(),
      tone: z.string().optional(),
      objective: z.string().optional(),
      count: z.number().min(1).max(5).default(3),
    }))
    .mutation(async ({ ctx, input }) => {
      const { productName, productDescription, targetAudience, tone, objective, count } = input;

      const toneMap: Record<string, string> = {
        professional: "เป็นทางการ น่าเชื่อถือ",
        friendly: "เป็นกันเอง อบอุ่น",
        urgent: "สร้างความเร่งด่วน กระตุ้นการตัดสินใจ",
        emotional: "อารมณ์ความรู้สึก สร้างแรงบันดาลใจ",
        humorous: "ขำขัน สนุกสนาน",
      };

      const objectiveMap: Record<string, string> = {
        awareness: "สร้างการรับรู้แบรนด์",
        traffic: "เพิ่มการเข้าชมเว็บไซต์",
        leads: "สร้าง Lead / ลูกค้าเป้าหมาย",
        sales: "กระตุ้นยอดขาย",
        engagement: "เพิ่ม Engagement",
      };

      const toneDesc = toneMap[tone || "friendly"] || tone || "เป็นกันเอง";
      const objectiveDesc = objectiveMap[objective || "sales"] || objective || "กระตุ้นยอดขาย";

      const prompt = `คุณเป็นนักเขียนโฆษณา Facebook Ads มืออาชีพสำหรับตลาดไทย สร้างข้อความโฆษณา ${count} ชุด สำหรับ:

สินค้า: ${productName}
${productDescription ? `รายละเอียด: ${productDescription}` : ""}
${targetAudience ? `กลุ่มเป้าหมาย: ${targetAudience}` : ""}
โทนการสื่อสาร: ${toneDesc}
วัตถุประสงค์: ${objectiveDesc}

กฎสำคัญ:
- ไม่ใช้คำกล่าวอ้างทางการแพทย์ที่ไม่ได้รับการรับรอง
- ไม่ใช้คำว่า "รักษา", "หาย", "ยา" สำหรับสินค้าที่ไม่ใช่ยา
- ใช้ภาษาไทยที่เข้าใจง่าย
- Headline ไม่เกิน 40 ตัวอักษร
- Body ไม่เกิน 125 ตัวอักษร
- CTA ชัดเจนและกระตุ้นการกระทำ

ตอบเป็น JSON:
{
  "copies": [
    {
      "headline": "หัวข้อโฆษณา",
      "body": "เนื้อหาโฆษณา",
      "cta": "ปุ่ม Call-to-Action"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ad_copies",
            strict: true,
            schema: {
              type: "object",
              properties: {
                copies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      headline: { type: "string" },
                      body: { type: "string" },
                      cta: { type: "string" },
                    },
                    required: ["headline", "body", "cta"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["copies"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content as string | undefined;
      let generatedCopies: { headline: string; body: string; cta: string }[] = [];

      if (content) {
        const parsed = JSON.parse(content);
        generatedCopies = parsed.copies || [];
      }

      // Save to DB
      try {
        await saveAdCopy({
          userId: ctx.user.id,
          productName,
          productDescription: productDescription || null,
          targetAudience: targetAudience || null,
          tone: tone || null,
          objective: objective || null,
          generatedCopies,
        });
      } catch (dbErr) {
        console.error("Failed to save ad copy:", dbErr);
      }

      return { copies: generatedCopies };
    }),

  getHistory: protectedProcedure
    .query(async ({ ctx }) => {
      return getAdCopiesByUserId(ctx.user.id);
    }),
});
