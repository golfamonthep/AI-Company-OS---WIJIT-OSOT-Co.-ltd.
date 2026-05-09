import { routeHandler } from "@/server/api/routeHandler";
import { parseJsonBody } from "@/server/api/validation";
import { validateSkillOutputSchema } from "@/server/api/schemas";

export function POST(request: Request) {
  return routeHandler(async () => {
    const body = await parseJsonBody(request, validateSkillOutputSchema);
    const missingChecklistItems = body.checklist.filter((item) => !JSON.stringify(body.output).toLowerCase().includes(item.toLowerCase()));
    return {
      skillId: body.skillId,
      valid: missingChecklistItems.length === 0,
      missingChecklistItems,
      validationMode: "lightweight_api_check"
    };
  });
}
