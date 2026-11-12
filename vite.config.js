import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import Stripe from 'stripe'

function stripeDevServerPlugin() {
  return {
    name: 'stripe-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/create-checkout-session') && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')
              const env = loadEnv('development', process.cwd(), '')
              const secretKey = env.STRIPE_SECRET_KEY
              if (!secretKey) throw new Error('Falta STRIPE_SECRET_KEY en el archivo .env')
              const stripe = new Stripe(secretKey)

              const { order, customer, items, successUrl, cancelUrl } = parsed
              const origin = req.headers.origin || `http://${req.headers.host}`

              const lineItems = (items || []).map(item => ({
                price_data: {
                  currency: 'cad',
                  product_data: {
                    name: item.name || item.title || 'Produit CANRES Viandes',
                    description: item.brand ? `Boucherie Artisanale · ${item.brand}` : undefined,
                    images: item.image && item.image.startsWith('http') ? [item.image] : undefined,
                  },
                  unit_amount: Math.round(Number(item.unitPrice ?? item.price ?? 0) * 100),
                },
                quantity: Number(item.quantity) || 1,
              }))

              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                customer_email: customer?.email || undefined,
                line_items: lineItems.length > 0 ? lineItems : [
                  {
                    price_data: {
                      currency: 'cad',
                      product_data: { name: `Commande CANRES Viandes #${order.code}` },
                      unit_amount: Math.round(Number(order.total) * 100),
                    },
                    quantity: 1,
                  }
                ],
                client_reference_id: order.code,
                metadata: {
                  orderCode: order.code,
                  customerName: customer?.fullName || '',
                  customerPhone: customer?.phone || '',
                },
                success_url: successUrl || `${origin}/pedido/${order.code}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl || `${origin}/pedido/${order.code}?status=cancelled`,
              })

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ id: session.id, url: session.url }))
            } catch (err) {
              console.error('[Vite Stripe Dev Middleware Error]:', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        if (req.url?.startsWith('/api/check-session') && req.method === 'GET') {
          try {
            const reqUrl = new URL(req.url, `http://${req.headers.host}`)
            const sessionId = reqUrl.searchParams.get('session_id')
            const env = loadEnv('development', process.cwd(), '')
            const secretKey = env.STRIPE_SECRET_KEY
            if (!secretKey) throw new Error('Falta STRIPE_SECRET_KEY en el archivo .env')
            const stripe = new Stripe(secretKey)

            const session = await stripe.checkout.sessions.retrieve(sessionId)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              id: session.id,
              status: session.status,
              payment_status: session.payment_status,
              amount_total: session.amount_total,
              currency: session.currency,
              orderCode: session.metadata?.orderCode || session.client_reference_id,
            }))
          } catch (err) {
            console.error('[Vite Stripe Check Session Error]:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripeDevServerPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
