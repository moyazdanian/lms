<?php

use App\Models\LegalPage;
use App\Models\User;
use Illuminate\Support\Facades\Route;

it('registers the legal pages route under the versioned API prefix', function () {
    expect(Route::has('legal-pages.show'))->toBeTrue();
});

it('serves the terms text publicly', function () {
    LegalPage::current()->update([
        'terms_title' => 'Terms of Service',
        'terms' => '<p>Be nice.</p>',
    ]);

    $this->getJson('/api/v1/legal-pages/terms')
        ->assertOk()
        ->assertJsonPath('data.slug', 'terms')
        ->assertJsonPath('data.terms_title', 'Terms of Service')
        ->assertJsonPath('data.terms', '<p>Be nice.</p>');
});

it('serves privacy and cookie-consent copy from the same row', function () {
    LegalPage::current()->update([
        'privacy' => '<p>We store nothing.</p>',
        'banner_title' => 'Cookies, brief.',
        'banner_body' => '<p>We use cookies.</p>',
        'banner_accept_label' => 'OK',
    ]);

    $this->getJson('/api/v1/legal-pages/privacy')
        ->assertOk()
        ->assertJsonPath('data.privacy', '<p>We store nothing.</p>');

    $this->getJson('/api/v1/legal-pages/cookie-consent')
        ->assertOk()
        ->assertJsonPath('data.banner_title', 'Cookies, brief.')
        ->assertJsonPath('data.banner_body', '<p>We use cookies.</p>')
        ->assertJsonPath('data.banner_accept_label', 'OK');
});

it('only exposes the banner fields the frontend needs', function () {
    $this->getJson('/api/v1/legal-pages/cookie-consent')
        ->assertOk()
        ->assertJsonMissing(['terms' => 'anything']);
});

it('rejects unknown slugs', function () {
    $this->getJson('/api/v1/legal-pages/whatever')
        ->assertNotFound();
});

it('lets admins open the legal admin screens', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
        'status' => true,
    ]);

    foreach (['terms-and-privacy', 'cookie-consent'] as $slug) {
        $this->actingAs($admin, 'filament')
            ->get("/admin/content/{$slug}")
            ->assertSuccessful();
    }
});

it('blocks guests from the legal admin screens', function () {
    $this->get('/admin/content/terms-and-privacy')
        ->assertRedirect();

    $this->get('/admin/content/cookie-consent')
        ->assertRedirect();
});
