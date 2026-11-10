<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instructor Application Approved - {{ config('app.name', 'LMS') }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: auto;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Application Approved!
                </h1>
                <p style="margin: 12px 0 0; color: #d1fae5; font-size: 16px;">
                    Welcome to the instructor community
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
                    <strong>Congratulations!</strong> Your application to become an instructor has been <strong style="color: #10b981;">approved</strong>.
                </p>

                <p style="margin: 0 0 20px; font-size: 16px; color: #4b5563;">
                    You can now access the instructor dashboard to create and publish courses, manage students, and track your earnings.
                </p>

                <!-- Feature highlights -->
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 24px; margin: 0 0 30px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #166534;">
                        What you can do now:
                    </h3>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #15803d;">
                        <li style="margin-bottom: 10px; font-size: 14px;">Create and publish courses</li>
                        <li style="margin-bottom: 10px; font-size: 14px;">Upload video lessons</li>
                        <li style="margin-bottom: 10px; font-size: 14px;">Set course pricing and discounts</li>
                        <li style="margin-bottom: 10px; font-size: 14px;">Track student enrollments and progress</li>
                        <li style="margin-bottom: 0; font-size: 14px;">View earnings and payouts</li>
                    </ul>
                </div>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 30px;">
                    <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <a href="{{ $dashboardUrl }}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                Go to Instructor Dashboard
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    Need help getting started? Check our <a href="{{ $frontendUrl }}/instructor-guide" style="color: #10b981; text-decoration: none;">instructor guide</a> or contact support.
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
                    <a href="{{ $frontendUrl }}/privacy" style="color: #10b981;">Privacy Policy</a> &middot;
                    <a href="{{ $frontendUrl }}/terms" style="color: #10b981;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>