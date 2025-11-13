import { getConnection, sql } from "../config/db.js";

// Registrar evento de auditoría
export const logEvent = async (req, res) => {
  try {
    const { entidad, idEntidad, accion, hashActual, hashPrevio } = req.body;
    const pool = await getConnection();
    await pool.request()
      .input("entidad", sql.NVarChar(100), entidad)
      .input("idEntidad", sql.Int, idEntidad)
      .input("accion", sql.NVarChar(50), accion)
      .input("hashActual", sql.NVarChar(255), hashActual)
      .input("hashPrevio", sql.NVarChar(255), hashPrevio)
      .execute("sp_log_event");

    res.status(201).json({ mensaje: "Evento auditado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar evento", error: error.message });
  }
};

// Obtener historial de auditoría
export const getAuditTrail = async (req, res) => {
  try {
    const { entidad, idEntidad } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input("entidad", sql.NVarChar(100), entidad)
      .input("idEntidad", sql.Int, idEntidad)
      .execute("sp_get_audit_trail");

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener auditoría", error: error.message });
  }
};
