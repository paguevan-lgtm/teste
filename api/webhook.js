
import admin from 'firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configuração do Firebase Admin (Server Side)
// Na Vercel, você DEVE configurar as variáveis de ambiente:
// FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID || 'lotacao-753a1',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Corrige formatação da chave privada (quebras de linha) vinda de ENV
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            }),
            databaseURL: "https://lotacao-753a1-default-rtdb.firebaseio.com"
        });
    } catch (e) {
        console.error("Erro ao inicializar Firebase Admin:", e);
    }
}

const db = admin.apps.length ? admin.database() : null;

// Credenciais Mercado Pago
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-2028294536116664-020323-6cd677880a20d8c24ac12a297178c743-753231933';
const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, data } = req.body;

    // Log para debug na Vercel
    console.log(`Webhook recebido: ${type}`, data);

    if (type === 'payment') {
        try {
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: data.id });

            if (paymentInfo.status === 'approved' && db) {
                // Pagamento Aprovado: Renovar por 30 dias (independente de quem pagou)
                const now = Date.now();
                const future = now + (30 * 24 * 60 * 60 * 1000); // 30 dias em ms
                
                // Atualiza a data de expiração global do sistema
                await db.ref('system_settings/subscription_expiry').set(future);
                
                // Registra log do pagamento
                await db.ref('system_settings/payment_history').push({
                    amount: paymentInfo.transaction_amount,
                    date: now,
                    status: 'approved',
                    payment_id: data.id,
                    p_key: 'APP_USR...753231933' // Log para confirmar qual chave recebeu
                });

                console.log('Assinatura renovada com sucesso até:', new Date(future).toISOString());
            } else if (!db) {
                console.error("Firebase DB não conectado no Webhook. Verifique as credenciais do Admin.");
            }
        } catch (error) {
            console.error('Erro no webhook:', error);
            return res.status(500).json({ error: 'Internal Error' });
        }
    }

    res.status(200).json({ ok: true });
}
