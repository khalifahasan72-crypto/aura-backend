import { useEffect } from 'react';
import ModelViewer from '../components/ModelViewer';

export default function Home() {
    useEffect(() => {
        // Show the heavy vanilla JS layout when Home mounts
        const homeView = document.getElementById('home-view');
        if (homeView) {
            homeView.style.display = 'block';
            setTimeout(() => {
                window.dispatchEvent(new Event('resize')); // helps threejs resize if needed
            }, 50);
        }

        // Hide it when Home unmounts
        return () => {
            if (homeView) {
                homeView.style.display = 'none';
            }
        };
    }, []);

    return (
        <div style={{ padding: '0 2rem', position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ marginLeft: 'auto', width: '50%', maxWidth: '600px', pointerEvents: 'auto', zIndex: 10 }}>
                <ModelViewer modelPath="/models/benchy.glb" height="500px" />
            </div>
        </div>
    );
}
