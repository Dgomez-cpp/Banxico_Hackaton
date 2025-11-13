// src/pages/api/payment.ts
import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

// ❗️ IMPORTANTE: Usa la misma clave secreta que en tu backend
const SECRET_KEY = 'banxico'; // (La tomaste de tu 'instrumentos.astro')

// Marcar como dinámico
export const prerender = false;

// Esta función se encarga del POST del formulario
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    // 1. OBTENER EL USUARIO DE LA SESIÓN
    const token = cookies.get('session')?.value;
    if (!token) {
        // No hay sesión, no debería poder pagar
        return redirect('/?error=No autorizado');
    }

    let usuario: (JwtPayload & { id: number }) | null = null;
    try {
        usuario = jwt.verify(token, SECRET_KEY) as (JwtPayload & { id: number });
    } catch {
        return redirect('/?error=Sesión inválida');
    }

    if (!usuario) {
        return redirect('/?error=No autorizado');
    }

    // 2. OBTENER LA CUENTA DE ORIGEN DEL USUARIO
    // El formulario (correctamente) no pregunta la cuenta de origen.
    // La obtenemos del backend usando el ID del usuario de la sesión.
    let idCuentaOrigen: number | null = null;
    try {
        const resCuenta = await fetch(`http://localhost:3000/cuentas/balance/${usuario.id}`);
        if (resCuenta.ok) {
            const cuentasData = await resCuenta.json();
            if (cuentasData && cuentasData.length > 0) {
                idCuentaOrigen = cuentasData[0].idCuenta; // ¡Ya tenemos la cuenta de origen!
            } else {
                return redirect('/pagos?error=No se encontró una cuenta de origen');
            }
        }
    } catch (e) {
        return redirect('/pagos?error=Error al verificar la cuenta');
    }

    // 3. OBTENER LOS DATOS DEL FORMULARIO
    // 3. OBTENER LOS DATOS DEL FORMULARIO
    const formData = await request.formData();
    // const idCuentaDestino = formData.get('idCuentaDestino'); // <-- Cambiamos esto
    const numeroTarjetaDestino = formData.get('numeroTarjeta'); // <-- Por esto
    const monto = formData.get('monto');
    const referencia = formData.get('referencia');

    // Validación simple
    // if (!idCuentaDestino || !monto) { // <-- Cambiamos esto
    if (!numeroTarjetaDestino || !monto) { // <-- Por esto
        return redirect('/pagos?error=Faltan datos en el formulario');
    }

    // 4. LLAMAR AL BACKEND REAL PARA PROCESAR EL PAGO
    try {
        const response = await fetch('http://localhost:3000/iniciar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idCuentaOrigen: idCuentaOrigen,
                // idCuentaDestino: Number(idCuentaDestino), // <-- Cambiamos esto
                numeroTarjetaDestino: numeroTarjetaDestino?.toString(), // <-- Por esto
                monto: Number(monto),
                referencia: referencia?.toString()
            })
        });

        if (!response.ok) {
            // Si el backend da un error (ej. saldo insuficiente)
            const errorData = await response.json();
            return redirect(`/pagos?error=${encodeURIComponent(errorData.mensaje || 'Error al procesar el pago')}`);
        }

        // 5. ¡ÉXITO! Redirigir de vuelta con un mensaje de éxito
        return redirect('/pagos?success=Pago realizado correctamente');

    } catch (error) {
        console.error('Error al conectar con el backend de pagos:', error);
        return redirect('/pagos?error=Error de conexión con el servidor de pagos');
    }
};