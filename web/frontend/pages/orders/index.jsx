import {
    IndexTable, LegacyCard, IndexFilters, useSetIndexFiltersMode, useIndexResourceState,
    Text, Badge, useBreakpoints, Page, Layout, EmptyState, Button, Spinner, Toast, Frame, Pagination
} from '@shopify/polaris';
import { useOrders } from '../../hooks/useOrders';
import { useSyncOrders } from '../../hooks/useSyncOrders';
import { useState } from 'react';
import {
    ORDER_FINANCIAL_STATUS_BADGE,
    ORDER_FULFILLMENT_STATUS_BADGE
} from '../../constants';


import { useTranslation } from 'react-i18next';

export default function OrdersIndexPage() {
    const { t } = useTranslation();
    const { smDown } = useBreakpoints();
    const { mode, setMode } = useSetIndexFiltersMode();

    const {
        page, setPage, queryValue, selectedTab, setSelectedTab,
        orders, meta, isLoading, isError, refetch,
        tabs, handleQueryChange, handleQueryClear, handleClearAll
    } = useOrders();

    const [toast, setToast] = useState(null);

    const { syncMutation, handleSync } = useSyncOrders({
        onSuccessCallback: (result) => {
            refetch();
            setToast({ content: result.message || t('OrdersPage.toast.syncSuccess'), error: result.error });
        }
    });

    const ordersWithIds = orders.map((p) => ({ ...p, id: String(p.id) }));
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(ordersWithIds);

    const toastMarkup = toast && <Toast content={toast.content} error={toast.error} onDismiss={() => setToast(null)} duration={4500} />;

    const rowMarkup = ordersWithIds.map(({ id, name, email, financial_status, fulfillment_status, total_price, currency, created_at_shopify }, index) => (
        <IndexTable.Row key={id} id={id} position={index} selected={selectedResources.includes(id)}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">{name}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                {new Date(created_at_shopify).toLocaleDateString()}
            </IndexTable.Cell>
            <IndexTable.Cell>{email || '-'}</IndexTable.Cell>
            <IndexTable.Cell>
                <Text as="span" alignment="end" numeric>{total_price ? `${currency} ${Number(total_price).toFixed(2)}` : '-'}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Badge status={ORDER_FINANCIAL_STATUS_BADGE[financial_status] || 'new'}>
                    {financial_status ? t(`Statuses.${financial_status.toLowerCase()}`) : '-'}
                </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Badge status={ORDER_FULFILLMENT_STATUS_BADGE[fulfillment_status] || 'new'}>
                    {fulfillment_status ? t(`Statuses.${fulfillment_status.toLowerCase()}`) : t('Statuses.unfulfilled')}
                </Badge>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    if (isLoading && !orders.length) return (
        <Page title={t('OrdersPage.title')}>
            <Layout>
                <Layout.Section>
                    <LegacyCard>
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Spinner size="large" />
                        </div>
                    </LegacyCard>
                </Layout.Section>
            </Layout>
        </Page>
    );

    if (isError) return (
        <Page title={t('OrdersPage.title')}>
            <EmptyState heading={t('OrdersPage.emptyStateHeading')} action={{ content: t('OrdersPage.retry'), onAction: refetch }}>
                <p>{t('OrdersPage.emptyStateContent')}</p>
            </EmptyState>
        </Page>
    );

    return (
        <Frame>
            <Page
                fullWidth
                title={t('OrdersPage.title')}
                primaryAction={
                    <Button primary loading={syncMutation.isLoading} onClick={handleSync}>
                        {syncMutation.isLoading ? t('OrdersPage.syncing') : t('OrdersPage.syncButton')}
                    </Button>
                }
            >
                <Layout>
                    <Layout.Section>
                        <LegacyCard>
                            <IndexFilters
                                queryValue={queryValue}
                                queryPlaceholder={t('OrdersPage.searchPlaceholder')}
                                onQueryChange={handleQueryChange}
                                onQueryClear={handleQueryClear}
                                cancelAction={{ onAction: handleQueryClear }}
                                tabs={tabs}
                                selected={selectedTab}
                                onSelect={setSelectedTab}
                                filters={[]}
                                appliedFilters={[]}
                                onClearAll={handleClearAll}
                                mode={mode}
                                setMode={setMode}
                            />
                            <IndexTable
                                condensed={smDown}
                                resourceName={{ singular: 'order', plural: 'orders' }}
                                itemCount={orders.length}
                                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: t('OrdersPage.table.headings.order') },
                                    { title: t('OrdersPage.table.headings.date') },
                                    { title: t('OrdersPage.table.headings.customer') },
                                    { title: t('OrdersPage.table.headings.total'), alignment: 'end' },
                                    { title: t('OrdersPage.table.headings.paymentStatus') },
                                    { title: t('OrdersPage.table.headings.fulfillmentStatus') },
                                ]}
                            >
                                {rowMarkup}
                            </IndexTable>

                            {meta.last_page > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                                    <Pagination
                                        hasPrevious={page > 1}
                                        onPrevious={() => setPage(page - 1)}
                                        hasNext={page < meta.last_page}
                                        onNext={() => setPage(page + 1)}
                                    />
                                </div>
                            )}
                        </LegacyCard>
                    </Layout.Section>
                </Layout>
                {toastMarkup}
            </Page>
        </Frame>
    );
}
