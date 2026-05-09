import { PersistenceService } from "@/database/PersistenceService";
import type { AuthUser, UserProfile } from "@/auth/types";

const globalProfileOrganizationId = "00000000-0000-0000-0000-000000000000";

export class UserProfileService {
  constructor(private readonly persistence = new PersistenceService()) {}

  async getProfile(user: AuthUser): Promise<UserProfile> {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      locale: "en",
      timezone: "Asia/Bangkok",
      metadata: { source: user.isMocked ? "mock_auth_fallback" : "supabase_auth" }
    };
  }

  async updateProfile(user: AuthUser, updates: Partial<UserProfile>) {
    return this.persistence.upsert(
      "profiles",
      {
        id: user.id,
        organization_id: globalProfileOrganizationId,
        email: updates.email ?? user.email,
        display_name: updates.displayName ?? user.displayName,
        avatar_url: updates.avatarUrl,
        locale: updates.locale ?? "en",
        timezone: updates.timezone ?? "Asia/Bangkok",
        metadata: updates.metadata ?? {}
      },
      "id"
    );
  }

  async getPreferences(user: AuthUser) {
    return {
      userId: user.id,
      dashboardDefaultWorkspace: undefined,
      locale: "en",
      timezone: "Asia/Bangkok",
      metadata: {}
    };
  }
}
