import {Router } from "express";
import { logEvent, getAuditTrail} from "../controllers/audit.controllers.js";

const router = Router();

router.post("/registrar", logEvent);
router.get("/:entidad/:idEntidad", getAuditTrail);

export default router;