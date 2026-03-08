import dotenv from 'dotenv';
dotenv.config();

function getBotConfig() {
    return {
        TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        CHAT_ID: process.env.TELEGRAM_CHAT_ID
    };
}

async function sendTelegramText(message: string) {
    const { TOKEN, CHAT_ID } = getBotConfig();
    if (!TOKEN || !CHAT_ID) return;

    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (e) {
        console.error('Telegram generic send error', e);
    }
}

export async function sendTelegramOrderNotification(order: any) {
    const { TOKEN, CHAT_ID } = getBotConfig();
    if (!TOKEN || !CHAT_ID) return;

    try {
        let itemsText = '';
        const photosToSend: { filename: string, buffer: Buffer }[] = [];

        order.items.forEach((item: any, index: number) => {
            const name = item.product?.name || item.productName || item.productId || 'Unknown Product';
            itemsText += `\n<b>${index + 1}. ${name}</b>\n`;
            itemsText += `  └ Qty: ${item.quantity}\n`;

            let options = {};
            try {
                options = typeof item.customOptionsJSON === 'string' ? JSON.parse(item.customOptionsJSON) : (item.customOptions || {});
            } catch (e) { }

            for (const [key, value] of Object.entries(options)) {
                if (typeof value === 'string' && value.startsWith('FILE_ATTACHMENT:')) {
                    const parts = value.split(':');
                    const filename = parts[1] || 'attached_image.png';
                    const base64Data = parts.slice(2).join(':');
                    itemsText += `  └ ${key}: <i>Attached Photo</i>\n`;
                    if (base64Data.startsWith('data:')) {
                        const base64Content = base64Data.split(',')[1];
                        if (base64Content) photosToSend.push({ filename, buffer: Buffer.from(base64Content, 'base64') });
                    }
                } else {
                    itemsText += `  └ ${key}: ${value}\n`;
                }
            }
        });

        const isUrgent = order.notes && order.notes.toLowerCase().includes('urgent');
        const header = isUrgent ? '🚨 <b>URGENT ORDER</b> 🚨' : '🛒 <b>NEW ORDER</b>';

        const message = `
${header}
━━━━━━━━━━━━━━━━━━━━
📦 <b>Order:</b> <code>#${order.id}</code>
👤 <b>Customer:</b> ${order.customerName}
📞 <b>Phone:</b> ${order.phone}
🚚 <b>Method:</b> ${order.pickupMethod}
💰 <b>Total:</b> ${order.total.toFixed(2)} AED
━━━━━━━━━━━━━━━━━━━━
📝 <b>Notes:</b> ${order.notes || 'None'}
━━━━━━━━━━━━━━━━━━━━
📦 <b>Items:</b>${itemsText}
━━━━━━━━━━━━━━━━━━━━
<b>Current Status:</b> 🟡 ${order.orderStatus}
        `.trim();

        const buttons = [
            [
                { text: '✅ Confirm', callback_data: `st_${order.id}_Confirmed` },
                { text: '⚙️ Work', callback_data: `st_${order.id}_Working` }
            ],
            [
                { text: '🎁 Ready', callback_data: `st_${order.id}_Ready for Pickup at School` },
                { text: '🏁 Done', callback_data: `st_${order.id}_Completed` }
            ],
            [
                { text: '❌ Cancel', callback_data: `st_${order.id}_Cancelled` }
            ]
        ];

        const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: buttons }
            })
        });

        // Send photos if any
        for (const photo of photosToSend) {
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            const blob = new Blob([new Uint8Array(photo.buffer)], { type: 'image/png' });
            formData.append('photo', blob, photo.filename);
            await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, { method: 'POST', body: formData as any });
        }
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}

export async function editTelegramMessage(chatId: string, messageId: number, text: string, orderId: string) {
    const { TOKEN } = getBotConfig();
    if (!TOKEN) return;

    const buttons = [
        [
            { text: '✅ Confirm', callback_data: `st_${orderId}_Confirmed` },
            { text: '⚙️ Work', callback_data: `st_${orderId}_Working` }
        ],
        [
            { text: '🎁 Ready', callback_data: `st_${orderId}_Ready for Pickup at School` },
            { text: '🏁 Done', callback_data: `st_${orderId}_Completed` }
        ],
        [
            { text: '❌ Cancel', callback_data: `st_${orderId}_Cancelled` }
        ]
    ];

    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: text,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: buttons }
            })
        });
    } catch (e) {
        console.error('Failed to edit Telegram message', e);
    }
}

export async function sendTelegramStatusUpdate(orderId: string, newStatus: string, customerName: string) {
    const emojiMap: any = {
        'Confirmed': '✅',
        'Working': '⚙️',
        'Ready for Pickup at School': '🎁',
        'Completed': '🏁',
        'Cancelled': '❌'
    };
    const emoji = emojiMap[newStatus] || '🔄';

    const message = `
${emoji} <b>STATUS UPDATED</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Order:</b> <code>#${orderId}</code>
👤 <b>Customer:</b> ${customerName}
💎 <b>New Status:</b> <b>${newStatus}</b>
    `.trim();

    await sendTelegramText(message);
}

export async function sendTelegramFailedOrder(errorStr: string, customerName: string) {
    const message = `❌ <b>FAILED ORDER</b>\n👤 <b>Customer:</b> ${customerName}\n⚠️ <b>Error:</b> ${errorStr}`;
    await sendTelegramText(message);
}

export async function sendTelegramDailySummary(type: 'Morning' | 'Evening', totalOrders: number, revenue: number) {
    const emoji = type === 'Morning' ? '🌅' : '🌙';
    const message = `
${emoji} <b>DAILY SUMMARY</b>
━━━━━━━━━━━━━━━━━━━━
📊 <b>Orders:</b> ${totalOrders}
💸 <b>Revenue:</b> ${revenue.toFixed(2)} AED
    `.trim();
    await sendTelegramText(message);
}

