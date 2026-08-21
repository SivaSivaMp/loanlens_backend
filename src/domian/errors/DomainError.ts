/**
 * Base class for all domain errors.
 * Domain errors are "expected" business rule violations — not bugs.
 * They carry a machine-readable errorCode so the presentation layer
 * can translate them into the right HTTP status and response body.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'DomainError'
    // Restore prototype chain (required for instanceof to work with extends Error in TS)
    Object.setPrototypeOf(this, DomainError.prototype)
  }
}
