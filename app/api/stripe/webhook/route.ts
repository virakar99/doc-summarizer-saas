import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase"
import { headers } from "next/headers"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  // Check if Stripe is configured
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        error: "Stripe webhook is not configured",
      },
      { status: 503 },
    )
  }

  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      // Create a subscription record in your database
      if (session.metadata?.userId) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        await supabaseAdmin.from("subscriptions").insert({
          user_id: session.metadata.userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
      }
      break

    case "invoice.payment_succeeded":
      // Update the subscription status
      const invoice = event.data.object as Stripe.Invoice

      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)
      }
      break

    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const updatedSubscription = event.data.object as Stripe.Subscription

      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: updatedSubscription.status,
          current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", updatedSubscription.id)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
