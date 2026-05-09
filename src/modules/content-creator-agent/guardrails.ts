import type { ContentCreatorExecutionInput, ContentCreatorGuardrailReport, ContentCreatorStructuredOutput } from "@/modules/content-creator-agent/contracts";

const riskyClaimPatterns = ["cure", "guarantee", "100%", "หายขาด", "รับประกันผล", "รักษา"];

export function evaluateContentGuardrails(input: ContentCreatorExecutionInput, output: ContentCreatorStructuredOutput): ContentCreatorGuardrailReport {
  const combined = JSON.stringify(output).toLowerCase();
  const blockedClaims = riskyClaimPatterns.filter((pattern) => combined.includes(pattern.toLowerCase()));
  const requiredApprovals: string[] = [];

  if (blockedClaims.length) requiredApprovals.push("R&D or human approval required for claim validation");
  if (input.channel === "tiktok" || input.channel === "facebook" || input.channel === "instagram") {
    requiredApprovals.push("Human approval required before publishing externally");
  }

  return {
    passed: blockedClaims.length === 0,
    blockedClaims,
    requiredApprovals,
    notes: [
      "Output is draft-only and not published.",
      "Performance claims require analytics or evidence.",
      "Missing product facts are represented as assumptions."
    ]
  };
}
