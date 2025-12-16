import { useState, useEffect, useCallback } from 'react';
import { useAppQuery } from './index';

import { PRODUCT_STATUS } from '../constants';

import { useTranslation } from 'react-i18next';

export function useProducts({ perPage = 10 } = {}) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [queryValue, setQueryValue] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [statusFilter, setStatusFilter] = useState(undefined);

    const tabs = [
        { content: t('Statuses.all'), id: 'all' },
        { content: t('Statuses.active'), id: PRODUCT_STATUS.ACTIVE },
        { content: t('Statuses.draft'), id: PRODUCT_STATUS.DRAFT },
        { content: t('Statuses.archived'), id: PRODUCT_STATUS.ARCHIVED },
    ];

    useEffect(() => {
        const selectedId = tabs[selectedTab].id;
        setStatusFilter(selectedId === 'all' ? undefined : [selectedId.toLowerCase()]);
        setPage(1);
    }, [selectedTab]);

    const buildProductsUrl = () => {
        const params = new URLSearchParams({
            page,
            search: queryValue,
            status: statusFilter?.[0] || '',
            per_page: perPage,
        });
        return `/api/products?${params}`;
    };

    const { data: response, isLoading, isError, refetch } = useAppQuery({
        url: buildProductsUrl(),
        reactQueryOptions: { keepPreviousData: true },
    });

    const products = response?.data || [];
    const meta = response?.meta || {};

    const handleQueryChange = useCallback((v) => setQueryValue(v), []);
    const handleQueryClear = useCallback(() => setQueryValue(''), []);
    const handleClearAll = useCallback(() => {
        setSelectedTab(0);
        handleQueryClear();
    }, [handleQueryClear]);

    return {
        page,
        setPage,
        queryValue,
        selectedTab,
        setSelectedTab,
        statusFilter,
        products,
        meta,
        isLoading,
        isError,
        refetch,
        tabs,
        handleQueryChange,
        handleQueryClear,
        handleClearAll,
    };
}
