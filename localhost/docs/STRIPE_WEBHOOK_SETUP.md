# Stripe Webhook Setup Guide

This guide explains how to configure Stripe webhooks for the LMS platform.

## Local Development

For local development, use the Stripe CLI to forward webhooks to your local machine:

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (PowerShell)
msiexec.exe /i https://github.com/stripe/stripe-cli/releases/download/v1.18.0/stripe_1.18.0_windows_x86_64.msi

# Linux
sudo apt install stripe
```

### 2. Login to Stripe

```bash
stripe login
```

### 3. Forward Webhooks to Local API

```bash
# Replace with your actual local API URL
stripe listen --forward-to http://api.lms.test/api/v1/webhooks/stripe
```

### 4. Copy the Webhook Signing Secret

The command will output something like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxx (^C to quit)
```

Copy this secret and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

## Production Setup

### 1. Create Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production webhook URL:
   ```
   https://yourdomain.com/api/v1/webhooks/stripe
   ```
4. Select the following events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"

### 2. Copy the Signing Secret

1. Click on the newly created webhook endpoint
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

### 3. Add to Production Environment

Add to your production `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

## Verification

To verify webhooks are working:

1. Check the webhook delivery logs in Stripe Dashboard > Webhooks > [Your Endpoint] > "Recent deliveries"
2. Check your Laravel logs: `storage/logs/laravel.log` or `storage/logs/admin-audit.log`
3. Test with a real payment flow

## Important Notes

- **Never commit** `STRIPE_WEBHOOK_SECRET` to version control
- Use different webhook endpoints for development, staging, and production
- The webhook endpoint must be publicly accessible (no authentication)
- Respond with 2xx within 10 seconds, otherwise Stripe will retry
- Events handled: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, and `checkout.session.async_payment_failed`

## Troubleshooting

### Webhook not receiving events
- Verify the URL is correct and accessible
- Check Laravel logs for errors
- Ensure `STRIPE_WEBHOOK_SECRET` matches exactly

### Signature verification failed
- Ensure you're using the correct signing secret for the environment
- Check that the raw request body is being used (not parsed JSON)

### Duplicate events
- Stripe retries failed deliveries - make your webhook handler idempotent
- The `PaymentFinalizer` service handles idempotency via `lockForUpdate`

## Related Files

- Webhook handler: `app/Http/Controllers/StripeWebhookController.php`
- Payment finalization: `app/Services/Payments/PaymentFinalizer.php`
- Routes: `routes/api.php` (POST `/api/v1/webhooks/stripe`)