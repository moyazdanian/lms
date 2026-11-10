<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Receipt #{{ $orderNumber }} - {{ config('app.name', 'LMS') }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Order Receipt
                </h1>
                <p style="margin: 0; color: #c7d2fe; font-size: 16px;">
                    Order #{{ $orderNumber }}
                </p>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                    Hi <strong>{{ $notifiable->name ?? 'there' }}</strong>,
                </p>

                <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563;">
                    Thank you for your purchase! Your payment has been processed successfully.
                </p>

                <!-- Order Details -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 30px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                    <!-- Header Row -->
                    <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                        <th style="padding: 14px 20px; text-align: left; font-weight: 600; font-size: 14px; color: #374151; width: 50%;">Course</th>
                        <th style="padding: 14px 20px; text-align: right; font-weight: 600; font-size: 14px; color: #374151; width: 15%;">Qty</th>
                        <th style="padding: 14px 20px; text-align: right; font-weight: 600; font-size: 14px; color: #374151; width: 35%;">Price</th>
                    </tr>
                    <!-- Items -->
                    @foreach($items as $index => $item)
                    <tr style="{{ $index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f9fafb;' }} border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 16px 20px; font-size: 14px; color: #374151;">{{ $item['title'] }}</td>
                        <td style="padding: 16px 20px; text-align: right; font-size: 14px; color: #6b7280;">{{ $item['qty'] ?? 1 }}</td>
                        <td style="padding: 16px 20px; text-align: right; font-size: 14px; font-weight: 500; color: #374151;">{{ $currencySymbol }}{{ number_format($item['price'], 2) }}</td>
                    </tr>
                    @endforeach
                    <!-- Total Row -->
                    <tr style="background-color: #f0f9ff; border-top: 2px solid #6366f1;">
                        <td colspan="2" style="padding: 16px 20px; text-align: right; font-weight: 600; font-size: 16px; color: #374151;">Total Paid</td>
                        <td style="padding: 16px 20px; text-align: right; font-weight: 700; font-size: 18px; color: #6366f1;">{{ $currencySymbol }}{{ number_format($totalAmount, 2) }}</td>
                    </tr>
                </table>

                <!-- Payment Info -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 30px; background-color: #f9fafb; border-radius: 10px;">
                    <tr>
                        <td style="padding: 20px;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Payment Method</p>
                            <p style="margin: 0; font-size: 14px; font-weight: 500; color: #374151; text-transform: capitalize;">{{ $paymentMethod }}</p>
                        </td>
                    </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 30px;">
                    <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                            <a href="{{ $receiptUrl }}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                View Receipt
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    You can also view this receipt in your <a href="{{ $frontendUrl }}/dashboard/payments" style="color: #6366f1; text-decoration: none;">dashboard</a>.
                </p>
            </td>
        </tr>

        <!-- Divider -->
        <tr>
            <td style="padding: 0 30px 20px;">
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af;">
                    © {{ date('Y') }} {{ config('app.name', 'LMS') }}. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                    <a href="{{ $frontendUrl }}/privacy" style="color: #6366f1;">Privacy Policy</a> &middot;
                    <a href="{{ $frontendUrl }}/terms" style="color: #6366f1;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>