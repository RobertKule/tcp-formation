export const CANDIDATE_STATUS = {
  PENDING: "PENDING",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  FULLY_PAID: "FULLY_PAID",
  REJECTED: "REJECTED",
} as const;

export const PAYMENT_MODE = {
  CASH: "CASH",
  MOBILE_MONEY: "MOBILE_MONEY",
} as const;

export type CandidateStatus = keyof typeof CANDIDATE_STATUS;
export type PaymentMode = keyof typeof PAYMENT_MODE;
