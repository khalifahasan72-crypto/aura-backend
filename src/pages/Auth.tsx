import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            console.log(`🚀 Authenticating at ${apiBase}${endpoint}...`);
            const res = await fetch(`${apiBase}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const parsed = await res.json();
            if (!res.ok) throw new Error(parsed.error || 'Authentication failed');

            login(parsed.token, parsed.user);
            navigate('/account');
        } catch (err: any) {
            console.error('❌ Auth Error:', err);
            setError(`Authentication failed: ${err.message || 'Check your connection'}`);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        console.log('📦 Google Credential Response:', credentialResponse);
        if (!credentialResponse.credential) {
            console.error('❌ No credential returned from Google');
            setError('Google failed to provide a credential. Please try again.');
            return;
        }

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        try {
            console.log(`🚀 Sending Google credential to ${apiBase}/api/auth/google...`);
            const res = await fetch(`${apiBase}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });

            console.log('📡 Backend Response Status:', res.status);
            const parsed = await res.json().catch(() => null);
            console.log('📄 Backend Parsed Response:', parsed);

            if (!res.ok) {
                const errorMsg = parsed?.error || `Service returned status ${res.status}`;
                throw new Error(errorMsg);
            }

            console.log('✅ Auth successful! Saving session and redirecting...');
            login(parsed.token, parsed.user);
            navigate('/account');
        } catch (err: any) {
            console.error('❌ Google Authentication Error:', err);
            setError(`Authentication failed: ${err.message || 'Could not connect to authentication server'}`);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '10vh auto', color: 'white', padding: '2rem', background: 'rgba(14,15,18,0.75)', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>{isLogin ? 'Sign In' : 'Sign Up'}</h1>

            {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Login Failed')}
                    theme="filled_black"
                    shape="pill"
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, height: '1px', background: '#1c2330' }}></div>
                <span style={{ padding: '0 1rem', color: '#a7b0bc', fontSize: '0.9rem' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#1c2330' }}></div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!isLogin && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a7b0bc' }}>Name</label>
                        <input name="name" required type="text" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #1c2330', background: '#000', color: 'white' }} />
                    </div>
                )}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a7b0bc' }}>Email</label>
                    <input name="email" required type="email" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #1c2330', background: '#000', color: 'white' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a7b0bc' }}>Password</label>
                    <input name="password" required type="password" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #1c2330', background: '#000', color: 'white' }} />
                </div>

                <button type="submit" style={{ width: '100%', padding: '1rem', background: 'white', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', fontSize: '1.1rem' }}>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ background: 'transparent', border: 'none', color: '#a7b0bc', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
    );
}
