import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
    const { cart, clearCart } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const orderData = Object.fromEntries(formData.entries());

        const payload = {
            cart: cart.map(item => ({
                id: item.productId,
                quantity: item.quantity,
                basePrice: item.unitPrice,
                name: item.name,
                selectedOptions: {
                    ...item.selectedOptions,
                    modelPath: item.previewModelPath
                }
            })),
            customerName: orderData.customerName,
            phone: orderData.phone,
            email: orderData.email,
            pickupMethod: `${orderData.pickupMethod} - Class: ${orderData.classLocation}`,
            notes: orderData.notes,
            paymentMethod: orderData.paymentMethod
        };

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        try {
            console.log(`🚀 Sending order payload to ${apiBase}/api/orders:`, payload);
            const response = await fetch(`${apiBase}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                console.error('Backend error:', data);
                throw new Error(data.error || 'Server rejected order');
            }

            clearCart();
            navigate('/success', { state: { orderNumber: data.orderId, cart, total, method: orderData.pickupMethod, guestEmail: payload.email } });
        } catch (err: any) {
            console.error(err);
            alert(`Failed to place order: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        navigate('/shop');
        return null;
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', color: 'white', padding: '0 clamp(1rem, 5vw, 2rem)' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '2rem' }}>Checkout ({total.toFixed(2)} AED)</h1>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap-reverse' }}>
                <div style={{ flex: 1, minWidth: 'min(100%, 300px)', background: 'rgba(14,15,18,0.75)', padding: 'clamp(1rem, 5vw, 2rem)', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Summary</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {cart.map(item => (
                            <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1c2330', paddingBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{item.quantity}x {item.name}</h4>
                                    <p style={{ color: '#a7b0bc', fontSize: '0.85rem', margin: 0 }}>
                                        {Object.entries(item.selectedOptions).map(([k, v]) => {
                                            if (typeof v === 'string' && v.startsWith('FILE_ATTACHMENT:')) {
                                                const filename = v.split(':')[1] || 'Image';
                                                return `${k}: Attached (${filename})`;
                                            }
                                            return `${k}: ${v}`;
                                        }).join(' | ')}
                                    </p>
                                </div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {(item.unitPrice * item.quantity).toFixed(2)} AED
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: 'min(100%, 300px)', background: 'rgba(14,15,18,0.75)', padding: 'clamp(1rem, 5vw, 2rem)', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a7b0bc' }}>Full Name</label>
                            <input required type="text" name="customerName" defaultValue={user?.name || ''} style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a7b0bc' }}>Phone Number</label>
                            <input required type="text" name="phone" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a7b0bc' }}>Email {user ? '(Signed In)' : '(For guest tracking)'}</label>
                            <input required type="email" name="email" defaultValue={user?.email || ''} style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a7b0bc' }}>Delivery Method</label>
                            <select required name="pickupMethod" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }}>
                                <option value="Pick up at school">Pick up at school</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a7b0bc' }}>Class Location / Grade</label>
                            <input required type="text" name="classLocation" placeholder="e.g. 10A" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a7b0bc' }}>Payment Method</label>
                            <select required name="paymentMethod" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }}>
                                <option value="Pay at School">Pay at School (Cash / Card)</option>
                            </select>
                            <p style={{ fontSize: '0.85rem', color: '#5a7ca3', marginTop: '0.5rem' }}>Online payments disabled during dev. Place order and pay IRL.</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a7b0bc' }}>Order Notes (optional)</label>
                            <textarea name="notes" rows={3} style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #1c2330', color: 'white', borderRadius: '6px', resize: 'vertical' }}></textarea>
                        </div>

                        <button type="submit" disabled={loading} style={{ background: 'white', color: 'black', fontWeight: 'bold', padding: '1rem', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.2rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
