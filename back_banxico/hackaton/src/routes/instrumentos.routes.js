import express from "express";
import { 
  add_instrumento,
  getall_instrumentos,
  getbyid_instrumento
} from "../controllers/instrumentos.controller.js";

const router = express.Router();

// Crear nuevo instrumento
router.post("/", add_instrumento);

// Obtener todos los instrumentos
router.get("/", getall_instrumentos);

// Obtener instrumento por ID
router.get("/:idinstrumento", getbyid_instrumento);

export default router;
