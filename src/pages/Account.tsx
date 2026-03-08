import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package } from 'lucide-react';

export default function Account() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalOrders: 0, latestStatus: '' });

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${apiBase}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStats({
                        totalOrders: data.length,
                        latestStatus: data[0]?.orderStatus || 'None'
                    });
                }
            })
            .catch(err => console.error('❌ Account: Fetch orders failed:', err));
    }, [user, navigate, token]);

    if (!user) return null;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', color: 'white', padding: 'clamp(1rem, 5vw, 2rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', margin: 0, fontWeight: 900 }}>Hello, {user.name.split(' ')[0]}!</h1>
                <button
                    onClick={logout}
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#ff6b6b', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 'bold' }}
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Profile Card */}
                <div style={{ background: 'rgba(14,15,18,0.75)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(28,35,48,0.6)' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#a7b0bc', marginBottom: '1.5rem' }}>Personal Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem' }}>{user.name}</div>
                        </div>
                        <div>
                            <label style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem' }}>{user.email}</div>
                        </div>
                    </div>
                </div>

                {/* Quick Orders Stats Card */}
                <div
                    onClick={() => navigate('/orders')}
                    style={{ background: 'rgba(57, 255, 20, 0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(57, 255, 20, 0.1)', cursor: 'pointer', transition: 'transform 0.2s ease, border 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.1)'; }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{ width: 50, height: 50, background: 'rgba(57, 255, 20, 0.1)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#39ff14' }}>
                            <Package size={28} />
                        </div>
                        <div style={{ color: '#39ff14', background: 'rgba(57, 255, 20, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            View History
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your Orders</h3>
                    <p style={{ color: '#a7b0bc', margin: 0, fontSize: '0.9rem' }}>You have <span style={{ color: 'white', fontWeight: 'bold' }}>{stats.totalOrders}</span> orders in your history.</p>
                    {stats.latestStatus && stats.latestStatus !== 'None' && (
                        <p style={{ color: '#a7b0bc', marginTop: '0.8rem', fontSize: '0.85rem' }}>Latest status: <span style={{ color: '#39ff14' }}>{stats.latestStatus}</span></p>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>Need help with an order? Contact our support team at the workshop.</p>
            </div>
        </div>
    );
}
