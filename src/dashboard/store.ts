"use client";

import { create } from "zustand";
import type { DashboardSection } from "@/dashboard/types";

type DashboardState = {
  activeSection: DashboardSection;
  selectedAgentId: string;
  approvalFocusId: string;
  memoryQuery: string;
  realtimeMode: "demo" | "event-stream-ready";
  setActiveSection: (section: DashboardSection) => void;
  setSelectedAgentId: (agentId: string) => void;
  setApprovalFocusId: (approvalId: string) => void;
  setMemoryQuery: (query: string) => void;
};

export const useControlCenterStore = create<DashboardState>((set) => ({
  activeSection: "overview",
  selectedAgentId: "ceo",
  approvalFocusId: "approval-publish-001",
  memoryQuery: "",
  realtimeMode: "event-stream-ready",
  setActiveSection: (activeSection) => set({ activeSection }),
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
  setApprovalFocusId: (approvalFocusId) => set({ approvalFocusId }),
  setMemoryQuery: (memoryQuery) => set({ memoryQuery })
}));
