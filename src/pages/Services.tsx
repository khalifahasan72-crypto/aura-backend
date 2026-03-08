import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, ShoppingCart, Upload, Type } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';
import { PRODUCTS } from '../data/products';

const FEATURED_PRINTS = [
    {
        id: 't13-figure',
        name: 'T13 Figure',
        desc: 'Fully articulated action figure standard print.',
        weight: 85,
        electricityCost: 1.20,
        filamentCostPerG: 0.12,
        estimatedTotalCost: 11.40,
        printTime: '~6h',
        material: 'PLA+',
        layerHeight: '0.16mm',
        infill: '20%',
        notes: 'Fully articulated joints, minimal assembly required.',
        glbPath: '/models/t13.glb'
    },

    {
        id: 'phone-stand',
        name: 'Phone Stand',
        desc: 'Foldable / solid strong original mount for a phone.',
        weight: 110,
        electricityCost: 1.50,
        filamentCostPerG: 0.12,
        estimatedTotalCost: 9.99,
        printTime: '~8h',
        material: 'ABS',
        layerHeight: '0.2mm',
        infill: '50% / 100%',
        notes: 'Original sturdy mount. Select 100% for maximum durability.',
        glbPath: '/models/phonestand-v1.glb'
    },
    {
        id: 'dragon-model',
        name: 'Dragon',
        desc: 'Spectacular articulated dragon. It moves and it\'s like a fidget toy you can play with! Currently available only in White.',
        weight: 150,
        electricityCost: 2.50,
        filamentCostPerG: 0.12,
        estimatedTotalCost: 15.00,
        printTime: '~10h',
        material: 'Silk PLA',
        layerHeight: '0.16mm',
        infill: '15%',
        notes: 'Only available in white.',
        glbPath: '/models/dragon.glb'
    }
];



