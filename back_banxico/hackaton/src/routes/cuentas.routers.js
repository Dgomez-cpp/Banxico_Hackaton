import { Router } from "express";
import { getBalance, createCuenta } from "../controllers/cuentas.controller.js";

const router = Router();

router.get("/balance/:idUsuario", getBalance);
router.post("/crear", createCuenta);

export default router;
