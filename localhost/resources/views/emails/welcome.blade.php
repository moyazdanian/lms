<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{ config('app.name', 'LMS') }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Welcome to {{ config('app.name', 'LMS') }}!
                </h1>
                <p style="margin: 12px 0 0; color: #fef3c7; font-size: 16px;">
                    Start learning from experts today
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
                    Thank you for creating an account! We're excited to have you join our community of learners and instructors.
                </p>

                <p style="margin: 0 0 30px; font-size: 16px; color: #4b5563;">
                    Here are a few things you can do to get started:
                </p>

                <!-- Feature list -->
                <ul style="margin: 0 0 30px; padding: 0 0 0 20px; color: #4b5563;">
                    <li style="margin-bottom: 12px; font-size: 15px;">
                        <strong>Explore courses</strong> — Browse our catalog of expert-led courses across various topics.
                    </li>
                    <li style="margin-bottom: 12px; font-size: 15px;">
                        <strong>Track your progress</strong> — Enroll in courses and monitor your learning journey.
                    </li>
                    <li style="margin-bottom: 12px; font-size: 15px;">
                        <strong>Become an instructor</strong> — Share your expertise by creating and selling courses.
                    </li>
                </ul>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 30px;">
                    <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                            <a href="{{ $coursesUrl }}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                Browse Courses
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    Or <a href="{{ $loginUrl }}" style="color: #f59e0b; text-decoration: none;">log in</a> to access your dashboard.
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
                    <a href="{{ $frontendUrl }}/privacy" style="color: #f59e0b;">Privacy Policy</a> &middot;
                    <a href="{{ $frontendUrl }}/terms" style="color: #f59e0b;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>