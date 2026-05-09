import { describe, expect, it } from "vitest";
import { RolePermissionService } from "@/auth/RolePermissionService";

describe("API permission flow", () => {
  const permissions = new RolePermissionService();

  it("allows operators to start workflows but not approve operations", () => {
    expect(permissions.hasPermission("operator", "workflow:start")).toBe(true);
    expect(permissions.canApprove("operator", "normal")).toBe(false);
  });

  it("keeps viewers read-only", () => {
    expect(permissions.hasPermission("viewer", "dashboard:view")).toBe(true);
    expect(permissions.hasPermission("viewer", "workflow:start")).toBe(false);
    expect(permissions.hasPermission("viewer", "integration:write")).toBe(false);
  });

  it("reserves high-impact approvals for owners", () => {
    expect(permissions.canApprove("owner", "high")).toBe(true);
    expect(permissions.canApprove("admin", "high")).toBe(false);
    expect(permissions.canApprove("manager", "high")).toBe(false);
  });
});
