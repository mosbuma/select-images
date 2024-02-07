// src/pages/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import RootLayout from '../components/RootLayout'; // Adjust the path based on your directory structure

const MyApp = ({ Component, pageProps }: AppProps) => {
    return (
        <SessionProvider session={pageProps.session}>
            <RootLayout>
                <Component {...pageProps} />
            </RootLayout>
        </SessionProvider>
    );
};

export default MyApp;
