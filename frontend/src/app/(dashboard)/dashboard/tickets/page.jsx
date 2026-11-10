import AuthGuard from "@/app/AuthGuard";
import TicketsList from "@/components/dashboard/tickets/TicketsList";

export const metadata = { title: "Support Tickets" };

export default function TicketsPage() {
  return (
    <AuthGuard>
      <TicketsList />
    </AuthGuard>
  );
}
