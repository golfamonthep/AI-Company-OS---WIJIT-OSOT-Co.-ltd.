import { ControlCenterDashboard } from "@/dashboard/components/ControlCenterDashboard";
import { getDashboardWorkspaceSession } from "@/server/workspace";

export default async function DashboardPage() {
  const workspaceSession = await getDashboardWorkspaceSession();
  return <ControlCenterDashboard workspaceSession={workspaceSession} />;
}
