export function getMarkdownSection(markdown: string, heading: string) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, "im");
  const match = markdown.match(pattern);
  return match?.[1]?.trim();
}

export function requireMarkdownSection(markdown: string, heading: string, fileLabel: string) {
  const section = getMarkdownSection(markdown, heading);
  if (!section) {
    throw new MarkdownContractError(fileLabel, [`Missing required section: ${heading}`]);
  }
  return section;
}

export function assertMarkdownSections(markdown: string, headings: string[], fileLabel: string) {
  const errors = headings.filter((heading) => !getMarkdownSection(markdown, heading)).map((heading) => `Missing required section: ${heading}`);
  if (errors.length) {
    throw new MarkdownContractError(fileLabel, errors);
  }
}

export function getMarkdownList(markdown: string, heading: string) {
  return splitList(getMarkdownSection(markdown, heading));
}

export function splitList(section?: string) {
  if (!section) return [];
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || /^\d+\./.test(line))
    .map((line) => line.replace(/^-\s*/, "").replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export class MarkdownContractError extends Error {
  constructor(
    readonly fileLabel: string,
    readonly violations: string[]
  ) {
    super(`${fileLabel} failed runtime contract validation: ${violations.join("; ")}`);
    this.name = "MarkdownContractError";
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
