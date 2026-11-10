import { passwordReset } from '@/lib/api/authApi';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export function usePasswordReset(){
    return useMutation({
        mutationFn: (data) => passwordReset(data),
        onSuccess: () => {
            toast.success('Your password changed successfully')
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong. Try again later.')
        }
    })
}