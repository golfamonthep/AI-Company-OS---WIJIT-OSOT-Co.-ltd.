import { createSupabaseAnonClient } from "@/database/supabaseClient";
import type { AuthSession, AuthUser } from "@/auth/types";

const mockUserId = "00000000-0000-0000-0000-000000000101";

export class AuthService {
  async getCurrentUser(request?: Request): Promise<AuthUser> {
    const session = await this.getCurrentSession(request);
    return session.user;
  }

  async getCurrentSession(request?: Request): Promise<AuthSession> {
    const authorization = request?.headers.get("authorization");
    const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;
    const runtime = createSupabaseAnonClient();

    if (bearerToken && runtime.client) {
      const result = await runtime.client.auth.getUser(bearerToken);
      if (result.data.user) {
        return {
          user: {
            id: result.data.user.id,
            email: result.data.user.email ?? undefined,
            displayName: result.data.user.user_metadata?.name ?? result.data.user.email ?? "Authenticated user",
            isMocked: false
          },
          accessToken: bearerToken,
          isMocked: false
        };
      }
    }

    return this.getMockSession(request);
  }

  getMockSession(request?: Request): AuthSession {
    const userId = request?.headers.get("x-user-id") ?? mockUserId;
    const email = request?.headers.get("x-user-email") ?? "owner@ai-company-os.local";
    const displayName = request?.headers.get("x-user-name") ?? "Demo Owner";

    return {
      user: { id: userId, email, displayName, isMocked: true },
      isMocked: true
    };
  }
}
