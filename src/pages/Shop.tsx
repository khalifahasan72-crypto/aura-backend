import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import ModelViewer from '../components/ModelViewer';

export default function Shop() {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', padding: '0 2rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Shop Products</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.2rem' }}>
                {PRODUCTS.map(p => (
                    <div
                        key={p.id}
                        style={{ background: 'rgba(14,15,18,0.75)', border: '1px solid rgba(28,35,48,0.6)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                        onClick={() => navigate(p.id === 't13-figure' ? '/custom-t13' : `/product/${p.id}`)}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <ModelViewer modelPath={p.id === 't13-figure' ? '/models/full black.glb' : (p.glbPath || `/models/${p.id}.glb`)} height="250px" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{p.name}</h3>
                        <p style={{ color: '#a7b0bc', marginBottom: '1rem', flexGrow: 1 }}>{p.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{p.basePrice.toFixed(2)} AED</span>
                            <button
                                style={{ background: '#16324F', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Customize
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
