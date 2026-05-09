import type { ContentCreatorExecutionInput, SelectedContentSkill } from "@/modules/content-creator-agent/contracts";

export function selectContentCreatorSkills(input: ContentCreatorExecutionInput): SelectedContentSkill[] {
  const skills = new Set<SelectedContentSkill>(["hook_generation", "caption_writing", "cta_generation", "storytelling"]);
  const channel = input.channel ?? "tiktok";
  const brief = input.brief.toLowerCase();

  if (channel === "tiktok" || brief.includes("tiktok") || brief.includes("video")) {
    skills.add("tiktok_scripting");
  }

  if (brief.includes("viral") || brief.includes("trend") || brief.includes("engagement")) {
    skills.add("viral_content_analysis");
  }

  return Array.from(skills);
}
