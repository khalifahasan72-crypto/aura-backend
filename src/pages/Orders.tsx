import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Package, Clock, CheckCircle, Printer, Truck, ChevronRight } from 'lucide-react';

const ORDER_STATUS_MAP: Record<string, { icon: any, label: string, color: string, step: number }> = {
    'Pending': { icon: Clock, label: 'We received your order', color: '#a7b0bc', step: 0 },
    'Confirmed': { icon: CheckCircle, label: 'Your order has been confirmed', color: '#fff', step: 1 },
    'Working': { icon: Printer, label: 'Your order is being prepared', color: '#ffb300', step: 2 },
    'Ready for Pickup at School': { icon: Package, label: 'Your order is ready for pickup at school', color: '#39ff14', step: 3 },
    'Completed': { icon: Truck, label: 'Your order has been collected', color: '#2b9910', step: 4 },
    'Cancelled': { icon: LogOut, label: 'This order was cancelled', color: '#ff0000', step: -1 }
};

const PROGRESS_STEPS = [
    { id: 'Pending', icon: Clock, label: 'Received' },
    { id: 'Confirmed', icon: CheckCircle, label: 'Confirmed' },
    { id: 'Working', icon: Printer, label: 'Preparing' },
    { id: 'Ready for Pickup at School', icon: Package, label: 'Ready' },
    { id: 'Completed', icon: Truck, label: 'Done' }
];

