import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModelViewer from '../components/ModelViewer';
import { useCart } from '../context/CartContext';

const COLORS = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Black', hex: '#222222' },
    { name: 'Neon Green', hex: '#39ff14' },
    { name: 'Red', hex: '#ff0000' },
    { name: 'Blue', hex: '#0000ff' },
    { name: 'Gold', hex: '#ffd700' }
];

const DEFAULT_JOINT = 'Black';
const DEFAULT_ARMOR = 'Black';
const BASE_PRICE = 85 * 0.12 + 1.20 + 2.00; // 13.40 AED
const JOINT_FEE = 2.00;
const ARMOR_FEE = 3.00;
const ACCESSORY_FEE = 10.00;

const getT13ModelPath = (jointColor: string, armorColor: string) => {
    if (jointColor === 'White' && armorColor === 'White') {
        return '/models/full wight t13.glb';
    }
    if (jointColor === 'Black' && armorColor === 'White') {
        return '/models/black white.glb';
    }
    if (jointColor === 'Neon Green' && armorColor === 'White') {
        return '/models/greenwhite.glb';
    }
    if (jointColor === 'Red' && armorColor === 'White') {
        return '/models/redwhight.glb';
    }
    if (jointColor === 'Blue' && armorColor === 'White') {
        return '/models/bluewhite.glb';
    }
    if (jointColor === 'Gold' && armorColor === 'White') {
        return '/models/goldwhite.glb';
    }
    if (jointColor === 'White' && armorColor === 'Black') {
        return '/models/whiteblack.glb';
    }
    if (jointColor === 'Black' && armorColor === 'Black') {
        return '/models/full black.glb';
    }
    if (jointColor === 'Neon Green' && armorColor === 'Black') {
        return '/models/greenblack.glb';
    }
    if (jointColor === 'Red' && armorColor === 'Black') {
        return '/models/redblaclk.glb';
    }
    if (jointColor === 'Blue' && armorColor === 'Black') {
        return '/models/blueblack.glb';
    }
    if (jointColor === 'Gold' && armorColor === 'Black') {
        return '/models/goldblack.glb';
    }
    if (jointColor === 'White' && armorColor === 'Neon Green') {
        return '/models/white green.glb';
    }
    if (jointColor === 'Black' && armorColor === 'Neon Green') {
        return '/models/black green.glb';
    }
    if (jointColor === 'Neon Green' && armorColor === 'Neon Green') {
        return '/models/full green.glb';
    }
    if (jointColor === 'Red' && armorColor === 'Neon Green') {
        return '/models/redgreen.glb';
    }
    if (jointColor === 'Blue' && armorColor === 'Neon Green') {
        return '/models/bluegreen.glb';
    }
    if (jointColor === 'Gold' && armorColor === 'Neon Green') {
        return '/models/gold green.glb';
    }
    if (jointColor === 'White' && armorColor === 'Red') {
        return '/models/whiteredA.glb';
    }
    if (jointColor === 'Black' && armorColor === 'Red') {
        return '/models/black red.glb';
    }
    if (jointColor === 'Neon Green' && armorColor === 'Red') {
        return '/models/greenred.glb';
    }
    if (jointColor === 'Red' && armorColor === 'Red') {
        return '/models/full red.glb';
    }
    if (jointColor === 'Blue' && armorColor === 'Red') {
        return '/models/bluered.glb';
    }
    if (jointColor === 'Gold' && armorColor === 'Red') {
        return '/models/goldred.glb';
    }
    if (jointColor === 'White' && armorColor === 'Blue') {
        return '/models/whiteblue.glb';
    }
    if (jointColor === 'Neon Green' && armorColor === 'Blue') {
        return '/models/greenblue.glb';
    }
    if (jointColor === 'Red' && armorColor === 'Blue') {
        return '/models/redblue.glb';
    }
    if (jointColor === 'Black' && armorColor === 'Blue') {
        return '/models/blackblue.glb';
    }
    if (jointColor === 'Blue' && armorColor === 'Blue') {
        return '/models/fullblue.glb';
    }
    if (jointColor === 'Gold' && armorColor === 'Blue') {
        return '/models/goldblue.glb';
    }
    return `/models/${armorColor.toLowerCase()} ${jointColor.toLowerCase()} t13.glb`;
};

