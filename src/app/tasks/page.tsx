import { ControlCenterShell } from "@/components/dashboard/control-center-shell";
import { TaskDelegationBoard } from "@/components/tasks/task-delegation-board";

export default function TasksPage() {
  return (
    <ControlCenterShell>
      <TaskDelegationBoard />
    </ControlCenterShell>
  );
}
