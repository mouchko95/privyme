import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type CheckoutRequest = {
  packId: string;
  userId: string;
  userEmail: string;
};

type CreditPack = {
  id: string;
  credits: number;
  price: number;
  amountCents: number;
};

const packMap: { [key: string]: CreditPack } = {
  pack10: { id: 'pack10', credits: 10, price: 10, amountCents: 1000 },
  pack25: { id: 'pack25', credits: 25, price: 25, amountCents: 2500 },
  pack50: { id: 'pack50', credits: 50, price: 50, amountCents: 5000 },
  pack100: { id: 'pack100', credits: 100, price: 100, amountCents: 10000 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: CheckoutRequest = await req.json();
    const { packId, userId, userEmail } = body;

    if (!packId || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: packId, userId, userEmail' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const pack = packMap[packId];
    if (!pack) {
      return new Response(
        JSON.stringify({ error: `Invalid packId: ${packId}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${pack.credits} Credits`,
              description: `Purchase ${pack.credits} credits for PrivyMe`,
            },
            unit_amount: pack.amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/?success=1&pack=${packId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?canceled=1`,
      customer_email: userEmail,
      metadata: {
        userId,
        packId,
        credits: pack.credits.toString(),
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