export default function CustomT13() {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [jointColor, setJointColor] = useState(DEFAULT_JOINT);
    const [armorColor, setArmorColor] = useState(DEFAULT_ARMOR);
    const [includeAccessories, setIncludeAccessories] = useState(false);

    const isJointChanged = jointColor !== DEFAULT_JOINT;
    const isArmorChanged = armorColor !== DEFAULT_ARMOR;

    const finalPrice = BASE_PRICE + (isJointChanged ? JOINT_FEE : 0) + (isArmorChanged ? ARMOR_FEE : 0) + (includeAccessories ? ACCESSORY_FEE : 0);

    const handleAddToCart = () => {
        addToCart({
            productId: 't13-figure',
            name: 'Custom T13 Figure',
            unitPrice: finalPrice,
            quantity: 1,
            selectedOptions: {
                'Joint Color': jointColor,
                'Armor Color': armorColor,
                'Accessories Kit': includeAccessories ? 'Included (2 Hats, 2 Katanas, 1 Gun)' : 'None',
                'Weight': '85g'
            },
            previewModelPath: getT13ModelPath(jointColor, armorColor),
            image: 'https://placehold.co/400x300?text=Custom+T13',
        });
        navigate('/cart');
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', padding: '0 clamp(1rem, 5vw, 2rem)' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', background: 'linear-gradient(to right, #ffffff, #a7b0bc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Design Your Custom T13
            </h1>
            <p style={{ color: '#a7b0bc', fontSize: '1.2rem', marginBottom: '3rem' }}>
                Personalize your fully articulated T13 action figure. See your changes live in 3D.
            </p>

            <div style={{ display: 'flex', gap: 'clamp(2rem, 5vw, 4rem)', flexWrap: 'wrap' }}>
                {/* 3D Viewer Area */}
                <div style={{ flex: 1, minWidth: 'min(100%, 300px)', background: 'rgba(14,15,18,0.75)', borderRadius: '16px', border: '1px solid rgba(28,35,48,0.6)', overflow: 'hidden', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'clamp(300px, 40vh, 500px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <ModelViewer modelPath={getT13ModelPath(jointColor, armorColor)} height="100%" jointColor={jointColor} armorColor={armorColor} />
                </div>

                {/* Controls Area */}
                <div style={{ flex: 1, minWidth: 'min(100%, 300px)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Joint Colors */}
                    <div style={{ background: 'rgba(14,15,18,0.75)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>1. Joint Color</h2>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {COLORS.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => setJointColor(c.name)}
                                    title={c.name}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: c.hex,
                                        border: jointColor === c.name ? '3px solid white' : '1px solid #1c2330',
                                        cursor: 'pointer',
                                        boxShadow: jointColor === c.name ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                                        transition: 'all 0.2s ease-in-out',
                                        transform: jointColor === c.name ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                />
                            ))}
                        </div>
                        <p style={{ marginTop: '1rem', color: '#a7b0bc', fontSize: '0.9rem' }}>
                            Selected: <span style={{ color: 'white', fontWeight: 'bold' }}>{jointColor}</span>
                        </p>
                    </div>

                    {/* Armor Colors */}
                    <div style={{ background: 'rgba(14,15,18,0.75)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>2. Armor Color</h2>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {COLORS.filter(c => c.name !== 'Gold').map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => setArmorColor(c.name)}
                                    title={c.name}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: c.hex,
                                        border: armorColor === c.name ? '3px solid white' : '1px solid #1c2330',
                                        cursor: 'pointer',
                                        boxShadow: armorColor === c.name ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                                        transition: 'all 0.2s ease-in-out',
                                        transform: armorColor === c.name ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                />
                            ))}
                        </div>
                        <p style={{ marginTop: '1rem', color: '#a7b0bc', fontSize: '0.9rem' }}>
                            Selected: <span style={{ color: 'white', fontWeight: 'bold' }}>{armorColor}</span>
                        </p>
                    </div>

                    {/* Accessories */}
                    <div style={{ background: 'rgba(14,15,18,0.75)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>3. Accessories (+10 AED)</h2>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={includeAccessories}
                                onChange={e => setIncludeAccessories(e.target.checked)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '1.1rem', color: '#fff' }}>Include 2 Hats, 2 Katanas, 1 Gun, & Ready Build</span>
                        </label>
                    </div>

                    {/* Price Breakdown & Add to Cart */}
                    <div style={{ background: 'rgba(14,15,18,0.75)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(28,35,48,0.6)', marginTop: 'auto' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #1c2330', paddingBottom: '0.5rem' }}>Price Breakdown</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#a7b0bc' }}>
                            <span>Base Model (Materials + Labor)</span>
                            <span>{BASE_PRICE.toFixed(2)} AED</span>
                        </div>

                        {isJointChanged && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#a7b0bc' }}>
                                <span>Custom Joint Fee</span>
                                <span>+{JOINT_FEE.toFixed(2)} AED</span>
                            </div>
                        )}

                        {isArmorChanged && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#a7b0bc' }}>
                                <span>Custom Armor Fee</span>
                                <span>+{ARMOR_FEE.toFixed(2)} AED</span>
                            </div>
                        )}

                        {includeAccessories && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#a7b0bc' }}>
                                <span>Accessories Kit</span>
                                <span>+{ACCESSORY_FEE.toFixed(2)} AED</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1c2330' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{finalPrice.toFixed(2)} AED</span>
                            <button
                                onClick={handleAddToCart}
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    padding: '1rem 2rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    transition: 'transform 0.1s',
                                }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
