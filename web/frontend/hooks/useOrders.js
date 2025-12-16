import { useState, useEffect, useCallback } from 'react';
import { useAppQuery } from './index';

import { ORDER_FINANCIAL_STATUS } from '../constants';

import { useTranslation } from 'react-i18next';

export function useOrders({ perPage = 10 } = {}) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [queryValue, setQueryValue] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [statusFilter, setStatusFilter] = useState(undefined);

    const tabs = [
        { content: t('Statuses.all'), id: 'all' },
        { content: t('Statuses.paid'), id: ORDER_FINANCIAL_STATUS.PAID },
        { content: t('Statuses.pending'), id: ORDER_FINANCIAL_STATUS.PENDING },
        { content: t('Statuses.refunded'), id: ORDER_FINANCIAL_STATUS.REFUNDED },
    ];

    useEffect(() => {
        const selectedId = tabs[selectedTab].id;
        setStatusFilter(selectedId === 'all' ? undefined : [selectedId]);
        setPage(1);
    }, [selectedTab]);

    const buildOrdersUrl = () => {
        const params = new URLSearchParams({
            page,
            search: queryValue,
            financial_status: statusFilter?.[0] || '',
            per_page: perPage,
        });
        return `/api/orders?${params}`;
    };

    const { data: response, isLoading, isError, refetch } = useAppQuery({
        url: buildOrdersUrl(),
        reactQueryOptions: { keepPreviousData: true },
    });

    const orders = response?.data || [];
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
        orders,
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
