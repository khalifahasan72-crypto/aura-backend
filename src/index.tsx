import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!GOOGLE_CLIENT_ID) {
    console.error("❌ Google OAuth Client ID is missing! Make sure VITE_GOOGLE_CLIENT_ID is set in your .env file.");
}

const container = document.getElementById('react-root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            {GOOGLE_CLIENT_ID ? (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <AuthProvider>
                        <CartProvider>
                            <BrowserRouter>
                                <App />
                            </BrowserRouter>
                        </CartProvider>
                    </AuthProvider>
                </GoogleOAuthProvider>
            ) : (
                <div style={{ color: 'red', textAlign: 'center', marginTop: '50px', backgroundColor: 'black', padding: '2rem' }}>
                    <h1>Configuration Error</h1>
                    <p>VITE_GOOGLE_CLIENT_ID is missing from your .env file.</p>
                    <p>Please configure Google OAuth credentials to continue.</p>
                </div>
            )}
        </React.StrictMode>
    );
}

