<?php

namespace App\Http\Middleware;

use Illuminate\Session\Middleware\StartSession;

class FilamentStartSession extends StartSession
{
    /**
     * Get the session configuration.
     *
     * @return array
     */
    protected function getSessionConfig()
    {
        $config = parent::getSessionConfig();

        // Use a different cookie name for Filament sessions
        $config['cookie'] = 'filament_admin_session';

        return $config;
    }
}
