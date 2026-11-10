"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTicket, useReplyTicket, useCloseTicket } from "@/hooks/useTickets";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { cn } from "@/lib/utils";

const priorityColor = {
  low:    "secondary",
  normal: "warning",
  high:   "destructive",
};

export default function TicketDetail({ ticketId }) {
  const router = useRouter();
  const { user } = useAuthGuard();
  const [reply, setReply] = useState("");

  const { ticketQuery } = useTicket(ticketId);
  const replyMutation    = useReplyTicket(ticketId);
  const closeMutation    = useCloseTicket(ticketId);

  const ticket   = ticketQuery.data?.ticket;
  const messages = ticket?.messages ?? [];

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await replyMutation.mutateAsync(reply.trim());
    setReply("");
  };

  if (ticketQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
      </div>
    );
  }

  if (!ticket) {
    return <p className="text-gray-500">Ticket not found.</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/tickets")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate">{ticket.subject}</h2>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge variant={ticket.status === "open" ? "success" : "secondary"}>
              {ticket.status}
            </Badge>
            <Badge variant={priorityColor[ticket.priority] ?? "secondary"}>
              {ticket.priority} priority
            </Badge>
            <span className="text-xs text-gray-400 flex items-center">
              #{ticket.id} · {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {ticket.status === "open" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-1" /> Close Ticket
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
                <AlertDialogDescription>
                  Once closed, you won&apos;t be able to reply. You can always open a new ticket.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => closeMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Close Ticket
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Messages thread */}
      <div className="space-y-3 mb-6">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={cn(
                "rounded-xl px-4 py-3 max-w-[85%]",
                isMe
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-xs font-semibold", isMe ? "text-blue-100" : "text-gray-500")}>
                  {msg.sender?.name ?? "Unknown"}
                  {msg.sender?.role === "admin" && " (Admin)"}
                </span>
                <span className={cn("text-xs", isMe ? "text-blue-200" : "text-gray-400")}>
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
            </div>
          );
        })}
      </div>

      {/* Reply form */}
      {ticket.status === "open" ? (
        <form onSubmit={handleReply} className="flex gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write your reply…"
            rows={2}
            className="resize-none flex-1"
            disabled={replyMutation.isPending}
          />
          <Button type="submit" disabled={replyMutation.isPending || !reply.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <p className="text-center text-sm text-gray-500 py-4 border rounded-lg">
          This ticket is closed. Open a new one if you need further help.
        </p>
      )}
    </div>
  );
}
