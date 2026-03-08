import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import ModelViewer from '../components/ModelViewer';

export default function Product() {
    const { id } = useParams<{ id: string }>();
    const product = PRODUCTS.find(p => p.id === id);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [options, setOptions] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product?.id === 't13-figure') {
            navigate('/custom-t13', { replace: true });
            return;
        }

        if (product) {
            const defaultOpts: Record<string, string> = {};
            product.optionsSchema.forEach(opt => {
                if (opt.type === 'select' && opt.options) {
                    defaultOpts[opt.name] = opt.options[0];
                } else {
                    defaultOpts[opt.name] = '';
                }
            });
            setOptions(defaultOpts);
        }
    }, [product]);

    if (!product) return <div style={{ color: 'white', textAlign: 'center', marginTop: '10vh' }}><h1>Product Not Found</h1></div>;

    let finalPrice = product.basePrice;

    if (product.weightInGrams && product.filamentCostPerGramAED !== undefined && product.electricityCostAED !== undefined && product.laborCostAED !== undefined) {
        finalPrice = (product.weightInGrams * product.filamentCostPerGramAED) + product.electricityCostAED + product.laborCostAED;

        const armorOpt = product.optionsSchema.find(o => o.name === 'armorColor');
        if (armorOpt && options['armorColor'] && options['armorColor'] !== armorOpt.options?.[0]) {
            finalPrice += 3.00; // custom armor fee
        }

        const jointOpt = product.optionsSchema.find(o => o.name === 'jointColor');
        if (jointOpt && options['jointColor'] && options['jointColor'] !== jointOpt.options?.[0]) {
            finalPrice += 2.00; // custom joint fee
        }

        const accOpt = product.optionsSchema.find(o => o.name === 'accessories');
        if (accOpt && options['accessories'] && options['accessories'] !== accOpt.options?.[0]) {
            finalPrice += 10.00; // accessories fee
        }
    }

    const handleAddToCart = (e: React.FormEvent) => {
        e.preventDefault();
        addToCart({
            productId: product.id,
            name: product.name,
            unitPrice: finalPrice,
            quantity: 1,
            selectedOptions: options,
            image: product.image,
            previewModelPath: product.glbPath
        });
        navigate('/cart');
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', padding: '0 clamp(1rem, 5vw, 2rem)' }}>
            <div style={{ display: 'flex', gap: 'clamp(2rem, 5vw, 4rem)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 'min(100%, 300px)', background: '#0E0F12', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'clamp(300px, 40vh, 400px)', border: '1px solid rgba(28,35,48,0.6)', padding: 'clamp(1rem, 5vw, 2rem)' }}>
                    <ModelViewer
                        modelPath={product.glbPath || `/models/${product.id}.glb`}
                        height="400px"
                        armorColor={options['armorColor']}
                        jointColor={options['jointColor']}
                    />
                </div>

                <div style={{ flex: 1, minWidth: 'min(100%, 300px)' }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 1rem 0' }}>{product.name}</h1>
                    <p style={{ color: '#a7b0bc', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '2rem' }}>{product.description}</p>

                    <form onSubmit={handleAddToCart} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {product.optionsSchema.map(opt => (
                            <div key={opt.name}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{opt.label}</label>
                                {opt.type === 'text' ? (
                                    <input
                                        required
                                        type="text"
                                        value={options[opt.name] || ''}
                                        onChange={e => setOptions({ ...options, [opt.name]: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }}
                                    />
                                ) : (
                                    <select
                                        required
                                        value={options[opt.name] || ''}
                                        onChange={e => setOptions({ ...options, [opt.name]: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.5)', border: '1px solid #1c2330', color: 'white', borderRadius: '6px' }}
                                    >
                                        {opt.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                )}
                            </div>
                        ))}

                        <div style={{ marginTop: '1rem', borderTop: '1px solid #1c2330', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{finalPrice.toFixed(2)} AED</span>
                            <button
                                type="submit"
                                style={{ background: 'white', color: 'black', fontWeight: 'bold', padding: '1rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
