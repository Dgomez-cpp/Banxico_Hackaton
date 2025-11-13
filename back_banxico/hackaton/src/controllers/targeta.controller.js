import { getConnection, sql } from "../config/db.js";

// 🆕 Crear tarjeta
export const createTarjeta = async (req, res) => {
  try {
    const { idCuenta, banco, titular, numeroTarjeta, fechaExpiracion, cvv, logo, tipo } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
      .input("idCuenta", sql.Int, idCuenta)
      .input("banco", sql.NVarChar(100), banco)
      .input("titular", sql.NVarChar(150), titular)
      .input("numeroTarjeta", sql.NVarChar(25), numeroTarjeta)
      .input("fechaExpiracion", sql.NVarChar(5), fechaExpiracion)
      .input("cvv", sql.NVarChar(4), cvv)
      .input("logo", sql.NVarChar(255), logo)
      .input("tipo", sql.NVarChar(10), tipo)
      .execute("sp_create_tarjeta");

    res.status(201).json({ mensaje: "Tarjeta creada correctamente", idTarjeta: result.recordset[0].idTarjeta });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la tarjeta", error: error.message });
  }
};

// 🔍 Obtener tarjetas por usuario
export const getTarjetasByUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const pool = await getConnection();

    const result = await pool.request()
      .input("idUsuario", sql.Int, idUsuario)
      .execute("sp_get_tarjetas_by_usuario");

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las tarjetas", error: error.message });
  }
};

// ❌ Eliminar (baja lógica)
export const deleteTarjeta = async (req, res) => {
  try {
    const { idTarjeta } = req.params;
    const pool = await getConnection();

    const result = await pool.request()
      .input("idTarjeta", sql.Int, idTarjeta)
      .execute("sp_delete_tarjeta");

    res.status(200).json({ mensaje: "Tarjeta eliminada (baja lógica)", tarjeta: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la tarjeta", error: error.message });
  }
};

// 🔄 Apagar o prender tarjeta
export const toggleTarjeta = async (req, res) => {
  try {
    const { idTarjeta } = req.params;
    const { activa } = req.body; // true o false
    const pool = await getConnection();

    const result = await pool.request()
      .input("idTarjeta", sql.Int, idTarjeta)
      .input("activa", sql.Bit, activa)
      .execute("sp_toggle_tarjeta");

    res.status(200).json({ mensaje: "Estado de la tarjeta actualizado", tarjeta: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el estado de la tarjeta", error: error.message });
  }
};