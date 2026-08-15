export type EscrowLifecycleState =
  | "CREATED"
  | "PAYMENT_PENDING"
  | "FUNDED"
  | "PRODUCTION_STARTED"
  | "SHIPPED"
  | "DELIVERED"
  | "RELEASED"
  | "REFUNDED";

export const ESCROW_TRANSITION_RULES: Record<EscrowLifecycleState, EscrowLifecycleState[]> = {
  CREATED: ["PAYMENT_PENDING", "REFUNDED"],
  PAYMENT_PENDING: ["FUNDED", "REFUNDED"],
  FUNDED: ["PRODUCTION_STARTED", "REFUNDED"],
  PRODUCTION_STARTED: ["SHIPPED", "REFUNDED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RELEASED", "REFUNDED"],
  RELEASED: [], // Terminal state
  REFUNDED: [], // Terminal state
};

export class EscrowStateMachine {
  /**
   * Validates if a state transition is legal under Anamon Escrow rules
   */
  static isValidTransition(from: EscrowLifecycleState, to: EscrowLifecycleState): boolean {
    const allowed = ESCROW_TRANSITION_RULES[from] || [];
    return allowed.includes(to);
  }

  /**
   * Performs transition or throws descriptive domain error
   */
  static transition(from: EscrowLifecycleState, to: EscrowLifecycleState): EscrowLifecycleState {
    if (!this.isValidTransition(from, to)) {
      throw new Error(
        `Invalid escrow state transition from '${from}' to '${to}'. Allowed transitions: [${(ESCROW_TRANSITION_RULES[from] || []).join(", ")}]`
      );
    }
    return to;
  }
}
