<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    // GET /api/tickets
    public function index(Request $request)
    {
        $tickets = SupportTicket::where('user_id', $request->user()->id)
            ->with('latestMessage.sender')
            ->withCount('messages')
            ->latest()
            ->paginate(15);

        return response()->json($tickets);
    }

    // POST /api/tickets
    public function store(Request $request)
    {
        $data = $request->validate([
            'subject'  => 'required|string|max:255',
            'body'     => 'required|string|min:10',
            'priority' => 'in:low,normal,high',
        ]);

        $ticket = SupportTicket::create([
            'user_id'  => $request->user()->id,
            'subject'  => $data['subject'],
            'priority' => $data['priority'] ?? 'normal',
            'status'   => 'open',
        ]);

        SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $request->user()->id,
            'body'      => $data['body'],
        ]);

        return response()->json([
            'message' => 'Ticket created successfully.',
            'ticket'  => $ticket->load('messages.sender'),
        ], 201);
    }

    // GET /api/tickets/{id}
    public function show(Request $request, SupportTicket $ticket)
    {
        if ($ticket->user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json([
            'ticket'   => $ticket->load('messages.sender'),
        ]);
    }

    // POST /api/tickets/{id}/messages
    public function reply(Request $request, SupportTicket $ticket)
    {
        if ($ticket->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($ticket->status === 'closed') {
            return response()->json(['message' => 'This ticket is closed.'], 422);
        }

        $data = $request->validate([
            'body' => 'required|string|min:2',
        ]);

        $message = SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $request->user()->id,
            'body'      => $data['body'],
        ]);

        return response()->json([
            'message' => $message->load('sender'),
        ], 201);
    }

    // POST /api/tickets/{id}/close
    public function close(Request $request, SupportTicket $ticket)
    {
        if ($ticket->user_id !== $request->user()->id) {
            abort(403);
        }

        $ticket->update(['status' => 'closed']);

        return response()->json(['success' => true]);
    }
}
