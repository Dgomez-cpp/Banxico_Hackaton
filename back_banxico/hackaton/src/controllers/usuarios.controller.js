import { getConnection, sql } from "../config/db.js";
import bcrypt from 'bcrypt'; // <--- Importa bcrypt
import jwt from 'jsonwebtoken'; // <--- Importa jsonwebtoken
// === Registrar nuevo usuario (CORREGIDO) ===
export const register_usuario = async (req, res) => {
  try {
    // 1. Recibe 'password' (texto plano), NO 'passwordHash'
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // 2. Crear el hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt); // <--- Aquí se crea el hash

    // 3. Guardar el hash en la BD
    const pool = await getConnection();
    await pool.request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("correo", sql.NVarChar(150), correo)
      .input("passwordHash", sql.NVarChar(255), passwordHash) // <--- Guarda el hash generado
      .execute("sp_register_usuario"); // (Tu SP de registro está bien)

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: error.message.includes("El correo ya está registrado")
        ? "El correo ya está registrado"
        : "Error al registrar usuario",
      error: error.message
    });
  }
};

// === Actualizar usuario ===
export const update_usuario = async (req, res) => {
  try {
    const { idusuario } = req.params;
    const { nombre, correo, passwordHash, rol, activo } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input("idUsuario", sql.Int, idusuario)
      .input("nombre", sql.NVarChar(100), nombre || null)
      .input("correo", sql.NVarChar(150), correo || null)
      .input("passwordHash", sql.NVarChar(255), passwordHash || null)
      .input("rol", sql.NVarChar(50), rol || null)
      .input("activo", sql.Bit, activo !== undefined ? activo : null)
      .execute("sp_update_usuario");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado o no actualizado" });
    }

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      usuario: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: "Error al actualizar el usuario",
      error: error.message
    });
  }
};

// === Login de usuario (CORREGIDO) ===
export const login_usuario = async (req, res) => {
  try {
    // 1. Recibe 'password' (texto plano), NO 'passwordHash'
    const { correo, password } = req.body; 

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    const pool = await getConnection();

    // 2. OBTENER el usuario y su hash de la BD (¡No uses el SP!)
    const result = await pool.request()
      .input("correo", sql.NVarChar(150), correo)
      .query('SELECT idUsuario, nombre, rol, passwordHash FROM Usuarios WHERE correo = @correo AND activo = 1');

    const usuario = result.recordset[0];

    // 3. Si el usuario no existe
    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 4. COMPARAR la contraseña del formulario con el hash de la BD
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    // 5. Si la contraseña no coincide
    if (!passwordValida) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 6. ¡Login exitoso! Crear un token (JWT)
    const tokenPayload = {
      id: usuario.idUsuario,
      nombre: usuario.nombre,
      rol: usuario.rol
    };

    // (Usa una variable de entorno para tu secreto en producción)
    const token = jwt.sign(tokenPayload, 'banxico', {
      expiresIn: '1d' // El token expira en 1 día
    });

    // 7. Enviar el token a Astro
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token: token // <-- Astro guardará esto en una cookie
    });

  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: "Error al iniciar sesión",
      error: error.message
    });
  }
};

// === Obtener usuario por ID ===
export const get_usuario_by_id = async (req, res) => {
  try {
    const { idusuario } = req.params;
    const pool = await getConnection();

    const result = await pool.request()
      .input("idUsuario", sql.Int, idusuario)
      .execute("sp_get_usuario_by_id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      estado: "error",
      mensaje: "Error al obtener el usuario",
      error: error.message
    });
  }
};
