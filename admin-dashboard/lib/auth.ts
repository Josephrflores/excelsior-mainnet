import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Staff Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                const parsed = z.object({
                    username: z.string(),
                    password: z.string()
                }).safeParse(credentials);

                if (parsed.success) {
                    const { username, password } = parsed.data;
                    // Uso de variables de entorno para mayor seguridad
                    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
                        return {
                            id: "1",
                            name: "Roosevelt",
                            email: "admin@excelsior.sol",
                            role: "admin"
                        };
                    }
                }
                return null;
            }
        })
    ],
});
