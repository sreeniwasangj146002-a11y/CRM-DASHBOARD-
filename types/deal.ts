export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export const DEAL_STAGES: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  company: string;
  value: number;
  stage: DealStage;
  owner: string;
  expectedCloseDate: string; // ISO date
  notes: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export type DealDoc = Deal;

/** Payload for creating/editing a deal via the form. */
export interface DealInput {
  title: string;
  customerId: string;
  value: number;
  stage: DealStage;
  owner: string;
  expectedCloseDate: string;
  notes: string;
}
