import { z } from "zod";

//Bank Profile

export const UpdateBankProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    contactPhone: z.string().min(10).max(15).optional(),
    websiteUrl: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
    gstin: z.string().length(15).optional(),
    licenceNumber: z.string().optional(),
  }),
});

export type UpdateBankProfileDto = z.infer<
  typeof UpdateBankProfileSchema
>["body"];
