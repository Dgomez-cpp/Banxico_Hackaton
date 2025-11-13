// src/pages/api/logout.ts
import type { APIRoute } from 'astro';

// Marcamos como 'no prerender' para que sea un endpoint dinámico
export const prerender = false;

export const GET: APIRoute = ({ cookies, redirect }) => {
    // 1. Borramos la cookie de sesión
    cookies.delete('session', {
        path: '/', // Asegúrate de que el 'path' coincida con el que usaste al crearla
    });

    // 2. Redirigimos al usuario a la página principal
    return redirect('/');
};