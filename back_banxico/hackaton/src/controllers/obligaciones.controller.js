import { getConnection, sql } from "../config/db.js";

// === Agregar nueva obligación ===
export const add_obligacion = async (req, res) => {
  try {
    const { idInstrumento, monto, descripcion, fechaVencimiento } = req.body;

    if (!idInstrumento || !monto || !fechaVencimiento) {
      return res.status(400).json({
        message: "Los campos 'idInstrumento', 'monto' y 'fechaVencimiento' son obligatorios."
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input("idInstrumento", sql.Int, idInstrumento)
      .input("monto", sql.Decimal(18, 2), monto)
      .input("descripcion", sql.NVarChar(255), descripcion || null)
      .input("fechaVencimiento", sql.DateTime, fechaVencimiento)
      .execute("sp_add_obligacion");

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "No se pudo crear la obligación." });
    }

    res.status(201).json({
      message: "Obligación creada exitosamente.",
      obligacion: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: error.message.includes("El instrumento especificado no existe.")
        ? "El instrumento especificado no existe."
        : "Error al crear la obligación.",
      error: error.message
    });
  }
};

// === Obtener todas las obligaciones de un usuario ===
export const get_obligaciones = async (req, res) => {
  try {
    const { idusuario } = req.params;

    if (!idusuario || isNaN(idusuario)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input("idUsuario", sql.Int, idusuario)
      .execute("sp_get_obligaciones");

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: "Error al obtener las obligaciones.",
      error: error.message
    });
  }
};

// === Pagar obligación ===
export const pagar_obligacion = async (req, res) => {
  try {
    const { idObligacion, idCuentaPago } = req.body;

    if (!idObligacion || !idCuentaPago) {
      return res.status(400).json({
        message: "Los campos 'idObligacion' e 'idCuentaPago' son obligatorios."
      });
    }

    const pool = await getConnection();
    await pool.request()
      .input("idObligacion", sql.Int, idObligacion)
      .input("idCuentaPago", sql.Int, idCuentaPago)
      .execute("sp_pagar_obligacion");

    res.status(200).json({ message: "Obligación pagada exitosamente." });
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: error.message.includes("Saldo insuficiente")
        ? "Saldo insuficiente para pagar la obligación."
        : "Error al procesar el pago.",
      error: error.message
    });
  }
};
