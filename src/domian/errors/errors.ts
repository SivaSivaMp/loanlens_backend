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
