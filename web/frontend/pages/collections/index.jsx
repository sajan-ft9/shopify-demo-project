import {
    IndexTable, LegacyCard, IndexFilters, useSetIndexFiltersMode, useIndexResourceState,
    Text, useBreakpoints, Page, Layout, EmptyState, Button, Spinner, Toast, Frame, Pagination, Thumbnail
} from '@shopify/polaris';
import { useCollections } from '../../hooks/useCollections';
import { useSyncCollections } from '../../hooks/useSyncCollections';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';

export default function CollectionsIndexPage() {
    const { t } = useTranslation();
    const { smDown } = useBreakpoints();
    const { mode, setMode } = useSetIndexFiltersMode();

    const {
        page, setPage, queryValue,
        collections, meta, isLoading, isError, refetch,
        handleQueryChange, handleQueryClear, handleClearAll
    } = useCollections();

    const [toast, setToast] = useState(null);

    const { syncMutation, handleSync } = useSyncCollections({
        onSuccessCallback: (result) => {
            refetch();
            setToast({ content: result.message || t('CollectionsPage.toast.syncSuccess'), error: result.error });
        }
    });

    const collectionsWithIds = collections.map((c) => ({ ...c, id: String(c.id) }));
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(collectionsWithIds);

    const toastMarkup = toast && <Toast content={toast.content} error={toast.error} onDismiss={() => setToast(null)} duration={4500} />;

    const rowMarkup = collectionsWithIds.map(({ id, title, handle, image, sort_order }, index) => (
        <IndexTable.Row key={id} id={id} position={index} selected={selectedResources.includes(id)}>
            {/* <IndexTable.Cell>
                <Thumbnail
                    source={image || ImageIcon}
                    alt={title}
                    size="small"
                />
            </IndexTable.Cell> */}
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">{title}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{handle}</IndexTable.Cell>
            <IndexTable.Cell>{sort_order || '-'}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    if (isLoading && !collections.length) return (
        <Page title={t('CollectionsPage.title')}>
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
        <Page title={t('CollectionsPage.title')}>
            <EmptyState heading={t('CollectionsPage.emptyStateHeading')} action={{ content: t('CollectionsPage.retry'), onAction: refetch }}>
                <p>{t('CollectionsPage.emptyStateContent')}</p>
            </EmptyState>
        </Page>
    );

    return (
        <Frame>
            <Page
                title={t('CollectionsPage.title')}
                primaryAction={
                    <Button primary loading={syncMutation.isLoading} onClick={handleSync}>
                        {syncMutation.isLoading ? t('CollectionsPage.syncing') : t('CollectionsPage.syncButton')}
                    </Button>
                }
            >
                <Layout>
                    <Layout.Section>
                        <LegacyCard>
                            <IndexFilters
                                queryValue={queryValue}
                                queryPlaceholder={t('CollectionsPage.searchPlaceholder')}
                                onQueryChange={handleQueryChange}
                                onQueryClear={handleQueryClear}
                                cancelAction={{ onAction: handleQueryClear }}
                                tabs={[]}
                                selected={0}
                                onSelect={() => { }}
                                filters={[]}
                                appliedFilters={[]}
                                onClearAll={handleClearAll}
                                mode={mode}
                                setMode={setMode}
                            />
                            <IndexTable
                                condensed={smDown}
                                resourceName={{ singular: 'collection', plural: 'collections' }}
                                itemCount={collections.length}
                                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: '' }, // Image column
                                    { title: t('CollectionsPage.table.headings.title') },
                                    { title: t('CollectionsPage.table.headings.handle') },
                                    { title: t('CollectionsPage.table.headings.sortOrder') },
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
