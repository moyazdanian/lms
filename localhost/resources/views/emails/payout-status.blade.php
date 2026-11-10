<!doctype html>
<html>
<head><meta charset="utf-8"><title>Payout update</title></head>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2>Hello {{ $userName }},</h2>
    <p>Your payout request <strong>#{{ $payoutId }}</strong> has been updated.</p>
    <p><strong>Amount:</strong> {{ $amount }} {{ $currency }}</p>
    <p><strong>Status:</strong> {{ ucfirst($status) }}</p>
    @if($reason)
        <p><strong>Reason:</strong> {{ $reason }}</p>
    @endif
    <p><a href="{{ $frontendUrl }}/dashboard/earnings">View your earnings and payout requests</a></p>
</body>
</html>
