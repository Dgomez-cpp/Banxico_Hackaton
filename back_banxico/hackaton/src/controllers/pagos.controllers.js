import crypto from "crypto";
import { getConnection, sql } from "../config/db.js";

// Realizar un pago entre cuentas
// === Tu initiatePayment CORREGIDO ===
// === Tu initiatePayment CORREGIDO ===
export const initiatePayment = async (req, res) => {
  try {
    // 1. Recibir datos (Esto está bien)
    const { idCuentaOrigen, numeroTarjetaDestino, monto, referencia } = req.body;
    const pool = await getConnection();

    // 2. Buscar idCuentaDestino (Esto está bien)
    const tarjetaResult = await pool.request()
      .input("numeroTarjeta", sql.NVarChar(25), numeroTarjetaDestino)
      .query(`
        SELECT idCuenta 
        FROM Tarjetas 
        WHERE numeroTarjeta = @numeroTarjeta 
          AND activa = 1 
          AND (eliminada = 0 OR eliminada IS NULL)
      `);

    if (tarjetaResult.recordset.length === 0) {
      return res.status(404).json({ mensaje: "La tarjeta de destino no existe o no está activa." });
    }

    const idCuentaDestino = tarjetaResult.recordset[0].idCuenta;

    // 3. Validación de auto-pago (Esto está bien)
    if (idCuentaOrigen === idCuentaDestino) {
      return res.status(400).json({ mensaje: "No puedes realizar un pago a tu propia cuenta." });
    }

    // 4. Ejecutar el pago (Esto está bien)
    await pool.request()
      .input("idCuentaOrigen", sql.Int, idCuentaOrigen)
      .input("idCuentaDestino", sql.Int, idCuentaDestino)
      .input("monto", sql.Decimal(18, 2), monto)
      .input("referencia", sql.NVarChar(100), referencia)
      .execute("sp_initiate_payment");

    // 5. Generar hash (Esto está bien)
    const data = JSON.stringify({ idCuentaOrigen, idCuentaDestino, monto, referencia });
    const hashActual = crypto.createHash("sha256").update(data).digest("hex");
    
    // === 6. CORRECCIÓN: Auditoría completada ===
    
    // Registrar auditoría para la cuenta origen (envío)
    await pool.request()
      .input("entidad", sql.NVarChar(100), "Pagos")
      .input("idEntidad", sql.Int, idCuentaOrigen) // <-- El ID de la cuenta que envía
      .input("accion", sql.NVarChar(50), "TRANSFERENCIA_SALIENTE")
      .input("hashActual", sql.NVarChar(255), hashActual)
      .execute("sp_log_event");

    // Registrar auditoría para la cuenta destino (recepción)
    await pool.request()
      .input("entidad", sql.NVarChar(100), "Pagos")
      .input("idEntidad", sql.Int, idCuentaDestino) // <-- El ID de la cuenta que recibe
      .input("accion", sql.NVarChar(50), "TRANSFERENCIA_ENTRANTE")
      .input("hashActual", sql.NVarChar(255), hashActual)
      .execute("sp_log_event");

    // === FIN DE LA CORRECCIÓN ===

    res.status(200).json({ mensaje: "Pago realizado y auditado correctamente" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al procesar el pago", error: error.message });
  }
};

// Obtener historial de pagos por usuario
export const getHistorialPagos = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input("idUsuario", sql.Int, idUsuario)
      .execute("sp_get_historial_pagos");

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el historial", error: error.message });
  }
};