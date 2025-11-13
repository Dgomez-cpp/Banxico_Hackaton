import express from "express";
import {
  add_obligacion,
  get_obligaciones,
  pagar_obligacion
} from "../controllers/obligaciones.controller.js";

const router = express.Router();

// Crear nueva obligación
router.post("/", add_obligacion);

// Obtener obligaciones por usuario
router.get("/:idusuario", get_obligaciones);

// Pagar obligación
router.post("/pagar", pagar_obligacion);

export default router;