export default function Orders() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                if (Array.isArray(data)) setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('❌ Orders: Fetch failed:', err);
                setLoading(false);
            });
    }, [user, navigate, token]);

    if (!user) return null;

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>
                <div className="spinner" style={{ border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #39ff14', borderRadius: '50%', width: 40, height: 40, margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
                <p>Loading your orders...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', color: 'white', padding: 'clamp(1rem, 5vw, 2rem)' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a7b0bc', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <Link to="/account" style={{ color: '#a7b0bc', textDecoration: 'none' }}>Account</Link>
                    <ChevronRight size={14} />
                    <span style={{ color: 'white' }}>My Orders</span>
                </div>
                <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)', margin: 0, fontWeight: '900' }}>Order History</h1>
                <p style={{ color: '#a7b0bc', marginTop: '0.5rem' }}>Track the progress of your active and past orders.</p>
            </div>

            {orders.length === 0 ? (
                <div style={{ background: 'rgba(14,15,18,0.75)', padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(28,35,48,0.6)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <Package size={40} color="#a7b0bc" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>No orders found</h2>
                    <p style={{ color: '#a7b0bc', maxWidth: 400, margin: '0 auto 2rem auto', lineHeight: '1.6' }}>When you place an order, it will appear here with real-time tracking from our workshop.</p>
                    <Link to="/shop" style={{ background: 'white', color: 'black', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem', display: 'inline-block' }}>Start Shopping</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {orders.map(order => {
                        const statusObj = ORDER_STATUS_MAP[order.orderStatus] || ORDER_STATUS_MAP['Pending'];
                        const currentStep = statusObj.step;
                        const isCancelled = order.orderStatus === 'Cancelled';

                        return (
                            <div key={order.id} style={{
                                background: 'linear-gradient(145deg, rgba(14,15,18,0.95) 0%, rgba(20,22,26,0.95) 100%)',
                                padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Subtle Status Background Glow */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '150px',
                                    height: '150px',
                                    background: `radial-gradient(circle at top right, ${statusObj.color}15, transparent 70%)`,
                                    pointerEvents: 'none'
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                                            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'white' }}>Order #{order.id.split('-').pop()}</h2>
                                            <span style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#a7b0bc', fontWeight: 'bold' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p style={{ color: '#a7b0bc', margin: 0, fontSize: '0.95rem' }}>
                                            Total: <span style={{ color: '#39ff14', fontWeight: '900' }}>{order.total.toFixed(2)} AED</span> • {order.pickupMethod}
                                        </p>
                                    </div>
                                    <div style={{
                                        color: statusObj.color,
                                        background: `${statusObj.color}12`,
                                        padding: '0.75rem 1.25rem',
                                        borderRadius: '12px',
                                        border: `1px solid ${statusObj.color}25`,
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem'
                                    }}>
                                        <statusObj.icon size={18} />
                                        {statusObj.label}
                                    </div>
                                </div>

                                {/* Visual Progress Tracker */}
                                {!isCancelled && (
                                    <div style={{ marginBottom: '3rem', padding: '0 0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', alignItems: 'center' }}>
                                            {/* Track Lines */}
                                            <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 0, borderRadius: '2px' }} />
                                            <div style={{
                                                position: 'absolute',
                                                top: '20px',
                                                left: '0',
                                                width: `${(currentStep / 4) * 100}%`,
                                                height: '3px',
                                                background: '#39ff14',
                                                boxShadow: '0 0 15px rgba(57, 255, 20, 0.6)',
                                                zIndex: 0,
                                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderRadius: '2px'
                                            }} />

                                            {PROGRESS_STEPS.map((s, idx) => {
                                                const Icon = s.icon;
                                                const isActive = idx <= currentStep;
                                                const isCurrent = idx === currentStep;

                                                return (
                                                    <div key={s.id} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '60px' }}>
                                                        <div style={{
                                                            width: '42px',
                                                            height: '42px',
                                                            borderRadius: '50%',
                                                            background: isActive ? '#39ff14' : '#111',
                                                            border: `3px solid ${isActive ? '#39ff14' : '#1c2330'}`,
                                                            color: isActive ? 'black' : '#555',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: isCurrent ? '0 0 25px rgba(57, 255, 20, 0.4)' : 'none',
                                                            transition: 'all 0.4s ease',
                                                            transform: isCurrent ? 'scale(1.15)' : 'scale(1)'
                                                        }}>
                                                            <Icon size={idx === 4 ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            color: isActive ? 'white' : '#555',
                                                            fontWeight: isActive ? '900' : 'normal',
                                                            textAlign: 'center',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.02em',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {s.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {isCancelled && (
                                    <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,0,0,0.05)', borderRadius: '16px', border: '1px solid rgba(255,0,0,0.1)', textAlign: 'center' }}>
                                        <p style={{ color: '#ff6b6b', margin: 0, fontWeight: 'bold' }}>This order was cancelled and is no longer being processed.</p>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
                                    {order.items.map((item: any, i: number) => {
                                        const ops = JSON.parse(item.customOptionsJSON || '{}');
                                        return (
                                            <div key={i} style={{
                                                display: 'flex',
                                                gap: '1.2rem',
                                                alignItems: 'center',
                                                background: 'rgba(255,255,255,0.02)',
                                                padding: '1.2rem',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                transition: 'transform 0.2s ease',
                                                cursor: 'default'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '800', display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'white' }}>
                                                        <span>{item.quantity}x {item.productName || 'Custom Item'}</span>
                                                        <span style={{ color: '#a7b0bc', fontSize: '0.85rem' }}>{(item.unitPrice * item.quantity).toFixed(2)} AED</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#a7b0bc', lineHeight: '1.5' }}>
                                                        {Object.entries(ops).filter(([k, v]) => k !== 'modelPath' && typeof v === 'string').map(([k, v]) => {
                                                            const valStr = v as string;
                                                            return valStr.startsWith('FILE_') ? `${k}: Attached` : `${k}: ${v}`;
                                                        }).join(' | ')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {order.notes && (
                                    <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(57, 255, 20, 0.03)', borderRadius: '12px', borderLeft: '4px solid #39ff14', fontSize: '0.9rem', color: '#e0e0e0' }}>
                                        <span style={{ fontWeight: '900', color: '#39ff14', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>Special Instructions:</span>
                                        {order.notes}
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#a7b0bc' }}>Payment via <span style={{ color: 'white', fontWeight: 'bold' }}>{order.paymentMethod}</span></p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
