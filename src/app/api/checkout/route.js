import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração Mínima para Diagnóstico
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(request) {
    try {
        const body = await request.json();
        const preference = new Preference(client);

        // Tentativa de criação atômica - sem auto_return nem back_urls complexos para isolar o erro
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: `Plano ${body.plano || 'Imóvel Forte'}`,
                        quantity: 1,
                        unit_price: Number(body.preco) || 49.90,
                        currency_id: 'BRL'
                    }
                ]
            }
        });

        console.log("Preferência criada com sucesso. ID:", result.id);

        return NextResponse.json({
            init_point: result.init_point,
            id: result.id
        });

    } catch (error) {
        console.error("ERRO CRITICAL NO MERCADO PAGO:", error);
        return NextResponse.json({
            error: 'Erro na API do Mercado Pago',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}