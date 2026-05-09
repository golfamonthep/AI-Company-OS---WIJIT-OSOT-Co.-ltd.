export type BootstrapOrganizationInput = {
  userId: string;
  companyName: string;
};

export function buildDefaultOrganization(input: BootstrapOrganizationInput) {
  return {
    name: input.companyName,
    ownerUserId: input.userId,
    locale: "th",
    defaultAgentId: "ceo-ai"
  };
}
