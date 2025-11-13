import { getConnection, sql } from "../config/db.js";

// === Agregar nuevo instrumento ===
export const add_instrumento = async (req, res) => {
  try {
    const { idUsuario, tipo, descripcion, saldoInstrumento } = req.body;

    if (!idUsuario || !tipo) {
      return res.status(400).json({
        message: "Los campos 'idUsuario' y 'tipo' son obligatorios."
      });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input("idUsuario", sql.Int, idUsuario)
      .input("tipo", sql.NVarChar(50), tipo)
      .input("descripcion", sql.NVarChar(255), descripcion || null)
      .input("saldoInstrumento", sql.Decimal(18, 2), saldoInstrumento || 0)
      .execute("sp_add_instrumento");

    if (result.recordset.length === 0) {
      return res.status(400).json({
        message: "No se pudo crear el instrumento. Verifique los datos."
      });
    }

    res.status(201).json({
      message: "Instrumento creado exitosamente.",
      instrumento: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: error.message.includes("El usuario especificado no existe.")
        ? "El usuario especificado no existe."
        : "Error al crear el instrumento.",
      error: error.message
    });
  }
};

// === Obtener TODOS los instrumentos ===
export const getall_instrumentos = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().execute("sp_getall_instrumentos");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No hay instrumentos registrados." });
    }

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: "Error al obtener los instrumentos.",
      error: error.message
    });
  }
};


// === Obtener instrumento por ID ===
// (Sabemos que este nombre es confuso y que en realidad busca por idUsuario)
export const getbyid_instrumento = async (req, res) => {
  try {
    // 1. Este 'idinstrumento' es en realidad el 'idUsuario' que envía Astro
    const { idinstrumento } = req.params;

    if (!idinstrumento || isNaN(idinstrumento)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const pool = await getConnection();
    const result = await pool.request()
      // 2. Tu SP (a pesar del nombre) espera el ID de Usuario aquí
      .input("idInstrumento", sql.Int, idinstrumento) 
      .execute("sp_getbyid_instrumento");

    // 3. ¡ESTA ES LA CORRECCIÓN!
    // Tu SP devuelve un array (lista) de instrumentos. 
    // Debemos enviar el array completo a Astro, no solo el primer elemento.
    // Si un usuario no tiene instrumentos, esto (correctamente)
    // enviará un array vacío: [].
    res.status(200).json(result.recordset);

  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: "Error al obtener el instrumento.",
      error: error.message
    });
  }
};