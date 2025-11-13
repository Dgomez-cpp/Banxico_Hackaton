import express from "express";
import cors from "cors";
import {getConnection} from "./config/db.js";
import usuarioRoutes from "./routes/usuarios.routes.js";
import instrumentosRoutes from "./routes/instrumentos.routes.js";
import obligacionesRoutes from "./routes/obligaciones.routes.js";
import cuentasRoutes from "./routes/cuentas.routers.js";
import pagosRoutes from "./routes/pagos.routers.js";
import auditRoutes from "./routes/audit.routers.js";
import targetaRoutes from "./routes/targeta.routes.js";


const app = express();

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use("/usuario", usuarioRoutes);
app.use("/instrumento", instrumentosRoutes);
app.use("/obligacion", obligacionesRoutes);
app.use("/tarjeta", targetaRoutes);

app.use("/cuentas", cuentasRoutes);
app.use("/", pagosRoutes);
app.use("/auditoria", auditRoutes);



export default app;