export interface IEmailService {
  sendVerificationEmail(
    to: string,
    token: string,
    name?: string,
  ): Promise<void>;

  sendPasswordResetEmail(
    to: string,
    token: string,
    name?: string,
  ): Promise<void>;
  sendWelcomeEmail(to: string, name: string): Promise<void>;

  sendProposalNotification(to: string, customerName: string): Promise<void>;

  sendRateChangeNotification(
    to: string,
    productName: string,
    oldRate: number,
    newRate: number,
  ): Promise<void>;
}
