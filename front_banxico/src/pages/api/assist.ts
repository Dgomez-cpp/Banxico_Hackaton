// src/pages/api/assist.ts
import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

// ❗️ IMPORTANTE: Usa la misma clave secreta que en tu backend
const SECRET_KEY = 'banxico';
export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    // 1. VERIFICAR LA SESIÓN DEL USUARIO
    const token = cookies.get('session')?.value;
    if (!token) {
        return new Response(JSON.stringify({ response: 'No autorizado' }), { status: 401 });
    }

    let usuario: (JwtPayload & { id: number }) | null = null;
    try {
        usuario = jwt.verify(token, SECRET_KEY) as (JwtPayload & { id: number });
    } catch {
        return new Response(JSON.stringify({ response: 'Sesión inválida' }), { status: 401 });
    }

    // 2. OBTENER EL MENSAJE DEL CLIENTE
    const body = await request.json();
    const userMessage = body.message;
    if (!userMessage) {
        return new Response(JSON.stringify({ error: 'Mensaje vacío' }), { status: 400 });
    }

    try {
        // 3. LLAMAR AL "CEREBRO" (Python) CON EL ID DE USUARIO SEGURO
        const pythonResponse = await fetch('http://localhost:5001/assist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                idUsuario: usuario.id // <-- ¡El ID viene del token verificado!
            })
        });

        if (!pythonResponse.ok) {
            throw new Error('El servidor de IA (Python) falló');
        }

        const data = await pythonResponse.json(); // { "response": "..." }
        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        console.error('Error en el puente (Astro API):', error);
        return new Response(JSON.stringify({ response: 'Error interno del servidor' }), { status: 500 });
    }
};