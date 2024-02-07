// pages/api/auth/[...nextauth].ts

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
    secret: process.env.AUTH_SECRET || 'dummy-dummy-dummy-secret',
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials || !credentials.username || !credentials.password) {
                    return null;
                }
                // Hardcoded user list for example purposes
                const users = [
                    { id: '1', name: 'Marc', email: 'marcbuma@devilsshare.org', password: 'marc7878' },
                    { id: '2', name: 'Jasper', email: 'jaspervis@devilsshare.org', password: 'jasper3667' },
                    { id: '3', name: 'Steven', email: 'stevenrietveld@devilsshare.org', password: 'steven0729' }
                ];

                const user = users.find(user =>
                    user.email === credentials.username &&
                    user.password === credentials.password
                );

                if (user) {
                    // Return user object without password for security
                    return { id: user.id, name: user.name, email: user.email };
                } else {
                    // Returning null or false will display a default error message
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/',  // Displays signin buttons
        signOut: '/', // Displays signout button
        error: '/', // Error code passed in query string as ?error=
    }
}

export default NextAuth(authOptions);

