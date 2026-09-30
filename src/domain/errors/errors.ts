import { DomainError } from "./DomainError";

//Authenthication errors

export class EmailAlreadyExistsError extends DomainError {
  constructor() {
    super(
      "An account with this email already exists",
      "EMAIL_ALREADY_EXISTS",
      409,
    );
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("Invalid email or password", "INVALID_CREDENTIALS", 401);
  }
}

export class AccountDisabledError extends DomainError {
  constructor() {
    super(
      "Your account has been disabled. Please contact support.",
      "ACCOUNT_DISABLED",
      403,
    );
  }
}

export class EmailNotVerifiedError extends DomainError {
  constructor() {
    super(
      "Please verify your email before logging in",
      "EMAIL_NOT_VERIFIED",
      403,
    );
  }
}

export class InvalidTokenError extends DomainError {
  constructor(detail = "Invalid or expired token") {
    super(detail, "INVALID_TOKEN", 401);
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super("Token has expired", "TOKEN_EXPIRED", 401);
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super("User not found", "USER_NOT_FOUND", 404);
  }
}

//resource error

export class ResourceNotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} not found`, "RESOURCE_NOT_FOUND", 404);
  }
}

export class ForbiddenError extends DomainError {
  constructor(detail = "You do not have permission to perform this action") {
    super(detail, "FORBIDDEN", 403);
  }
}

//company dsa errors

export class CompanyNotFoundError extends DomainError {
  constructor() {
    super("Company profile not found", "COMPANY_NOT_FOUND", 404);
  }
}

//Field agent Errors

export class AgentNotFoundError extends DomainError {
  constructor() {
    super("Agent not found", "AGENT_NOT_FOUND", 404);
  }
}

export class AgentNotInCompanyError extends DomainError {
  constructor() {
    super("Agent does not belong to your company", "AGENT_NOT_IN_COMPANY", 403);
  }
}

export class AgentAlreadyInactiveError extends DomainError {
  constructor() {
    super("Agent is already deactivated", "AGENT_ALREADY_INACTIVE", 409);
  }
}

//Lead errors

export class LeadNotFoundError extends DomainError {
  constructor() {
    super("Lead not found", "LEAD_NOT_FOUND", 404);
  }
}

export class PortalUserNotFoundError extends DomainError {
  constructor() {
    super("Portal user not found", "PORTAL_USER_NOT_FOUND", 404);
  }
}

//Bank Errors
export class BankNotFoundError extends DomainError {
  constructor() {
    super("Bank profile not found", "BANK_NOT_FOUND", 404);
  }
}

export class BankAlreadyInactiveError extends DomainError {
  constructor() {
    super("Bank is already deactivated", "BANK_ALREADY_INACTIVE", 409);
  }
}

//Product Errors

export class ProductNotFoundError extends DomainError {
  constructor() {
    super("Product not found", "PRODUCT_NOT_FOUND", 404);
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      `Cannot transition product status from ${from} to ${to}`,
      "INVALID_STATUS_TRANSITION",
      422,
    );
  }
}

export class ProductOwnershipError extends DomainError {
  constructor() {
    super("You do not own this product", "PRODUCT_OWNERSHIP_ERROR", 403);
  }
}

// Agreement Errors

export class AgreementAlreadyExistsError extends DomainError {
  constructor() {
    super(
      "An agreement with this bank already exists",
      "AGREEMENT_ALREADY_EXISTS",
      409,
    );
  }
}

export class AgreementNotFoundError extends DomainError {
  constructor() {
    super("No agreement found with this bank", "AGREEMENT_NOT_FOUND", 404);
  }
}

// Split Rule Errors

export class SplitRuleNotFoundError extends DomainError {
  constructor() {
    super("Split rule not found", "SPLIT_RULE_NOT_FOUND", 404);
  }
}

export class SplitRuleOwnershipError extends DomainError {
  constructor() {
    super(
      "This split rule does not belong to your company",
      "SPLIT_RULE_OWNERSHIP_ERROR",
      403,
    );
  }
}
