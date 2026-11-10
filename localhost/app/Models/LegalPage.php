<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A one-row config table for the admin-written legal copy: Terms of
 * Service, Privacy Policy (each with its own RichEditor page) and the
 * cookie-consent banner texts. Safe to access before the table is
 * seeded — current() creates the default row like Footer::current().
 */
class LegalPage extends Model
{
    protected $table = 'legal_pages';

    protected $fillable = [
        'terms_title',
        'terms',
        'privacy_title',
        'privacy',
        'banner_title',
        'banner_body',
        'banner_accept_label',
        'banner_necessary_label',
        'banner_link_label',
    ];

    /** The single legal-pages row; creates the default row on first access. */
    public static function current(): self
    {
        return static::query()->first()
            ?? static::create([
                'terms_title' => 'Terms of Service',
                'terms' => '',
                'privacy_title' => 'Privacy Policy',
                'privacy' => '',
                'banner_title' => 'We value your privacy',
                'banner_body' => 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
                'banner_accept_label' => 'Accept All',
                'banner_necessary_label' => 'Necessary Only',
                'banner_link_label' => 'Cookie Policy',
            ]);
    }
}
