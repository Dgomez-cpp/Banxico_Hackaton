import type { APIRoute } from 'astro';

export const get: APIRoute = async ({ request }) => {
    const data = { now: new Date().toISOString(), message: "hola desde api" };
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
