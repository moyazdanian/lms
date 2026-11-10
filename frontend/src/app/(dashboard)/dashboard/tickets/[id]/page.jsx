"use client";

import { useParams } from "next/navigation";
import AuthGuard from "@/app/AuthGuard";
import TicketDetail from "@/components/dashboard/tickets/TicketDetail";

export default function TicketDetailPage() {
  const { id } = useParams();
  return (
    <AuthGuard>
      <TicketDetail ticketId={id} />
    </AuthGuard>
  );
}
