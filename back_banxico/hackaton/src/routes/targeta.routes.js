import { Router } from "express";
import { 
  createTarjeta, 
  getTarjetasByUsuario, 
  deleteTarjeta, 
  toggleTarjeta 
} from "../controllers/targeta.controller.js";

const router = Router();

// 🆕 Crear nueva tarjeta
router.post("/crear", createTarjeta);

// 🔍 Obtener tarjetas de un usuario
router.get("/usuario/:idUsuario", getTarjetasByUsuario);

// ❌ Eliminar tarjeta (baja lógica)
router.delete("/eliminar/:idTarjeta", deleteTarjeta);

// 🔄 Apagar / prender tarjeta
router.put("/toggle/:idTarjeta", toggleTarjeta);

export default router;