export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      agent_status: "active" | "planning" | "running" | "completed" | "blocked";
      task_status: "todo" | "in_progress" | "review" | "done" | "blocked";
      task_priority: "low" | "medium" | "high" | "critical";
      memory_type: "fact" | "decision" | "preference" | "lesson" | "sop_improvement" | "report_summary";
    };
  };
};
