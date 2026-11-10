import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  closeTicketApi,
  createTicketApi,
  getTicketApi,
  getTicketsApi,
  replyTicketApi,
} from '@/lib/api/support';

export function useTickets(page = 1) {
  const ticketsQuery = useQuery({
    queryKey: ['tickets', page],
    queryFn: () => getTicketsApi(page),
  });

  return { ticketsQuery };
}

export function useTicket(id) {
  const ticketQuery = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicketApi(id),
    enabled: !!id,
  });

  return { ticketQuery };
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicketApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Your ticket has been submitted successfully');
    },
    onError: (err) => {
      toast.error(err.data?.message || 'Something went wrong');
    },
  });
}

export function useReplyTicket(ticketId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => replyTicketApi(ticketId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', String(ticketId)] });
      toast.success('Reply sent');
    },
    onError: (err) => {
      toast.error(err.data?.message || 'Something went wrong');
    },
  });
}

export function useCloseTicket(ticketId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeTicketApi(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', String(ticketId)] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket closed');
    },
    onError: (err) => {
      toast.error(err.data?.message || 'Something went wrong');
    },
  });
}
