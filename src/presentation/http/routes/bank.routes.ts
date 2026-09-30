import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

const bankAuth = [authenticate, authorize("BANK_ADMIN")];

//Bank Profile
router.get("/banks/mine", ...bankAuth);
