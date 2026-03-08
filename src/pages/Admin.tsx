import { useState, useEffect } from 'react';


const STATUSES = ['Pending', 'Confirmed', 'Working', 'Ready for Pickup at School', 'Completed', 'Cancelled'];

export default function Admin() {
    const [orders, setOrders] = useState<any[]>([]);
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(!!token);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchOrders = async () => {
        try {
            console.log(`📡 Admin: Fetching orders from ${apiBase}...`);
            const res = await fetch(`${apiBase}/api/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setOrders(await res.json());
            } else {
                console.error(`❌ Admin Fetch Error: ${res.status}`);
                setIsLoggedIn(false);
                localStorage.removeItem('adminToken');
            }
        } catch (e: any) {
            console.error('❌ Admin Fetch Exception:', e);
        }
    };

    useEffect(() => {
        if (isLoggedIn) fetchOrders();
    }, [isLoggedIn, token]);

    const handleLogin = async (e: any) => {
        e.preventDefault();
        try {
            console.log(`🔑 Admin: Logging in at ${apiBase}...`);
            const res = await fetch(`${apiBase}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: loginPassword })
            });
            if (res.ok) {
                const data = await res.json();
                setToken(data.token);
                localStorage.setItem('adminToken', data.token);
                setIsLoggedIn(true);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Admin login failed: ${errData.error || res.statusText}`);
            }
        } catch (e: any) {
            console.error('❌ Admin Login Exception:', e);
            alert(`Admin login failed: ${e.message}`);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            console.log(`⚡ Admin: Updating status for ${orderId} at ${apiBase}...`);
            const res = await fetch(`${apiBase}/api/admin/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchOrders();
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('Failed to update status:', errData);
                alert(`Failed to update status: ${errData.error || res.statusText}`);
            }
        } catch (e: any) {
            console.error('❌ Status Update Exception:', e);
            alert(`Failed to update status: ${e.message}`);
        }
    };

    if (!isLoggedIn) {
        return (
            <div style={{ maxWidth: 400, margin: '10vh auto', color: 'white', padding: '2rem', background: 'rgba(14,15,18,0.75)', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h1>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Admin Password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #1c2330', background: '#000', color: 'white' }}
                    />
                    <button type="submit" style={{ width: '100%', padding: '1rem', background: 'white', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', color: 'white', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #1c2330', paddingBottom: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Admin Orders Dashboard</h1>
                <button
                    onClick={() => { setIsLoggedIn(false); localStorage.removeItem('adminToken'); }}
                    style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Logout Admin
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '1rem' }}>Order ID</th>
                        <th style={{ padding: '1rem' }}>Customer</th>
                        <th style={{ padding: '1rem' }}>Total</th>
                        <th style={{ padding: '1rem' }}>Method</th>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #1c2330' }}>
                            <td style={{ padding: '1rem' }}>{order.id.split('-').pop()}</td>
                            <td style={{ padding: '1rem' }}>
                                <div>{order.customerName}</div>
                                <div style={{ fontSize: '0.8rem', color: '#a7b0bc' }}>{order.phone}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>{order.total.toFixed(2)} AED</td>
                            <td style={{ padding: '1rem' }}>{order.pickupMethod}</td>
                            <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{order.orderStatus}</td>
                            <td style={{ padding: '1rem' }}>
                                <select
                                    value={order.orderStatus}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                    style={{ padding: '0.5rem', background: '#000', color: 'white', border: '1px solid #1c2330', borderRadius: '6px' }}
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
