import { z } from "zod";

//company profile
export const UpdateCompanyProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).optional(),
    gstin: z
      .string()
      .length(15, "GSTIN must be exactly 15 characters")
      .optional(),
  }),
});
export type UpdateCompanyProfileDto = z.infer<
  typeof UpdateCompanyProfileSchema
>["body"];

//Invite agent

export const InviteAgentSchema = z.object({
  body: z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
  }),
});
export type InviteAgentDto = z.infer<typeof InviteAgentSchema>["body"];

//Agent List Query

export const AgentListQuerySchema = z.object({
  query: z.object({
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((v) =>
        v === "true" ? true : v === "false" ? false : undefined,
      ),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export type AgentListQueryDto = z.infer<typeof AgentListQuerySchema>["query"];

//Update Agent Profile (field agent updating own)

export const UpdateAgentProfileSchema = z.object({
  body: z.object({
    phone: z.string().min(10).max(15).optional(),
    bankAccountNumber: z.string().min(5).optional(),
    ifscCode: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code")
      .optional(),
    pan: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN")
      .optional(),
  }),
});
export type UpdateAgentProfileDto = z.infer<
  typeof UpdateAgentProfileSchema
>["body"];

//Bank Agreement
export const CreateAgreementSchema = z.object({
  body: z.object({
    agreedCommissionRate: z.number().min(0).max(10).optional(),
    notes: z.string().optional(),
  }),
});
export type CreateAgreementDto = z.infer<typeof CreateAgreementSchema>["body"];

export const ToggleAgreementSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});
export type ToggleAgreementDto = z.infer<typeof ToggleAgreementSchema>["body"];

export const BankListQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});
export type BankListQueryDto = z.infer<typeof BankListQuerySchema>["query"];

//Commission Split Rules
export const CreateSplitRuleSchema = z.object({
  body: z.object({
    fieldAgentId: z.string().optional().nullable(),
    productId: z.string().optional().nullable(),
    agentPercent: z.number().min(0).max(100),
    effectiveFrom: z
      .string()
      .datetime()
      .optional()
      .transform((v) => (v ? new Date(v) : new Date())),
  }),
});
export type CreateSplitRuleDto = z.infer<typeof CreateSplitRuleSchema>["body"];

export const UpdateSplitRuleSchema = z.object({
  body: z.object({
    agentPercent: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});
export type UpdateSplitRuleDto = z.infer<typeof UpdateSplitRuleSchema>["body"];

//  DSA Leads (M13)

export const LeadListQuerySchema = z.object({
  query: z.object({
    status: z
      .enum([
        "PENDING",
        "ASSIGNED",
        "PROPOSAL_SENT",
        "CONFIRMED",
        "REJECTED",
        "CLOSED",
      ])
      .optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(15),
  }),
});
export type LeadListQueryDto = z.infer<typeof LeadListQuerySchema>["query"];

export const AssignLeadSchema = z.object({
  body: z.object({ fieldAgentId: z.string().min(1) }),
});
export type AssignLeadDto = z.infer<typeof AssignLeadSchema>["body"];

export const UpdateLeadStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "PENDING",
      "ASSIGNED",
      "PROPOSAL_SENT",
      "CONFIRMED",
      "REJECTED",
      "CLOSED",
    ]),
  }),
});
export type UpdateLeadStatusDto = z.infer<
  typeof UpdateLeadStatusSchema
>["body"];

export const UpdateLeadNotesSchema = z.object({
  body: z.object({ internalNotes: z.string() }),
});
export type UpdateLeadNotesDto = z.infer<typeof UpdateLeadNotesSchema>["body"];

export const CreateLeadSchema = z.object({
  body: z.object({
    loanType: z.enum(["HOME", "PERSONAL", "CAR", "BUSINESS", "GOLD", "LAP"]),
    requiredAmount: z.number().positive(),
    interestedProduct: z.string().optional(),
    customerNote: z.string().optional(),
    portalUserId: z.string().min(1),
  }),
});
export type CreateLeadDto = z.infer<typeof CreateLeadSchema>["body"];
