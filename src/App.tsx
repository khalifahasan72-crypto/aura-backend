import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './context/CartContext';
import Home from './pages/Home';
import Services from './pages/Services';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import CustomT13 from './pages/CustomT13';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import GoogleCallback from './pages/GoogleCallback';
import { ShoppingCart, LayoutGrid, Package, User } from 'lucide-react';
import { useAuth } from './context/AuthContext';

export default function App() {
    const { cart } = useCart();
    const { user } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    }, [cart]);

    // Ensure the vanilla JS hero section ONLY ever shows on the actual Home route
    useEffect(() => {
        const homeView = document.getElementById('home-view');
        if (homeView) {
            homeView.style.display = (location.pathname === '/' || location.pathname === '/services') ? 'block' : 'none';
        }
        // Also scroll to top on every route change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    return (
        <div style={{ paddingBottom: '50px' }}>
            <nav className="glass-nav" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>Aura</Link>
                <ul className="nav-links" style={{ listStyle: 'none' }}>
                    <li>
                        <Link to="/services" className="magnetic-link" style={{ textDecoration: 'none', color: '#a7b0bc' }}>
                            <LayoutGrid size={20} />
                            <span>Services</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/shop" className="magnetic-link" style={{ textDecoration: 'none', color: '#a7b0bc' }}>
                            <Package size={20} />
                            <span>Shop</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/cart" className="magnetic-link" style={{ textDecoration: 'none', color: '#a7b0bc', position: 'relative' }}>
                            <div style={{ position: 'relative' }}>
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#39ff14', color: 'black', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span>Cart</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={user ? "/account" : "/auth"} className="magnetic-link" style={{ textDecoration: 'none', color: '#a7b0bc' }}>
                            <User size={20} />
                            <span>{user ? 'Account' : 'Sign In'}</span>
                        </Link>
                    </li>
                </ul>
                <button
                    className="buy-btn magnetic-btn"
                    onClick={() => navigate(cartCount > 0 ? '/checkout' : '/shop')}
                    style={{ background: 'white', color: 'black', padding: '0.5rem 1.5rem', borderRadius: '20px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                    {cartCount > 0 ? 'Checkout' : 'View Products'}
                </button>
            </nav>

            <div style={{ paddingTop: '100px', minHeight: 'calc(100vh - 150px)' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<Product />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/custom-t13" element={<CustomT13 />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/auth/google/callback" element={<GoogleCallback />} />
                </Routes>
            </div>

            <footer style={{ marginTop: '5rem', padding: '2rem', borderTop: '1px solid #1c2330', textAlign: 'center', color: '#a7b0bc' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
                    <Link to="/services" style={{ color: '#a7b0bc', textDecoration: 'none' }}>Services</Link>
                    <Link to="/shop" style={{ color: '#a7b0bc', textDecoration: 'none' }}>Shop</Link>
                    <Link to="/cart" style={{ color: '#a7b0bc', textDecoration: 'none' }}>Cart</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} Aura 3D Printing. All rights reserved.</p>
            </footer>
        </div>
    );
}
