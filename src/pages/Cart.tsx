
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';

export default function Cart() {
    const { cart, updateQuantity, removeItem, clearCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '5rem', color: 'white' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Your cart is empty</h1>
                <button
                    onClick={() => navigate('/shop')}
                    style={{ padding: '1rem 2rem', background: 'white', color: 'black', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', border: 'none', fontSize: '1.2rem' }}
                >
                    Browse products
                </button>
            </div>
        );
    }

    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', color: 'white', padding: '0 clamp(1rem, 5vw, 2rem)' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '2rem' }}>Your Cart</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map((item) => (
                    <div key={item.cartItemId} style={{ background: 'rgba(14,15,18,0.75)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(28,35,48,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: 80, height: 80, background: '#0E0F12', borderRadius: '8px', border: '1px solid rgba(28,35,48,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {item.previewModelPath ? (
                                    <ModelViewer
                                        modelPath={item.previewModelPath}
                                        height="100%"
                                        jointColor={item.selectedOptions['Joint Color']}
                                        armorColor={item.selectedOptions['Armor Color']}
                                    />
                                ) : (
                                    <Package size={32} color="#a7b0bc" />
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                                <p style={{ color: '#a7b0bc', fontSize: '0.9rem', margin: 0 }}>
                                    {Object.entries(item.selectedOptions).map(([k, v]) => {
                                        if (typeof v === 'string' && v.startsWith('FILE_ATTACHMENT:')) {
                                            const filename = v.split(':')[1] || 'Image';
                                            return `${k}: Attached (${filename})`;
                                        }
                                        return `${k}: ${v}`;
                                    }).join(' | ')}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 3vw, 2rem)', marginTop: '1rem', width: '100%', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#000', border: '1px solid #1c2330', borderRadius: '6px', padding: '0.25rem' }}>
                                <button onClick={() => updateQuantity(item.cartItemId, -1)} style={{ background: 'transparent', color: 'white', border: 'none', width: 30, height: 30, cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
                                <span style={{ fontWeight: 'bold', width: 20, textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.cartItemId, 1)} style={{ background: 'transparent', color: 'white', border: 'none', width: 30, height: 30, cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                            </div>

                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', width: 80, textAlign: 'right' }}>
                                {(item.unitPrice * item.quantity).toFixed(2)} AED
                            </div>

                            <button onClick={() => removeItem(item.cartItemId)} style={{ background: '#4F1616', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right', borderTop: '1px solid #1c2330', paddingTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: 0 }}>Total: {total.toFixed(2)} AED</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button onClick={clearCart} style={{ background: 'transparent', color: '#a7b0bc', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear Cart</button>
                    <button onClick={() => navigate('/checkout')} style={{ background: 'white', color: 'black', fontWeight: 'bold', padding: '1rem 3rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1.2rem', width: 'min(100%, 300px)' }}>Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
}
