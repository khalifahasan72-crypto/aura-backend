import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import Stripe from 'stripe';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { sendTelegramOrderNotification, sendTelegramFailedOrder, sendTelegramStatusUpdate } from './backend-utils.ts';
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || 'dummy');

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aura-3d-printing.pages.dev'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('⚠️ CORS blocked from origin:', origin);
            // In development, maybe still allow? Or just log.
            return callback(null, true); // Still allowing for now but logging
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb', extended: true } as any));

const db = new Database('./dev.db');

// --- DATABASE INITIALIZATION ---
try {
    // Create User table
    db.exec(`
        CREATE TABLE IF NOT EXISTS User (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            token TEXT,
            createdAt TEXT
        );
    `);

    // Create Product table
    db.exec(`
        CREATE TABLE IF NOT EXISTS Product (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            price REAL,
            image TEXT
        );
    `);
// Create Order table
db.exec(`
CREATE TABLE IF NOT EXISTS "Order" (
    id TEXT PRIMARY KEY,
    customerName TEXT,
    phone TEXT,
    email TEXT,
    userId TEXT,
    notes TEXT,
    paymentMethod TEXT,
    paymentStatus TEXT,
    orderStatus TEXT,
    total REAL,
    pickupMethod TEXT,
    createdAt TEXT
);
`);

// Create OrderItem table
db.exec(`
CREATE TABLE IF NOT EXISTS OrderItem (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    productId TEXT,
    quantity INTEGER,
    unitPrice REAL,
    customOptionsJSON TEXT
);
`);
    // ⭐ ADD THIS PART (seed products)
    const productCount: any = db.prepare('SELECT COUNT(*) as count FROM Product').get();

    if (productCount.count === 0) {
        console.log('📦 Seeding starter products...');

        const insert = db.prepare(`
            INSERT INTO Product (id, name, description, price, image)
            VALUES (?, ?, ?, ?, ?)
        `);

        insert.run(
            't13-figure',
            'Custom T13 Figure',
            'Custom articulated T13 3D printed figure',
            25,
            '/images/t13.png'
        );

        insert.run(
            'keychain',
            '3D Printed Keychain',
            'Custom keychain print',
            10,
            '/images/keychain.png'
        );
    }

    // Migrate Order table
    const orderInfo: any = db.prepare("PRAGMA table_info('Order')").all();
    const hasEmail = orderInfo.some((c: any) => c.name === 'email');
    const hasUserId = orderInfo.some((c: any) => c.name === 'userId');

    if (!hasEmail) {
        console.log('📦 Migrating database: Adding email to Order table');
        db.exec('ALTER TABLE "Order" ADD COLUMN email TEXT');
    }

    if (!hasUserId) {
        console.log('📦 Migrating database: Adding userId to Order table');
        db.exec('ALTER TABLE "Order" ADD COLUMN userId TEXT');
    }

    console.log('✅ Database schema verified.');
}
catch (e: any) {
    console.error('❌ Schema initialization failed:', e.message);
}// Simple auth middleware
const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const user = db
                .prepare('SELECT id, email, name FROM User WHERE token = ?')
                .get(token);

            if (user) {
                req.user = user;
            }
        } catch (e) {}
    }

    next();
};

app.use(authenticate);

// ---- AUTH ENDPOINTS ----
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const existing = db.prepare('SELECT id FROM User WHERE email = ?').get(email);
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const id = `user-${Date.now()}`;
        const passwordHash = crypto.scryptSync(password, 'salt', 64).toString('hex');
        const token = crypto.randomBytes(32).toString('hex');

        db.prepare('INSERT INTO User (id, name, email, password, token, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
            .run(id, name, email, passwordHash, token, new Date().toISOString());

        res.json({ token, user: { id, name, email } });
    } catch (e: any) {
        res.status(500).json({ error: e.message || 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    try {
        const user: any = db.prepare('SELECT * FROM User WHERE email = ?').get(email);
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const hash = crypto.scryptSync(password, 'salt', 64).toString('hex');
        if (hash !== user.password) return res.status(400).json({ error: 'Invalid credentials' });

        const token = crypto.randomBytes(32).toString('hex');
        db.prepare('UPDATE User SET token = ? WHERE id = ?').run(token, user.id);

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/auth/me', (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ user: req.user });
});

app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    console.log('🔑 Backend received Google credential');

    try {
        const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
        console.log('🆔 Using Google Client ID:', clientId);

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: clientId ? clientId : undefined
        });

        const payload = ticket.getPayload();
        console.log('📄 Google Payload verified:', payload?.email);

        if (!payload || !payload.email) {
            console.error('❌ Google Token verification failed - No payload or email');
            return res.status(400).json({ error: 'Invalid Google Token Payload' });
        }

        const { email, name, sub: googleId } = payload;

        let user: any = db.prepare('SELECT * FROM User WHERE email = ?').get(email);
        const token = crypto.randomBytes(32).toString('hex');

        if (user) {
            console.log('👤 Existing user found:', email);
            db.prepare('UPDATE User SET token = ? WHERE id = ?').run(token, user.id);
        } else {
            console.log('🆕 Creating new user from Google profile:', email);
            const id = `user-${Date.now()}`;
            db.prepare('INSERT INTO User (id, name, email, password, token, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
                .run(id, name, email, googleId, token, new Date().toISOString());
            user = { id, name, email };
        }

        // Link any previous guest orders matching this email
        const ordersLinked = db.prepare('UPDATE "Order" SET userId = ? WHERE email = ? AND userId IS NULL').run(user.id, email);
        if (ordersLinked.changes > 0) {
            console.log(`🔗 Successfully linked ${ordersLinked.changes} past guest orders to user.`);
        }

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (e: any) {
        console.error('💣 Backend Google Auth Exception:', e.message);
        res.status(500).json({ error: `Google Auth backend failed: ${e.message}` });
    }
});


