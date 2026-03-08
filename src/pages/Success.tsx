import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, Printer, Truck, LogOut, Search } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';

export default function Success() {
    const { state } = useLocation();

    const [orderNumber, setOrderNumber] = useState(state?.orderNumber || '');
    const [email, setEmail] = useState(state?.guestEmail || '');

    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(!!state);
    const [error, setError] = useState('');

    const fetchOrder = async (oid: string, e: string) => {
        setLoading(true);
        setError('');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            console.log(`📡 Success: Tracking order ${oid} at ${apiBase}...`);
            const res = await fetch(`${apiBase}/api/orders/track?orderId=${oid}&email=${e}`);
            const data = await res.json().catch(() => ({ error: 'Invalid response from server' }));
            if (res.ok) {
                setOrderData(data);
            } else {
                setError(data.error || `Server error: ${res.status}`);
            }
        } catch (err: any) {
            console.error('❌ Success: Tracking Exception:', err);
            setError(`Connection error: ${err.message || 'Check your internet connection'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (state?.orderNumber && state?.guestEmail) {
            fetchOrder(state.orderNumber, state.guestEmail);
        }
    }, [state]);

    const handleTrackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrder(orderNumber, email);
    };

    if (!orderData) {
        return (
            <div style={{ maxWidth: 400, margin: '10vh auto', color: 'white', padding: '2rem', background: 'rgba(14,15,18,0.75)', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}><Search size={28} /> Track Guest Order</h1>
                <p style={{ color: '#a7b0bc', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Enter your order ID and the email you used during checkout to track progress.
                </p>

                {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a7b0bc' }}>Order ID</label>
                        <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required type="text" placeholder="e.g. cuid-1234..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #1c2330', background: '#000', color: 'white' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a7b0bc' }}>Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} required type="email" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #1c2330', background: '#000', color: 'white' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: 'white', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', fontSize: '1.1rem' }}>
                        {loading ? 'Searching...' : 'Track Order'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/auth" style={{ color: '#a7b0bc', textDecoration: 'underline' }}>Have an account? Sign in</Link>
                </div>
            </div>
        );
    }

    const { id, total, items, orderStatus } = orderData;

    const statusMapping: Record<string, any> = {
        'Pending': { step: 0, label: 'Received', icon: Clock },
        'Confirmed': { step: 1, label: 'Confirmed', icon: CheckCircle },
        'Working': { step: 2, label: 'Preparing', icon: Printer },
        'Ready for Pickup at School': { step: 3, label: 'Ready', icon: Package },
        'Completed': { step: 4, label: 'Done', icon: Truck }
    };

    const currentStatusInfo = statusMapping[orderStatus] || statusMapping['Pending'];
    const currentStep = currentStatusInfo.step;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', color: 'white', padding: '2rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 900 }}>Order Progress</h1>
            <p style={{ color: '#a7b0bc', fontSize: '1.2rem', marginBottom: '3rem' }}>
                Order <span style={{ color: '#39ff14', fontWeight: 'bold' }}>#{id.split('-').pop()}</span>
            </p>

            {/* Tracking progress bar */}
            {orderStatus === 'Cancelled' ? (
                <div style={{ background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.2)', padding: '2.5rem', borderRadius: '24px', marginBottom: '3rem', textAlign: 'center' }}>
                    <LogOut size={48} color="#ff0000" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem', color: '#ff0000', margin: '0 0 0.5rem 0', fontWeight: 900 }}>Order Cancelled</h2>
                    <p style={{ color: '#a7b0bc' }}>This order has been cancelled and is no longer being processed.</p>
                </div>
            ) : (
                <div style={{ background: 'rgba(14,15,18,0.75)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '3rem', position: 'relative' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: 12, height: 12, background: '#39ff14', borderRadius: '50%', boxShadow: '0 0 10px #39ff14' }} />
                        Current Status: {orderStatus}
                    </h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10%' }}>
                        {/* Connecting Line */}
                        <div style={{ position: 'absolute', top: '22px', left: '10%', right: '10%', height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                        <div style={{
                            position: 'absolute',
                            top: '22px',
                            left: '10%',
                            width: `${(currentStep / 4) * 80}%`,
                            height: '3px',
                            background: '#39ff14',
                            boxShadow: '0 0 15px rgba(57, 255, 20, 0.6)',
                            zIndex: 0,
                            transition: 'width 0.8s ease'
                        }} />

                        {[
                            { id: 'Pending', label: 'Received', icon: Clock },
                            { id: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
                            { id: 'Working', label: 'Preparing', icon: Printer },
                            { id: 'Ready', label: 'Ready', icon: Package },
                            { id: 'Done', label: 'Done', icon: Truck }
                        ].map((s, idx) => {
                            const Icon = s.icon;
                            const isActive = idx <= currentStep;
                            const isCurrent = idx === currentStep;

                            return (
                                <div key={s.label} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        background: isActive ? '#39ff14' : '#111',
                                        color: isActive ? 'black' : '#555',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `3px solid ${isActive ? '#39ff14' : '#1c2330'}`,
                                        boxShadow: isCurrent ? '0 0 20px rgba(57, 255, 20, 0.4)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <Icon size={idx === 4 ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: isActive ? 'white' : '#555', fontWeight: isActive ? 'bold' : 'normal', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ background: 'rgba(14,15,18,0.75)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {items && items.map((item: any, i: number) => {
                        const ops = JSON.parse(item.customOptionsJSON || '{}');
                        return (
                            <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: i === items.length - 1 ? 'none' : '1px solid #1c2330', paddingBottom: i === items.length - 1 ? 0 : '1.5rem' }}>
                                <div style={{ width: 100, height: 100, background: '#0E0F12', borderRadius: '8px', border: '1px solid rgba(28,35,48,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {ops.modelPath ? (
                                        <ModelViewer
                                            modelPath={ops.modelPath}
                                            height="100%"
                                            jointColor={ops['Joint Color']}
                                            armorColor={ops['Armor Color']}
                                        />
                                    ) : (
                                        <Package size={32} color="#a7b0bc" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{item.quantity}x {item.productName || 'Item'}</h3>
                                        <span style={{ fontWeight: 'bold' }}>{(item.unitPrice * item.quantity).toFixed(2)} AED</span>
                                    </div>
                                    <div style={{ color: '#a7b0bc', fontSize: '0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {Object.entries(ops).filter(([k, _]) => k !== 'modelPath').map(([k, v]) => {
                                            if (typeof v === 'string' && v.startsWith('FILE_ATTACHMENT:')) {
                                                const filename = v.split(':')[1] || 'Image';
                                                return `${k}: Attached (${filename})`;
                                            }
                                            return `${k}: ${v}`;
                                        }).join(' | ')}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid #1c2330', paddingTop: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span>Total Due</span>
                    <span>{total.toFixed(2)} AED</span>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <Link to="/" style={{ background: 'white', color: 'black', textDecoration: 'none', padding: '1rem 3rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', display: 'inline-block' }}>Return to Home</Link>
            </div>
        </div>
    );
}
