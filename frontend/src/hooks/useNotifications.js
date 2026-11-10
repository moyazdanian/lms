import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '@/lib/api/notifications';

export function useNotifications(page = 1) {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications' , page],
    queryFn: () => getNotificationsApi(page),
    refetchInterval: 30000, // poll every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => markNotificationReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  return {
    notificationsQuery,
    markReadMutation,
    markAllReadMutation,
    notifications: notificationsQuery.data?.data ?? [],
    unreadCount: notificationsQuery.data?.unread_count ?? 0,
  };
}
