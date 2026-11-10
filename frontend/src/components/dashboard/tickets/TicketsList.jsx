"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTickets, useCreateTicket } from "@/hooks/useTickets";

const statusColor = {
  open:   "success",
  closed: "secondary",
};

const priorityColor = {
  low:    "secondary",
  normal: "warning",
  high:   "destructive",
};

export default function TicketsList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", priority: "normal" });

  const { ticketsQuery } = useTickets(page);
  const createMutation = useCreateTicket();

  const tickets = ticketsQuery.data?.data ?? [];
  const meta    = ticketsQuery.data?.meta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setOpen(false);
    setForm({ subject: "", body: "", priority: "normal" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Support Tickets</h2>
        <Button size="sm" onClick={() => setOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open a New Support Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Subject</label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Brief description of your issue"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Priority</label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Message</label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={5}
                required
                minLength={10}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Submitting…" : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List */}
      {ticketsQuery.isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No tickets yet</p>
          <p className="text-sm mt-1">Open a ticket if you need help from the admin.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(`/dashboard/tickets/${t.id}`)}
              className="w-full text-left border rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm truncate">{t.subject}</span>
                <div className="flex gap-2 shrink-0">
                  <Badge variant={priorityColor[t.priority] ?? "secondary"} className="text-xs">
                    {t.priority}
                  </Badge>
                  <Badge variant={statusColor[t.status] ?? "secondary"} className="text-xs">
                    {t.status}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                #{t.id} · {t.messages_count ?? 0} messages ·{" "}
                {new Date(t.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm flex items-center text-gray-500">
            {page} / {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
