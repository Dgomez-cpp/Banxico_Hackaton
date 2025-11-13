// src/pages/api/chatbot.ts (mejora de logs)
import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const userMessage = body.message;

    if (!userMessage) {
        return new Response(JSON.stringify({ error: 'Mensaje vacío' }), { status: 400 });
    }

    try {
        const pythonResponse = await fetch('http://localhost:5001/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        if (!pythonResponse.ok) {
            const text = await pythonResponse.text();
            console.error('Python returned non-OK:', pythonResponse.status, text);
            return new Response(JSON.stringify({ error: 'El servidor de IA (Python) falló', detail: text }), { status: 502 });
        }

        const data = await pythonResponse.json();
        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        console.error('Error en el puente (Astro API):', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
};
