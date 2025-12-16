import {
    TextField,
    IndexTable,
    LegacyCard,
    IndexFilters,
    useSetIndexFiltersMode,
    useIndexResourceState,
    Text,
    ChoiceList,
    RangeSlider,
    Badge,
    useBreakpoints,
    Page,
    Layout,
    EmptyState,
    Button,
    Spinner,
    Toast,
    Frame,
    Pagination,
} from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { useMutation } from 'react-query';
import { useAppQuery, useAuthenticatedFetch } from '../../hooks';

function ProductsIndexPage() {
    const fetch = useAuthenticatedFetch();
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState(null);
    const { smDown } = useBreakpoints();

    const [queryValue, setQueryValue] = useState('');
    const [statusFilter, setStatusFilter] = useState(undefined);
    const [priceFilter, setPriceFilter] = useState(undefined);
    const [vendorFilter, setVendorFilter] = useState('');

    const buildProductsUrl = () => {
        const params = new URLSearchParams({
            page,
            search: queryValue,
            status: statusFilter?.[0] || '',
            per_page: 10
        });
        return `/api/products?${params}`;
    };

    const {
        data: response,
        isLoading,
        isError,
        refetch,
    } = useAppQuery({
        url: buildProductsUrl(),
        reactQueryOptions: {
            keepPreviousData: true,
        },
    });

    const products = response?.data || [];
    const meta = response?.meta || {};

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const [itemStrings, setItemStrings] = useState([
        'All',
        'Active',
        'Draft',
        'Archived',
    ]);

    const [selected, setSelected] = useState(0);

    const deleteView = (index) => {
        const newItemStrings = [...itemStrings];
        newItemStrings.splice(index, 1);
        setItemStrings(newItemStrings);
        setSelected(0);
    };

    const duplicateView = async (name) => {
        setItemStrings([...itemStrings, name]);
        setSelected(itemStrings.length);
        await sleep(1);
        return true;
    };

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions:
            index === 0
                ? []
                : [
                    {
                        type: 'rename',
                        onAction: () => { },
                        onPrimaryAction: async (value) => {
                            const newItemsStrings = tabs.map((item, idx) => {
                                if (idx === index) {
                                    return value;
                                }
                                return item.content;
                            });
                            await sleep(1);
                            setItemStrings(newItemsStrings);
                            return true;
                        },
                    },
                    {
                        type: 'duplicate',
                        onPrimaryAction: async (value) => {
                            await sleep(1);
                            duplicateView(value);
                            return true;
                        },
                    },
                    {
                        type: 'edit',
                    },
                    {
                        type: 'delete',
                        onPrimaryAction: async () => {
                            await sleep(1);
                            deleteView(index);
                            return true;
                        },
                    },
                ],
    }));

    const onCreateNewView = async (value) => {
        await sleep(500);
        setItemStrings([...itemStrings, value]);
        setSelected(itemStrings.length);
        return true;
    };

    const sortOptions = [
        { label: 'Title', value: 'title asc', directionLabel: 'A-Z' },
        { label: 'Title', value: 'title desc', directionLabel: 'Z-A' },
        { label: 'Price', value: 'price asc', directionLabel: 'Ascending' },
        { label: 'Price', value: 'price desc', directionLabel: 'Descending' },
        { label: 'Status', value: 'status asc', directionLabel: 'A-Z' },
        { label: 'Status', value: 'status desc', directionLabel: 'Z-A' },
    ];
    const [sortSelected, setSortSelected] = useState(['title asc']);
    const { mode, setMode } = useSetIndexFiltersMode();

    const onHandleCancel = () => { };
    const onHandleSave = async () => {
        await sleep(1);
        return true;
    };

    const primaryAction =
        selected === 0
            ? {
                type: 'save-as',
                onAction: onCreateNewView,
                disabled: false,
                loading: false,
            }
            : {
                type: 'save',
                onAction: onHandleSave,
                disabled: false,
                loading: false,
            };

    const handleStatusChange = useCallback(
        (value) => {
            setStatusFilter(value);
            setPage(1);
        },
        [],
    );
    const handlePriceChange = useCallback(
        (value) => setPriceFilter(value),
        [],
    );
    const handleVendorChange = useCallback(
        (value) => setVendorFilter(value),
        [],
    );
    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value);
            setPage(1);
        },
        [],
    );

    const handleStatusRemove = useCallback(() => setStatusFilter(undefined), []);
    const handlePriceRemove = useCallback(() => setPriceFilter(undefined), []);
    const handleVendorRemove = useCallback(() => setVendorFilter(''), []);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);

    const handleFiltersClearAll = useCallback(() => {
        handleStatusRemove();
        handlePriceRemove();
        handleVendorRemove();
        handleQueryValueRemove();
    }, [
        handleStatusRemove,
        handlePriceRemove,
        handleVendorRemove,
        handleQueryValueRemove,
    ]);

    const filters = [
        {
            key: 'status',
            label: 'Status',
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={[
                        { label: 'Active', value: 'active' },
                        { label: 'Draft', value: 'draft' },
                        { label: 'Archived', value: 'archived' },
                    ]}
                    selected={statusFilter || []}
                    onChange={handleStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'vendor',
            label: 'Vendor',
            filter: (
                <TextField
                    label="Vendor"
                    value={vendorFilter}
                    onChange={handleVendorChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
        {
            key: 'price',
            label: 'Price',
            filter: (
                <RangeSlider
                    label="Price is between"
                    labelHidden
                    value={priceFilter || [0, 500]}
                    prefix="$"
                    output
                    min={0}
                    max={2000}
                    step={1}
                    onChange={handlePriceChange}
                />
            ),
        },
    ];

    const appliedFilters = [];
    if (statusFilter && !isEmpty(statusFilter)) {
        const key = 'status';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, statusFilter),
            onRemove: handleStatusRemove,
        });
    }
    if (priceFilter) {
        const key = 'price';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, priceFilter),
            onRemove: handlePriceRemove,
        });
    }
    if (!isEmpty(vendorFilter)) {
        const key = 'vendor';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, vendorFilter),
            onRemove: handleVendorRemove,
        });
    }


    const syncMutation = useMutation(
        async () => {
            const response = await fetch("/api/products/sync", { method: "POST" });
            return response.json();
        },
        {
            onSuccess: (result) => {
                refetch();
                setToast({
                    content: result.message || "Products synced successfully!",
                });
            },
            onError: () => {
                setToast({ content: "Sync failed. Please try again.", error: true });
            },
        });

    const handleSync = () => {
        syncMutation.mutate();
    };

    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    const productsWithStringIds = products.map(p => ({ ...p, id: String(p.id) }));

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(productsWithStringIds);

    const rowMarkup = productsWithStringIds.map(
        (
            { id, title, vendor, status, price },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {title}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{vendor || '-'}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge status={status === "active" ? "success" : "attention"}>
                        {status?.toUpperCase()}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {price ? `$${Number(price).toFixed(2)}` : '-'}
                    </Text>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const toastMarkup = toast ? (
        <Toast
            content={toast.content}
            error={toast.error}
            onDismiss={() => setToast(null)}
            duration={4500}
        />
    ) : null;


    if (isLoading && !response) {
        return (
            <Page title="Products">
                <Layout>
                    <Layout.Section>
                        <LegacyCard>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Spinner size="large" />
                            </div>
                        </LegacyCard>
                    </Layout.Section>
                </Layout>
            </Page >
        );
    }

    if (isError) {
        return (
            <Page title="Products">
                <EmptyState heading="Could not load products" action={{ content: "Retry", onAction: refetch }}>
                    <p>Something went wrong. Please try again.</p>
                </EmptyState>
            </Page>
        );
    }

    return (
        <Frame>
            <Page
                title="Products"
                primaryAction={
                    <Button primary loading={syncMutation.isLoading} onClick={handleSync}>
                        {syncMutation.isLoading ? "Syncing…" : "Sync Products"}
                    </Button>
                }
            >
                <Layout>
                    <Layout.Section>
                        <LegacyCard>
                            <IndexFilters
                                sortOptions={sortOptions}
                                sortSelected={sortSelected}
                                queryValue={queryValue}
                                queryPlaceholder="Searching in all"
                                onQueryChange={handleFiltersQueryChange}
                                onQueryClear={() => setQueryValue('')}
                                onSort={setSortSelected}
                                primaryAction={primaryAction}
                                cancelAction={{
                                    onAction: onHandleCancel,
                                    disabled: false,
                                    loading: false,
                                }}
                                tabs={tabs}
                                selected={selected}
                                onSelect={setSelected}
                                canCreateNewView
                                onCreateNewView={onCreateNewView}
                                filters={filters}
                                appliedFilters={appliedFilters}
                                onClearAll={handleFiltersClearAll}
                                mode={mode}
                                setMode={setMode}
                            />
                            <IndexTable
                                condensed={smDown}
                                resourceName={resourceName}
                                itemCount={products.length}
                                selectedItemsCount={
                                    allResourcesSelected ? 'All' : selectedResources.length
                                }
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: 'Title' },
                                    { title: 'Vendor' },
                                    { title: 'Status' },
                                    { title: 'Price', alignment: 'end' },
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

    function disambiguateLabel(key, value) {
        switch (key) {
            case 'price':
                return `Price is between $${value[0]} and $${value[1]}`;
            case 'vendor':
                return `Vendor includes ${value}`;
            case 'status':
                return value.map((val) => `${val}`).join(', ');
            default:
                return value;
        }
    }

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }
}

export default ProductsIndexPage;
