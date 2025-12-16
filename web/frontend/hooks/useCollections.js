import { useState, useCallback } from 'react';
import { useAppQuery } from './index';

import { useTranslation } from 'react-i18next';

export function useCollections({ perPage = 10 } = {}) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [queryValue, setQueryValue] = useState('');

    const buildCollectionsUrl = () => {
        const params = new URLSearchParams({
            page,
            search: queryValue,
            per_page: perPage,
        });
        return `/api/collections?${params}`;
    };

    const { data: response, isLoading, isError, refetch } = useAppQuery({
        url: buildCollectionsUrl(),
        reactQueryOptions: { keepPreviousData: true },
    });

    const collections = response?.data || [];
    const meta = response?.meta || {};

    const handleQueryChange = useCallback((v) => setQueryValue(v), []);
    const handleQueryClear = useCallback(() => setQueryValue(''), []);
    const handleClearAll = useCallback(() => {
        handleQueryClear();
    }, [handleQueryClear]);

    return {
        page,
        setPage,
        queryValue,
        collections,
        meta,
        isLoading,
        isError,
        refetch,
        handleQueryChange,
        handleQueryClear,
        handleClearAll,
    };
}
