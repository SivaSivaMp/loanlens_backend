import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { dsaController, leadController, customerController } from "@/container";
import {
  AgentListQuerySchema,
  UpdateCompanyProfileSchema,
  LeadListQuerySchema,
  AssignLeadSchema,
  UpdateLeadStatusSchema,
  UpdateLeadNotesSchema,
  CreateLeadSchema,
} from "@/application/dtos/dsa/dsa.dto";

const router = Router();

const companyAuth = [authenticate, authorize("COMPANY_DSA")] as const;
const agentAuth = [authenticate, authorize("FIELD_AGENT")] as const;

// ─── Company DSA Profile
router.get("/dsa/company/profile", ...companyAuth, dsaController.getProfile);
router.patch(
  "/dsa/company/profile",
  ...companyAuth,
  validate(UpdateCompanyProfileSchema),
  dsaController.updateProfile,
);

// ─── Agent Management
router.get(
  "/dsa/agents",
  ...companyAuth,
  validate(AgentListQuerySchema),
  dsaController.listAgentsHandler,
);
router.get(
  "/dsa/agents/:agentId",
  ...companyAuth,
  dsaController.getAgentDetailHandler,
);
router.patch(
  "/dsa/agents/:agentId/deactivate",
  ...companyAuth,
  dsaController.deactivateAgentHandler,
);
router.patch(
  "/dsa/agents/:agentId/reactivate",
  ...companyAuth,
  dsaController.reactivateAgentHandler,
);

// ─── DSA Leads (M13)
router.get(
  "/dsa/leads",
  ...companyAuth,
  validate(LeadListQuerySchema),
  leadController.listLeadsHandler,
);
router.post(
  "/dsa/leads",
  ...companyAuth,
  validate(CreateLeadSchema),
  leadController.createLeadHandler,
);
router.get(
  "/dsa/leads/:leadId",
  ...companyAuth,
  leadController.getLeadDetailHandler,
);
router.patch(
  "/dsa/leads/:leadId/assign",
  ...companyAuth,
  validate(AssignLeadSchema),
  leadController.assignLeadHandler,
);
router.patch(
  "/dsa/leads/:leadId/status",
  ...companyAuth,
  validate(UpdateLeadStatusSchema),
  leadController.updateLeadStatusHandler,
);
router.patch(
  "/dsa/leads/:leadId",
  ...companyAuth,
  validate(UpdateLeadNotesSchema),
  leadController.updateLeadNotesHandler,
);

// ─── Portal Customer Management ──────────────────────────────────────────────
// Lists portal users registered on the customer portal, visible to this DSA.
router.get(
  "/dsa/customers",
  ...companyAuth,
  customerController.listCustomersHandler,
);

// Toggle portal user isActive (blocks/unblocks portal login immediately via Redis).
router.patch(
  "/dsa/customers/:portalUserId/status",
  ...companyAuth,
  customerController.toggleCustomerStatusHandler,
);

export default router;
