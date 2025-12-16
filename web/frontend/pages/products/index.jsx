import {
    IndexTable, LegacyCard, IndexFilters, useSetIndexFiltersMode, useIndexResourceState,
    Text, Badge, useBreakpoints, Page, Layout, EmptyState, Button, Spinner, Toast, Frame, Pagination
} from '@shopify/polaris';
import { useProducts } from '../../hooks/useProducts';
import { useSyncProducts } from '../../hooks/useSyncProducts';
import { useState } from 'react';

import { PRODUCT_STATUS_BADGE } from '../../constants';

import { useTranslation } from 'react-i18next';

export default function ProductsIndexPage() {
    const { t } = useTranslation();
    const { smDown } = useBreakpoints();
    const { mode, setMode } = useSetIndexFiltersMode();

    const {
        page, setPage, queryValue, selectedTab, setSelectedTab,
        products, meta, isLoading, isError, refetch,
        tabs, handleQueryChange, handleQueryClear, handleClearAll
    } = useProducts();

    const [toast, setToast] = useState(null);

    const { syncMutation, handleSync } = useSyncProducts({
        onSuccessCallback: (result) => {
            refetch();
            setToast({ content: result.message || t('ProductsPage.toast.syncSuccess'), error: result.error });
        }
    });

    const productsWithIds = products.map((p) => ({ ...p, id: String(p.id) }));
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(productsWithIds);

    const toastMarkup = toast && <Toast content={toast.content} error={toast.error} onDismiss={() => setToast(null)} duration={4500} />;

    const rowMarkup = productsWithIds.map(({ id, title, vendor, status, price }, index) => (
        <IndexTable.Row key={id} id={id} position={index} selected={selectedResources.includes(id)}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">{title}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{vendor || '-'}</IndexTable.Cell>
            <IndexTable.Cell>
                <Badge status={PRODUCT_STATUS_BADGE[status] || 'new'}>{status ? t(`Statuses.${status.toLowerCase()}`) : '-'}</Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as="span" alignment="end" numeric>{price ? `$${Number(price).toFixed(2)}` : '-'}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    if (isLoading && !products.length) return (
        <Page title={t('ProductsPage.title')}>
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
        <Page title={t('ProductsPage.title')}>
            <EmptyState heading={t('ProductsPage.emptyStateHeading')} action={{ content: t('ProductsPage.retry'), onAction: refetch }}>
                <p>{t('ProductsPage.emptyStateContent')}</p>
            </EmptyState>
        </Page>
    );

    return (
        <Frame>
            <Page
                fullWidth
                title={t('ProductsPage.title')}
                primaryAction={
                    <Button primary loading={syncMutation.isLoading} onClick={handleSync}>
                        {syncMutation.isLoading ? t('ProductsPage.syncing') : t('ProductsPage.syncButton')}
                    </Button>
                }
            >
                <Layout>
                    <Layout.Section>
                        <LegacyCard>
                            <IndexFilters
                                queryValue={queryValue}
                                queryPlaceholder={t('ProductsPage.searchPlaceholder')}
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
                                resourceName={{ singular: 'product', plural: 'products' }}
                                itemCount={products.length}
                                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: t('ProductsPage.table.headings.title') },
                                    { title: t('ProductsPage.table.headings.vendor') },
                                    { title: t('ProductsPage.table.headings.status') },
                                    { title: t('ProductsPage.table.headings.price'), alignment: 'end' },
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