app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM Product').all();
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM Product WHERE id = ?').get(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/orders', async (req: any, res) => {
    try {
        const { cart, customerName, phone, email, pickupMethod, notes, paymentMethod } = req.body;
        console.log('🛒 New order request received:', { customerName, email, userId: req.user?.id });
        console.log('📦 Order items:', cart.length);

        // Validation
        if (!cart || cart.length === 0) return res.status(400).json({ ok: false, error: 'Cart is empty' });
        if (!customerName || !phone || !pickupMethod || !paymentMethod) {
            return res.status(400).json({ ok: false, error: 'Missing required order fields' });
        }

        let total = 0;
        for (const item of cart) {
            const price = item.unitPrice || item.basePrice;
            total += price * item.quantity;
        }

        const orderId = `cuid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const userId = req.user ? req.user.id : null;

        const insertOrder = db.prepare(`
            INSERT INTO "Order" (id, customerName, phone, email, userId, notes, paymentMethod, paymentStatus, orderStatus, total, pickupMethod, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertItem = db.prepare(`
            INSERT INTO OrderItem (id, orderId, productId, quantity, unitPrice, customOptionsJSON)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        // Use transaction for saving order
        const saveOrder = db.transaction(() => {
            insertOrder.run(
                orderId,
                customerName,
                phone,
                email || null,
                userId,
                notes || '',
                paymentMethod,
                'UNPAID',
                'Pending', // Updated initial status
                total,
                pickupMethod,
                new Date().toISOString()
            );

            for (const item of cart) {
                const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                insertItem.run(
                    itemId,
                    orderId,
                    item.productId || item.id,
                    item.quantity,
                    item.unitPrice || item.basePrice,
                    JSON.stringify(item.selectedOptions || item.customOptions || {})
                );
            }
        });

        saveOrder();

        // Build order object for Telegram manually mapped
        const orderForTelegram = {
            id: orderId,
            customerName,
            phone,
            pickupMethod,
            notes: notes || '',
            paymentMethod,
            paymentStatus: 'UNPAID',
            orderStatus: 'Pending',
            total,
            createdAt: new Date().toISOString(),
            items: cart.map((i: any) => ({
                productId: i.productId || i.id,
                quantity: i.quantity,
                unitPrice: i.unitPrice || i.basePrice,
                customOptionsJSON: JSON.stringify(i.selectedOptions || i.customOptions || {}),
                product: { name: i.name } // mocked product relation
            }))
        };

        // Trigger Telegram notification asynchronously
        sendTelegramOrderNotification(orderForTelegram).catch(err => console.error('Telegram background error:', err));

        // ... 

        if (paymentMethod === 'APPLE_PAY') {
            const intent = await stripe.paymentIntents.create({
                amount: Math.round(total * 100),
                currency: 'usd',
                metadata: { orderId }
            });
            res.json({ ok: true, orderId, clientSecret: intent.client_secret });
        } else {
            res.json({ ok: true, orderId });
        }
    } catch (err: any) {
        console.error(err);
        sendTelegramFailedOrder(err.message || 'Unknown server error', req.body.customerName || 'Unknown');
        res.status(500).json({ ok: false, error: err.message || 'Failed to create order' });
    }
});

// Mock remaining endpoints simply

// Get orders for signed-in user
app.get('/api/orders', (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });
    try {
        const orders = db.prepare('SELECT * FROM "Order" WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);

        // Fetch items for each order
        const getItems = db.prepare(`
            SELECT OrderItem.*, Product.name as productName, Product.image as productImage
            FROM OrderItem 
            LEFT JOIN Product ON OrderItem.productId = Product.id
            WHERE orderId = ?
        `);

        const fullOrders = orders.map((o: any) => ({
            ...o,
            items: getItems.all(o.id)
        }));

        res.json(fullOrders);
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Track order for guest
app.get('/api/orders/track', (req, res) => {
    const { orderId, email } = req.query;
    if (!orderId || !email) return res.status(400).json({ error: 'Missing tracking info' });

    try {
        const order: any = db.prepare('SELECT * FROM "Order" WHERE id = ? AND email = ?').get(orderId, email);
        if (!order) return res.status(404).json({ error: 'Order not found or email mismatch' });

        // Fetch items
        const items = db.prepare(`
            SELECT OrderItem.*, Product.name as productName, Product.image as productImage
            FROM OrderItem 
            LEFT JOIN Product ON OrderItem.productId = Product.id
            WHERE orderId = ?
        `).all(order.id);

        res.json({ ...order, items });
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});


// Admin order routes
app.get('/api/admin/orders', (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM "Order" ORDER BY createdAt DESC').all();
        const getItems = db.prepare('SELECT * FROM OrderItem WHERE orderId = ?');

        const fullOrders = orders.map((o: any) => ({
            ...o,
            items: getItems.all(o.id)
        }));
        res.json(fullOrders);
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/admin/login', (req, res) => res.json({ token: 'admin123' }));

app.post('/api/admin/orders/:id/status', (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status required' });

    try {
        db.prepare('UPDATE "Order" SET orderStatus = ? WHERE id = ?').run(status, req.params.id);
        const order: any = db.prepare('SELECT * FROM "Order" WHERE id = ?').get(req.params.id);
        if (order) {
            sendTelegramStatusUpdate(req.params.id, status, order.customerName || 'Customer').catch(() => { });
        }
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/stripe/webhook', (req, res) => res.send());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    startTelegramPolling();
});

// --- TELEGRAM BOT POLLING ---
import { editTelegramMessage } from './backend-utils.ts';
async function startTelegramPolling() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !adminChatId) {
        console.warn('⚠️ Telegram polling disabled (missing TOKEN or CHAT_ID)');
        return;
    }

    let lastUpdateId = 0;
    console.log('🤖 Telegram Status Bot is now polling...');

    while (true) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
            const data: any = await response.json();

            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    lastUpdateId = update.update_id;

                    if (update.callback_query) {
                        const { id: callbackId, data: cbData, message, from } = update.callback_query;
                        const chatId = String(message.chat.id);

                        // 🔒 Security Check: Only the authorized admin channel can update
                        if (chatId !== adminChatId) {
                            await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ callback_query_id: callbackId, text: '❌ Unauthorized Access', show_alert: true })
                            });
                            continue;
                        }

                        // Parse: st_{orderId}_{newStatus}
                        if (cbData.startsWith('st_')) {
                            const parts = cbData.split('_');
                            const orderId = parts[1];
                            const newStatus = parts.slice(2).join('_'); // Handle spaces in status

                            console.log(`⚡ Telegram Status Request: Order ${orderId} -> ${newStatus}`);

                            try {
                                // 1. Update DB
                                const result = db.prepare('UPDATE "Order" SET orderStatus = ? WHERE id = ?').run(newStatus, orderId);

                                if (result.changes > 0) {
                                    const order: any = db.prepare('SELECT * FROM "Order" WHERE id = ?').get(orderId);

                                    // 2. Edit the original message to reflect change
                                    const newText = message.text.split('Current Status:')[0] + `Current Status: ${newStatus === 'Completed' ? '🏁' : newStatus === 'Cancelled' ? '❌' : '🟡'} ${newStatus}`;
                                    await editTelegramMessage(chatId, message.message_id, newText, orderId);

                                    // 3. Answer with success toast
                                    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            callback_query_id: callbackId,
                                            text: `✅ Status updated to ${newStatus}`
                                        })
                                    });
                                } else {
                                    throw new Error('Order not found');
                                }
                            } catch (e: any) {
                                await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ callback_query_id: callbackId, text: `❌ Error: ${e.message}`, show_alert: true })
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Telegram polling error:', error);
            await new Promise(r => setTimeout(r, 5000)); // Cool down
        }
    }
}







