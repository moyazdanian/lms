<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Confirmation - {{ config('app.name', 'LMS') }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: auto;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Password Reset Successful
                </h1>
                <p style="margin: 12px 0 0; color: #c7d2fe; font-size: 16px;">
                    Your password has been updated
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
                    This email confirms that your password has been <strong>successfully reset</strong>.
                </p>

                <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; margin: 0 0 30px;">
                    <p style="margin: 0; font-size: 14px; color: #0369a1;">
                        <strong>Security Tip:</strong> If you didn't request this change, please contact our support team immediately and consider enabling two-factor authentication.
                    </p>
                </div>

                <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563;">
                    You can now log in with your new password.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 30px;">
                    <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                            <a href="{{ $loginUrl }}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                Log In Now
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    Or visit <a href="{{ $frontendUrl }}" style="color: #6366f1; text-decoration: none;">{{ $frontendUrl }}</a> directly.
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