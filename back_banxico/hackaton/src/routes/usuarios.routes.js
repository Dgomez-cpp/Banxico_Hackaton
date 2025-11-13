import express from "express";
import { 
  register_usuario,
  update_usuario,
  login_usuario,
  get_usuario_by_id
} from "../controllers/usuarios.controller.js";

const router = express.Router();

// Registrar usuario
router.post("/registro", register_usuario);

// Login usuario
router.post("/login", login_usuario);

// Obtener usuario por ID
router.get("/:idusuario", get_usuario_by_id);

// Actualizar usuario
router.put("/:idusuario", update_usuario);

export default router;
