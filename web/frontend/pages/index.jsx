import {
    Page,
    Layout,
    Text,
    Button,
    Stack,
    Card,
    TextContainer,
    Spinner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useSyncCollections, useSyncProducts, useSyncOrders } from "../hooks";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: dashboardData, isLoading, refetch } = useAppQuery({
        url: "/api/dashboard",
        reactQueryOptions: {
            refetchOnWindowFocus: false,
        },
    });

    const refreshDashboard = () => {
        refetch();
    };

    const { handleSync: syncProducts, syncMutation: productMutation } = useSyncProducts({
        onSuccessCallback: refreshDashboard
    });

    const { handleSync: syncCollections, syncMutation: collectionMutation } = useSyncCollections({
        onSuccessCallback: refreshDashboard
    });

    const { handleSync: syncOrders, syncMutation: orderMutation } = useSyncOrders({
        onSuccessCallback: refreshDashboard
    });

    if (isLoading) {
        return (
            <Page fullWidth>
                <div style={{ display: "flex", justifyContent: "center", paddingTop: "100px" }}>
                    <Spinner size="large" />
                </div>
            </Page>
        );
    }

    const cards = [
        {
            title: t("Dashboard.totalProducts"),
            count: dashboardData?.products?.count,
            lastSync: dashboardData?.products?.last_synced_at,
            onSync: syncProducts,
            isLoading: productMutation.isLoading,
            key: 'products',
            path: '/products'
        },
        {
            title: t("Dashboard.totalCollections"),
            count: dashboardData?.collections?.count,
            lastSync: dashboardData?.collections?.last_synced_at,
            onSync: syncCollections,
            isLoading: collectionMutation.isLoading,
            key: 'collections',
            path: '/collections'
        },
        {
            title: t("Dashboard.totalOrders"),
            count: dashboardData?.orders?.count,
            lastSync: dashboardData?.orders?.last_synced_at,
            onSync: syncOrders,
            isLoading: orderMutation.isLoading,
            key: 'orders',
            path: '/orders'
        }
    ];

    return (
        <Page fullWidth>
            <TitleBar title={t("Dashboard.title")} primaryAction={null} />
            <Layout>
                <Layout.Section>
                    <Stack distribution="fillEvenly" spacing="loose">
                        {cards.map(card => (
                            <div key={card.key} style={{ flex: 1 }}>
                                <Card sectioned>
                                    <Stack vertical spacing="tight">
                                        <TextContainer>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text variant="headingMd" as="h2">{card.title}</Text>
                                                <Button size="slim" plain onClick={() => navigate(card.path)}>
                                                    View
                                                </Button>
                                            </div>
                                            <Text variant="headingXl" as="p">{card.count ?? "-"}</Text>
                                        </TextContainer>
                                        <div style={{ minHeight: '1.5rem' }}>
                                            {card.lastSync ? (
                                                <Text variant="bodySm" color="subdued" as="p">
                                                    {t("Dashboard.lastSync")}: {new Date(card.lastSync).toLocaleString()}
                                                </Text>
                                            ) : (
                                                <Text variant="bodySm" color="subdued" as="p">-</Text>
                                            )}
                                        </div>
                                        <Button
                                            onClick={card.onSync}
                                            loading={card.isLoading}
                                            primary
                                            fullWidth
                                        >
                                            {t("Dashboard.sync")}
                                        </Button>
                                    </Stack>
                                </Card>
                            </div>
                        ))}
                    </Stack>
                </Layout.Section>
                <Layout.Section>
                    <Card sectioned>
                        <TextContainer>
                            <Text variant="headingMd" as="h2">{t("Dashboard.totalRevenue")}</Text>
                            <Text variant="headingXl" as="p">
                                {dashboardData?.total_revenue ? `$${parseFloat(dashboardData.total_revenue).toFixed(2)}` : "-"}
                            </Text>
                        </TextContainer>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
