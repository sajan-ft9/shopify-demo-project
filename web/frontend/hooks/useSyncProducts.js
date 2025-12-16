import { useMutation } from 'react-query';
import { useAuthenticatedFetch } from './index';

export function useSyncProducts({ onSuccessCallback }) {
    const fetch = useAuthenticatedFetch();

    const syncMutation = useMutation(
        async () => {
            const res = await fetch('/api/products/sync', { method: 'POST' });
            return res.json();
        },
        {
            onSuccess: (result) => {
                if (onSuccessCallback) onSuccessCallback(result);
            },
            onError: () => {
                if (onSuccessCallback) onSuccessCallback({ error: true, message: 'Sync failed. Please try again.' });
            },
        }
    );

    const handleSync = () => syncMutation.mutate();

    return { syncMutation, handleSync };
}
