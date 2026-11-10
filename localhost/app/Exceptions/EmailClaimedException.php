<?php

namespace App\Exceptions;

use RuntimeException;

class EmailClaimedException extends RuntimeException
{
    public readonly string $email;

    public function __construct(string $email)
    {
        parent::__construct("The email [{$email}] is registered with a password.");

        $this->email = $email;
    }
}
