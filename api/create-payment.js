
export default async function handler(req, res) {
    // Cabeçalhos para evitar erro de CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Se for pre-flight (OPTIONS), responde ok e para
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // SEU TOKEN DE PRODUÇÃO (APP_USR)
    const MP_ACCESS_TOKEN = "APP_USR-2028294536116664-020323-6cd677880a20d8c24ac12a297178c743-753231933";

    try {
        const { email } = req.body;
        // Sanitiza email
        const safeEmail = email ? email.replace(/[^a-zA-Z0-9@._-]/g, '') : "usuario@boradevan.com.br";

        const paymentData = {
            transaction_amount: 1.00,
            description: "Mensalidade Sistema Bora de Van",
            payment_method_id: "pix",
            payer: {
                email: safeEmail,
                first_name: "Usuario",
                last_name: "Sistema"
            }
        };

        const response = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
                "X-Idempotency-Key": Date.now().toString()
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erro no Mercado Pago");
        }

        return res.status(200).json({
            id: data.id,
            qr_code: data.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
            status: data.status
        });

    } catch (error) {
        console.error("Erro API Pix:", error);
        return res.status(500).json({ error: error.message || "Erro interno" });
    }
}
