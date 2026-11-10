<?php

namespace App\Filament\Resources\SupportTickets\Pages;

use App\Filament\Resources\SupportTickets\SupportTicketResource;
use App\Models\SupportTicketMessage;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;

class ViewSupportTicket extends ViewRecord
{
    protected static string $resource = SupportTicketResource::class;

    public function getTitle(): string
    {
        return 'Ticket #' . $this->record->id . ' — ' . $this->record->subject;
    }

    // Show the chat thread as the "form"
    public function form(Schema $schema): Schema
    {
        return $schema->components([
            \Filament\Forms\Components\Placeholder::make('thread')
                ->label('Conversation')
                ->content(fn () => new HtmlString($this->renderThread())),
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('reply')
                ->label('Reply')
                ->icon(\Filament\Support\Icons\Heroicon::PaperAirplane)
                ->color('primary')
                ->visible(fn () => $this->record->status === 'open')
                ->schema([
                    Textarea::make('body')
                        ->label('Your reply')
                        ->required()
                        ->rows(4),
                ])
                ->action(function (array $data) {
                    SupportTicketMessage::create([
                        'ticket_id' => $this->record->id,
                        'sender_id' => auth()->id(),
                        'body'      => $data['body'],
                    ]);

                    Notification::make()->success()->title('Reply sent.')->send();
                    $this->refreshFormData(['thread']);
                }),

            Action::make('close')
                ->label('Close Ticket')
                ->icon(\Filament\Support\Icons\Heroicon::LockClosed)
                ->color('danger')
                ->visible(fn () => $this->record->status === 'open')
                ->requiresConfirmation()
                ->action(function () {
                    $this->record->update(['status' => 'closed']);
                    Notification::make()->success()->title('Ticket closed.')->send();
                }),

            Action::make('reopen')
                ->label('Reopen')
                ->icon(\Filament\Support\Icons\Heroicon::LockOpen)
                ->color('success')
                ->visible(fn () => $this->record->status === 'closed')
                ->action(function () {
                    $this->record->update(['status' => 'open']);
                    Notification::make()->success()->title('Ticket reopened.')->send();
                }),
        ];
    }

    protected function renderThread(): string
    {
        $messages = $this->record->messages()->with('sender')->orderBy('created_at')->get();

        $html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';

        foreach ($messages as $msg) {
            $isAdmin = $msg->sender?->role === 'admin';

            if ($isAdmin) {
                $bgColor = 'background-color: rgb(240 253 250); border-left: 4px solid rgb(16 185 129);';
                $darkClass = 'support-ticket-message-admin';
                $darkBg = 'background-color: rgb(6 78 59);';
            } else {
                $bgColor = 'background-color: rgb(249 250 251); border-left: 4px solid rgb(156 163 175);';
                $darkClass = 'support-ticket-message-user';
                $darkBg = 'background-color: rgb(17 24 39);';
            }

            $html .= '<style>@media (prefers-color-scheme: dark) { .' . $darkClass . ' { ' . $darkBg . ' } }</style>';
            $html .= '<div class="' . $darkClass . '" style="border-radius: 0.5rem; padding: 1rem; ' . $bgColor . '">';

            // Header
            $html .= '<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: rgb(107 114 128); margin-bottom: 0.5rem;">';
            $html .= '<span style="font-weight: 600;">' . e($msg->sender?->name ?? 'Unknown') . ($isAdmin ? ' <span style="color: rgb(16 185 129);">(Admin)</span>' : '') . '</span>';
            $html .= '<span>' . $msg->created_at->format('Y-m-d H:i') . '</span>';
            $html .= '</div>';

            // Body
            $html .= '<p style="font-size: 0.875rem; white-space: pre-line; line-height: 1.5;">' . e($msg->body) . '</p>';

            $html .= '</div>';
        }

        return $html . '</div>';
    }
}
