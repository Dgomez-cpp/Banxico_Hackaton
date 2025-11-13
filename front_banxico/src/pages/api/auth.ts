// src/pages/api/auth.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    // 1. Usar .formData() para leer el formulario HTML
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    // 2. Validación simple
    if (!email || !password) {
        // Redirige de vuelta al login con un mensaje de error
        return redirect('/login?error=Faltan campos');
    }

    try {
        // 3. Llamar a tu backend (localhost:3000)
        const response = await fetch('http://localhost:3000/usuario/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Asegúrate de que los nombres 'correo' y 'password' 
            // coincidan con lo que espera tu backend
            body: JSON.stringify({
                correo: email.toString(),
                password: password.toString(),
            }),
        });

        // 4. Si el backend dice que el login falló (status 400, 401, 404, etc.)
        if (!response.ok) {
            console.error('Login fallido desde el backend');
            // Redirige con error de credenciales
            return redirect('/login?error=Credenciales inválidas');
        }

        // 5. ¡Login exitoso! Obtener el token del backend
        const data = await response.json(); // Asumiendo que devuelve { token: '...' }

        // 6. Guardar el token en una cookie segura
        cookies.set('session', data.token, {
            path: '/',
            httpOnly: true, // El cliente JS no puede leerla
            secure: false, // Poner en 'true' para producción (HTTPS)
            maxAge: 60 * 60 * 24, // Expira en 1 día
        });

        // 7. Redirigir al usuario al dashboard
        return redirect('/');

    } catch (error) {
        console.error('Error de conexión con el backend:', error);
        // Error si el backend (localhost:3000) está caído
        return redirect('/login?error=Error de conexión con el servidor');
    }
};