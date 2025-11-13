import { getConnection, sql } from "../config/db.js";

// Obtener balance de un usuario
export const getBalance = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input("idUsuario", sql.Int, idUsuario)
      .execute("sp_get_balance");

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el balance", error: error.message });
  }
};

// Crear nueva cuenta para usuario
export const createCuenta = async (req, res) => {
  try {
    const { idUsuario, moneda } = req.body;
    const pool = await getConnection();
    await pool.request()
      .input("idUsuario", sql.Int, idUsuario)
      .input("moneda", sql.NVarChar(10), moneda || "MXN")
      .execute("sp_create_cuenta");

    res.status(201).json({ mensaje: "Cuenta creada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la cuenta", error: error.message });
  }
};
