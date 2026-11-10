<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instructor Application Update - {{ config('app.name', 'LMS') }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Application Update
                </h1>
                <p style="margin: 12px 0 0; color: #fecaca; font-size: 16px;">
                    We've reviewed your instructor application
                </p>
            </td>
        </tr>

        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                    Hi <strong>{{ $userName }}</strong>,
                </p>

                <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563;">
                    Thank you for your interest in becoming an instructor on our platform. After careful review, we regret to inform you that your application has <strong style="color: #ef4444;">not been approved</strong> at this time.
                </p>

                @if($reason)
                <!-- Admin Note -->
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 24px; margin: 0 0 30px;">
                    <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #991b1b;">
                        Feedback from our team:
                    </h3>
                    <p style="margin: 0; font-size: 14px; color: #b91c1c; white-space: pre-line;">{{ $reason }}</p>
                </div>
                @endif

                <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563;">
                    This decision doesn't mean the end of your journey with us. You're welcome to improve your application and reapply when you're ready.
                </p>

                <p style="margin: 0 0 10px; font-size: 16px; color: #4b5563;">
                    <strong>Tips for a stronger application:</strong>
                </p>
                <ul style="margin: 0 0 30px; padding: 0 0 0 20px; color: #4b5563;">
                    <li style="margin-bottom: 10px; font-size: 14px;">Provide a detailed bio highlighting your expertise</li>
                    <li style="margin-bottom: 10px; font-size: 14px;">Include links to your portfolio, social media, or previous work</li>
                    <li style="margin-bottom: 10px; font-size: 14px;">Clearly describe the topics you want to teach</li>
                    <li style="margin-bottom: 0; font-size: 14px;">Ensure your profile reflects professional experience</li>
                </ul>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 30px;">
                    <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
                            <a href="{{ $reapplyUrl }}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                Submit New Application
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    Questions? Contact our <a href="{{ $frontendUrl }}/support" style="color: #ef4444; text-decoration: none;">support team</a> — we're here to help.
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
                    <a href="{{ $frontendUrl }}/privacy" style="color: #ef4444;">Privacy Policy</a> &middot;
                    <a href="{{ $frontendUrl }}/terms" style="color: #ef4444;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>