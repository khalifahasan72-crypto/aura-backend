import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            // Check if we have a hash or search params (Google sends them differently based on mode)
            const params = new URLSearchParams(location.search);
            const credential = params.get('credential') || params.get('id_token') || new URLSearchParams(location.hash.substring(1)).get('id_token');

            if (!credential) {
                console.error('❌ No credential found in callback URL');
                navigate('/auth');
                return;
            }

            try {
                console.log('🚀 Callback: Validating Google credential at backend...');
                const res = await fetch(`${apiBase}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential })
                });

                const parsed = await res.json();
                if (!res.ok) throw new Error(parsed.error || 'Backend validation failed');

                console.log('✅ Callback: Success!');
                login(parsed.token, parsed.user);
                navigate('/account');
            } catch (err: any) {
                console.error('❌ Callback: Auth failed:', err);
                navigate('/auth?error=' + encodeURIComponent(err.message));
            }
        };

        handleCallback();
    }, [location, login, navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'white' }}>
            <div className="spinner" style={{ border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #39ff14', borderRadius: '50%', width: 40, height: 40, margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
            <h1>Completing Sign In...</h1>
            <p style={{ color: '#a7b0bc' }}>Verifying your identity with Google.</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