function ServiceCard({ product, onSelectDetail }: { product: typeof FEATURED_PRINTS[0], onSelectDetail: (p: any, config: any) => void }) {
    const { addToCart } = useCart();

    // Dynamic options for other products
    const productData = PRODUCTS.find(p => p.id === product.id);
    const [customOptions, setCustomOptions] = useState<Record<string, any>>(
        product.id === 'phone-stand' ? { strength: '50%' } : {}
    );

    const isT13 = product.id === 't13-figure';

    let finalPrice = product.estimatedTotalCost;
    if (product.id === 'phone-stand') {
        finalPrice = customOptions['strength'] === '100%' ? 14.99 : 9.99;
    }

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        let selectedOptions: Record<string, string> = {};
        if (isT13) {
            // Not used, handled in CustomT13
        } else {
            // Map internal option names to labels for humans
            productData?.optionsSchema.forEach(opt => {
                const val = customOptions[opt.name];
                if (val) {
                    if (opt.type === 'file' && val.data) {
                        selectedOptions[opt.label] = `FILE_ATTACHMENT:${val.name}:${val.data}`;
                    } else {
                        selectedOptions[opt.label] = val;
                    }
                }
            });
            // Defaults if empty
            if (Object.keys(selectedOptions).length === 0) {
                selectedOptions = { Color: 'Standard', Finish: 'Default' };
            }
        }

        addToCart({
            productId: product.id,
            name: product.name,
            unitPrice: finalPrice,
            quantity: 1,
            selectedOptions: {
                ...selectedOptions,
                'Weight': `${product.weight || 0}g`
            },
            image: '',
            previewModelPath: isT13 ? '/models/full black.glb' : (product.glbPath || `/models/${product.id}.glb`)
        });
    };

    return (
        <div className="product-card">
            <div className="viewer-container">
                <ModelViewer
                    modelPath={isT13 ? '/models/full black.glb' : (product.glbPath || `/models/${product.id}.glb`)}
                    height="250px"
                />
            </div>
            <div className="card-content">
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>{product.name}</h3>
                <p style={{ color: '#a7b0bc', fontSize: '0.95rem', marginBottom: '1.5rem', flexGrow: 1 }}>{product.desc}</p>

                {/* Dynamic Options for Custom Items */}
                {!isT13 && productData && productData.optionsSchema && productData.optionsSchema.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {productData.optionsSchema.map(opt => (
                            <div key={opt.name}>
                                <label style={{ fontSize: '0.85rem', color: '#8892b0', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {opt.type === 'text' && <Type size={14} />}
                                    {opt.type === 'file' && <Upload size={14} />}
                                    {opt.label}
                                </label>

                                {opt.type === 'text' && (
                                    <input
                                        type="text"
                                        placeholder={`Enter ${opt.label.toLowerCase()}...`}
                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.6rem', color: 'white', fontSize: '0.9rem' }}
                                        value={customOptions[opt.name] || ''}
                                        onChange={(e) => setCustomOptions({ ...customOptions, [opt.name]: e.target.value })}
                                        onClick={e => e.stopPropagation()}
                                    />
                                )}

                                {opt.type === 'file' && (
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg"
                                            style={{ display: 'none' }}
                                            id={`file-${product.id}-${opt.name}`}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setCustomOptions({ ...customOptions, [opt.name]: { name: file.name, data: reader.result } });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`file-${product.id}-${opt.name}`}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.8rem', cursor: 'pointer', fontSize: '0.85rem', color: '#a7b0bc', transition: 'all 0.2s' }}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {customOptions[opt.name] ? `Selected: ${customOptions[opt.name].name}` : `Click to attach ${opt.label.toLowerCase()}`}
                                        </label>
                                    </div>
                                )}

                                {opt.type === 'select' && opt.options && (
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {opt.options.map(o => (
                                            <button
                                                key={o}
                                                onClick={(e) => { e.stopPropagation(); setCustomOptions({ ...customOptions, [opt.name]: o }); }}
                                                style={{
                                                    padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem',
                                                    background: customOptions[opt.name] === o ? 'white' : 'rgba(255,255,255,0.05)',
                                                    color: customOptions[opt.name] === o ? 'black' : 'white',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {o}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                    <div className="spec-row">
                        <span style={{ color: '#8892b0' }}>Weight</span>
                        <span>{product.weight} g</span>
                    </div>
                    <div className="spec-row">
                        <span style={{ color: '#8892b0' }}>Electricity</span>
                        <span>{product.electricityCost.toFixed(2)} AED</span>
                    </div>
                    <div className="spec-row">
                        <span style={{ color: '#8892b0' }}>Filament</span>
                        <span>{product.filamentCostPerG.toFixed(2)} /g</span>
                    </div>

                    <div className="spec-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                        <span>Base Cost</span>
                        <span style={{ color: '#fff' }}>{finalPrice.toFixed(2)} AED</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', flexDirection: 'column' }}>
                    {isT13 ? (
                        <button className="btn-primary" onClick={() => window.location.href = '/custom-t13'}>
                            Open Customizer
                        </button>
                    ) : (
                        <>
                            <button className="btn-secondary" onClick={() => onSelectDetail(product, { customOptions })}>
                                View Details
                            </button>
                            <button className="btn-primary" onClick={handleAddToCart}>
                                <ShoppingCart size={18} /> Add to Cart
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Services() {
    const { addToCart } = useCart();
    const [selectedProduct, setSelectedProduct] = useState<{ product: typeof FEATURED_PRINTS[0], config?: any } | null>(null);

    const handleAddToCartFromModal = (product: typeof FEATURED_PRINTS[0], config?: any) => {
        const isT13 = product.id === 't13-figure';
        const productData = PRODUCTS.find(p => p.id === product.id);

        let selectedOptions: Record<string, string> = {};
        if (isT13 && config) {
            selectedOptions = {
                'Joint Color': config.jointColor,
                'Armor Color': config.armorColor,
                'Accessories Kit': config.includeAccessories ? 'Included (+10 AED)' : 'None'
            };
        } else if (config?.customOptions) {
            productData?.optionsSchema.forEach(opt => {
                const val = config.customOptions[opt.name];
                if (val) {
                    if (opt.type === 'file' && val instanceof File) {
                        selectedOptions[opt.label] = `Uploaded: ${val.name}`;
                    } else {
                        selectedOptions[opt.label] = val;
                    }
                }
            });
        }

        if (Object.keys(selectedOptions).length === 0) {
            selectedOptions = { Color: 'Standard', Finish: 'Default' };
        }

        addToCart({
            productId: product.id,
            name: product.name,
            unitPrice: config?.finalPrice || product.estimatedTotalCost,
            quantity: 1,
            selectedOptions,
            image: '',
            previewModelPath: isT13 ? '/models/full black.glb' : (product.glbPath || `/models/${product.id}.glb`)
        });
        setSelectedProduct(null);
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', padding: '2rem 2rem 5rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>Featured Prints</h1>
                <p style={{ fontSize: '1.2rem', color: '#a7b0bc', maxWidth: '600px', margin: '0 auto' }}>
                    Preview custom products, explore print specs, and add them to your cart.
                </p>
            </div>

            <style>{`
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 1.2rem;
                }
                .product-card {
                    background: rgba(20, 22, 26, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .viewer-container {
                    height: 250px;
                    background: linear-gradient(180deg, #111 0%, #0a0b0c 100%);
                    position: relative;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .card-content {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                .spec-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: '#a7b0bc';
                    padding: 0.25rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .spec-row:last-child {
                    border-bottom: none;
                }
                .btn-primary {
                    background: white;
                    color: black;
                    border: none;
                    border-radius: 10px;
                    padding: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: background 0.2s;
                }
                .btn-primary:hover {
                    background: #f0f0f0;
                }
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    padding: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(5px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .modal-content {
                    background: #111;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: row;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                @media(max-width: 768px) {
                    .modal-content {
                        flex-direction: column;
                    }
                    .modal-viewer {
                        height: 300px;
                        border-right: none !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                }
            `}</style>

            <div className="product-grid">
                {FEATURED_PRINTS.map(product => (
                    <ServiceCard
                        key={product.id}
                        product={product}
                        onSelectDetail={(p, config) => setSelectedProduct({ product: p, config })}
                    />
                ))}
            </div>

            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-viewer" style={{ flex: 1, minHeight: 400, background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                            <ModelViewer
                                modelPath={selectedProduct.product.glbPath || `/models/${selectedProduct.product.id}.glb`}
                                height="400px"
                            />
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', backdropFilter: 'blur(5px)' }}>
                                Interactive 3D Preview
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#a7b0bc', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <X size={24} />
                            </button>

                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>{selectedProduct.product.name}</h2>
                            <p style={{ color: '#a7b0bc', fontSize: '1.1rem', marginBottom: '2rem' }}>{selectedProduct.product.desc}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Print Specs</h4>
                                    <div className="spec-row"><span style={{ color: '#8892b0' }}>Material</span><span>{selectedProduct.product.material}</span></div>
                                    <div className="spec-row"><span style={{ color: '#8892b0' }}>Time</span><span>{selectedProduct.product.printTime}</span></div>
                                    <div className="spec-row"><span style={{ color: '#8892b0' }}>Layer Height</span><span>{selectedProduct.product.layerHeight}</span></div>
                                    <div className="spec-row"><span style={{ color: '#8892b0' }}>Infill</span><span>{selectedProduct.product.infill}</span></div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Cost Breakdown</h4>
                                    <div className="spec-row"><span style={{ color: '#8892b0' }}>Weight</span><span>{selectedProduct.product.weight} g</span></div>
                                    <div className="spec-row"><span style={{ color: '#8892b0' }}>Electricity</span><span>{selectedProduct.product.electricityCost.toFixed(2)} AED</span></div>
                                    <div className="spec-row"><span style={{ color: '#8892b0' }}>Filament</span><span>{selectedProduct.product.filamentCostPerG.toFixed(2)} /g</span></div>

                                    {selectedProduct.product.id === 't13-figure' && selectedProduct.config?.jointColor !== 'Black' && (
                                        <div className="spec-row"><span style={{ color: '#8892b0' }}>Custom Joint</span><span style={{ color: '#a7b0bc' }}>+2.00 AED</span></div>
                                    )}
                                    {selectedProduct.product.id === 't13-figure' && selectedProduct.config?.armorColor !== 'Black' && (
                                        <div className="spec-row"><span style={{ color: '#8892b0' }}>Custom Armor</span><span style={{ color: '#a7b0bc' }}>+3.00 AED</span></div>
                                    )}
                                    {selectedProduct.product.id === 't13-figure' && selectedProduct.config?.includeAccessories && (
                                        <div className="spec-row"><span style={{ color: '#8892b0' }}>Accessories Kit</span><span style={{ color: '#a7b0bc' }}>+10.00 AED</span></div>
                                    )}

                                    <div className="spec-row" style={{ fontWeight: 'bold' }}>
                                        <span style={{ color: '#8892b0' }}>Total</span>
                                        <span>{(selectedProduct.config?.finalPrice || selectedProduct.product.estimatedTotalCost).toFixed(2)} AED</span>
                                    </div>
                                </div>
                            </div>

                            {selectedProduct.config?.customOptions && Object.keys(selectedProduct.config.customOptions).length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Your Customizations</h4>
                                    {Object.entries(selectedProduct.config.customOptions).map(([key, val]: [string, any]) => {
                                        const optLabel = PRODUCTS.find(p => p.id === selectedProduct.product.id)?.optionsSchema.find(o => o.name === key)?.label || key;
                                        return (
                                            <div key={key} className="spec-row">
                                                <span style={{ color: '#8892b0' }}>{optLabel}</span>
                                                <span style={{ color: '#fff' }}>{val instanceof File ? val.name : val}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '10px', marginBottom: '2rem' }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#a7b0bc', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Notes</h5>
                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{selectedProduct.product.notes}</p>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {(selectedProduct.config?.finalPrice || selectedProduct.product.estimatedTotalCost).toFixed(2)} <span style={{ fontSize: '1rem', color: '#8892b0' }}>AED</span>
                                </div>
                                <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => handleAddToCartFromModal(selectedProduct.product, selectedProduct.config)}>
                                    <ShoppingCart size={20} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
