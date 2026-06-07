import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { saveAdAnalysis, getAdAnalysesByUserId, deleteAdAnalysis } from "../db";

export const adAnalysisRouter = router({
  analyze: protectedProcedure
    .input(z.object({
      budget: z.number().min(0),
      impressions: z.number().min(0),
      clicks: z.number().min(0),
      conversions: z.number().min(0),
      revenue: z.number().min(0),
      productType: z.string(),
      targetAudience: z.string().optional(),
      adContent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { budget, impressions, clicks, conversions, revenue, productType, targetAudience, adContent } = input;

      // Calculate base metrics
      const roas = budget > 0 ? revenue / budget : 0;
      const cpc = clicks > 0 ? budget / clicks : 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

      // Rule-based compliance check
      const complianceIssues: string[] = [];
      const healthKeywords = ["รักษา", "หายจาก", "ยา", "โรค", "อาการ", "ผ่าตัด", "cure", "treat", "heal", "disease"];
      if (adContent) {
        const hasHealthClaims = healthKeywords.some(kw => adContent.toLowerCase().includes(kw.toLowerCase()));
        if (hasHealthClaims) {
          complianceIssues.push("ตรวจพบคำกล่าวอ้างเกี่ยวกับสุขภาพ - อาจละเมิดนโยบาย Facebook Ads");
        }
        if (adContent.length > 0 && adContent.toUpperCase() === adContent && adContent.length > 20) {
          complianceIssues.push("ข้อความโฆษณาใช้ตัวพิมพ์ใหญ่ทั้งหมด - อาจถูก Facebook ปฏิเสธ");
        }
      }

      // Rule-based score
      let score = 100;
      if (roas < 1) score -= 30;
      else if (roas < 1.5) score -= 20;
      else if (roas < 2.5) score -= 10;
      if (ctr < 1) score -= 15;
      else if (ctr < 1.5) score -= 8;
      if (conversionRate < 1) score -= 15;
      else if (conversionRate < 2) score -= 8;
      if (cpc > 50) score -= 10;
      if (complianceIssues.length > 0) score -= 15;
      score = Math.max(0, score);

      // AI analysis
      let aiAnalysis = "";
      let recommendations: string[] = [];
      try {
        const prompt = `คุณเป็นผู้เชี่ยวชาญด้าน Facebook Ads สำหรับธุรกิจไทย วิเคราะห์ผลการโฆษณาต่อไปนี้และให้คำแนะนำเป็นภาษาไทย:

ข้อมูลโฆษณา:
- ประเภทสินค้า: ${productType}
- กลุ่มเป้าหมาย: ${targetAudience || "ไม่ระบุ"}
- งบประมาณ: ${budget} บาท
- Impressions: ${impressions.toLocaleString()}
- Clicks: ${clicks.toLocaleString()}
- Conversions: ${conversions}
- รายได้: ${revenue} บาท
- ROAS: ${roas.toFixed(2)}x
- CTR: ${ctr.toFixed(2)}%
- CPC: ${cpc.toFixed(2)} บาท
- Conversion Rate: ${conversionRate.toFixed(2)}%
${adContent ? `- เนื้อหาโฆษณา: "${adContent.substring(0, 200)}"` : ""}

กรุณาวิเคราะห์และให้:
1. สรุปภาพรวมประสิทธิภาพ (2-3 ประโยค)
2. จุดแข็งของแคมเปญ
3. จุดที่ต้องปรับปรุง
4. คำแนะนำเชิงปฏิบัติ 5 ข้อ (เฉพาะเจาะจงสำหรับสินค้าประเภทนี้)

ตอบเป็น JSON format:
{
  "summary": "สรุปภาพรวม",
  "strengths": ["จุดแข็ง 1", "จุดแข็ง 2"],
  "weaknesses": ["จุดอ่อน 1", "จุดอ่อน 2"],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2", "คำแนะนำ 3", "คำแนะนำ 4", "คำแนะนำ 5"]
}`;

        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "ad_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } },
                },
                required: ["summary", "strengths", "weaknesses", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content as string | undefined;
        if (content) {
          const parsed = JSON.parse(content);
          aiAnalysis = parsed.summary;
          recommendations = parsed.recommendations || [];
          // Add strengths/weaknesses to recommendations for display
          if (parsed.strengths?.length) {
            recommendations = [
              ...parsed.strengths.map((s: string) => `✅ จุดแข็ง: ${s}`),
              ...parsed.weaknesses.map((w: string) => `⚠️ ปรับปรุง: ${w}`),
              ...parsed.recommendations,
            ];
          }
        }
      } catch (err) {
        console.error("AI analysis failed:", err);
        // Fallback rule-based recommendations
        if (roas < 1.5) recommendations.push("ROAS ต่ำกว่า 1.5x - ต้องปรับปรุงกลยุทธ์ targeting และ creative");
        else if (roas >= 2.5) recommendations.push("ROAS ดีเยี่ยม (>2.5x) - พิจารณาเพิ่ม Budget เพื่อ Scale");
        if (ctr < 1.5) recommendations.push("CTR ต่ำ - ปรับปรุง Creative หรือ Headline ให้น่าสนใจมากขึ้น");
        if (conversionRate < 1) recommendations.push("Conversion Rate ต่ำ - ตรวจสอบ Landing Page และ Call-to-Action");
        if (cpc > 50) recommendations.push("CPC สูง - ลองปรับปรุง Audience Targeting เพื่อลดค่าใช้จ่าย");
        recommendations.push("ทดสอบ A/B Testing กับ Creative ที่แตกต่างกัน 3-5 ชิ้น");
      }

      // Save to DB
      try {
        await saveAdAnalysis({
          userId: ctx.user.id,
          budget,
          impressions,
          clicks,
          conversions,
          revenue,
          productType,
          targetAudience: targetAudience || null,
          adContent: adContent || null,
          roas: parseFloat(roas.toFixed(4)),
          cpc: parseFloat(cpc.toFixed(4)),
          ctr: parseFloat(ctr.toFixed(4)),
          conversionRate: parseFloat(conversionRate.toFixed(4)),
          score,
          complianceIssues,
          recommendations,
          aiAnalysis,
        });
      } catch (dbErr) {
        console.error("Failed to save analysis:", dbErr);
      }

      return {
        roas: parseFloat(roas.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        score,
        complianceIssues,
        recommendations,
        aiAnalysis,
      };
    }),

  getHistory: protectedProcedure
    .query(async ({ ctx }) => {
      return getAdAnalysesByUserId(ctx.user.id);
    }),

  deleteHistory: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteAdAnalysis(input.id, ctx.user.id);
      return { success: true };
    }),
});
