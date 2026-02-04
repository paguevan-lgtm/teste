
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Credenciais fornecidas pelo usuário
// Usando como padrão caso a variável de ambiente não esteja definida
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-2028294536116664-020323-6cd677880a20d8c24ac12a297178c743-753231933';

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email, description } = req.body;
        const payment = new Payment(client);

        // Gera uma chave de idempotência simples baseada no timestamp para evitar duplicação imediata
        const idempotencyKey = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const result = await payment.create({
            body: {
                transaction_amount: 1.00, // Valor fixo R$ 1,00 conforme solicitado
                description: description || 'Acesso Sistema - Bora de Van',
                payment_method_id: 'pix',
                payer: {
                    email: email || 'usuario@boradevan.com'
                },
                // Em produção, isso deve ser a URL do seu site
                notification_url: `https://${req.headers.host}/api/webhook`
            },
            requestOptions: { idempotencyKey }
        });

        res.status(200).json({
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
            ticket_url: result.point_of_interaction.transaction_data.ticket_url
        });
    } catch (error) {
        console.error('Erro Mercado Pago:', error);
        res.status(500).json({ error: 'Erro ao criar pagamento', details: error.message });
    }
}
