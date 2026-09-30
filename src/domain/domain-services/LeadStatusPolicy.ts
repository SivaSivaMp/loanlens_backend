import { LeadStatus } from "../entities/Lead";

/**
 * Domain Service: LeadStatusPolicy
 *
 * Contains business rules that govern how a lead status
 * affects related domain objects (e.g., the associated portal user).
 * Lives here because the rule spans Lead and PortalUser entities.
 */
export class LeadStatusPolicy {
  /**
   * Determines whether the portal user linked to a lead should remain
   * active, based on the lead current status.
   *
   * Business rule: A portal user is deactivated only when their lead
   * reaches a terminal state (CLOSED or REJECTED).
   */
  static shouldPortalUserBeActive(status: LeadStatus): boolean {
    return status !== "CLOSED" && status !== "REJECTED";
  }
}
