<?php

namespace App\Services\Payments;

use App\Contracts\PaymentGatewaysInterface;
use App\Services\Payments\Gateways\MollieGateway;
use App\Services\Payments\Gateways\PaypalGateway;
use App\Services\Payments\Gateways\RazorpayGateway;
use App\Services\Payments\Gateways\StripeGateway;

class PaymentGatewayManager
{
    /** @var array<string, class-string<PaymentGatewaysInterface>> */
    protected static array $registry = [
        'stripe' => StripeGateway::class,
        'paypal' => PaypalGateway::class,
        'mollie' => MollieGateway::class,
        'razorpay' => RazorpayGateway::class,
    ];

    public static function make(string $method): PaymentGatewaysInterface
    {
        $class = static::$registry[$method]
            ?? throw new \InvalidArgumentException("Unsupported payment gateway [{$method}]");

        return app($class);
    }

    public static function exists(string $method): bool
    {
        return isset(static::$registry[$method]);
    }

    /** @return array<int, string> */
    public static function supported(): array
    {
        return array_keys(static::$registry);
    }
}
