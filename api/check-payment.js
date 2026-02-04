
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    // SEU TOKEN DE PRODUÇÃO
    const MP_ACCESS_TOKEN = "APP_USR-2028294536116664-020323-6cd677880a20d8c24ac12a297178c743-753231933";

    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
            }
        });

        const data = await response.json();
        return res.status(200).json({ status: data.status });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch payment status' });
    }
}
