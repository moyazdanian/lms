<!doctype html>
<html>
<head><meta charset="utf-8"><title>Course approval update</title></head>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2>Hello {{ $userName }},</h2>

    @if($status === 'approved')
        <p>Great news! Your course <strong>{{ $courseTitle }}</strong> has been approved and is now published on the platform.</p>
        <p><a href="{{ $frontendUrl }}/dashboard/teaching/courses/{{ $courseId }}">Open your course dashboard</a></p>
    @else
        <p>Your recent changes to the course <strong>{{ $courseTitle }}</strong> were <strong style="color: #ef4444;">not approved</strong>.</p>

        @if($reason)
            <p><strong>Reason:</strong> {{ $reason }}</p>
        @endif

        <p>You can update the course and submit it for review again.</p>
        <p><a href="{{ $frontendUrl }}/dashboard/teaching/courses/{{ $courseId }}">Edit your course</a></p>
    @endif
</body>
</html>
