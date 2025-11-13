import { Router } from "express";
import { initiatePayment, getHistorialPagos } from "../controllers/pagos.controllers.js";

const router = Router();

router.post("/iniciar", initiatePayment);
router.get("/historial/:idUsuario", getHistorialPagos);

export default router;
