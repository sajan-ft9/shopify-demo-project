# Shopify App Developer Technical Assignment - Demo App

**Name:** Sajan Khadka
**Email:** sajankhad2@gmail.com

This project is a Shopify Embedded App built using the [Shopify App Template for PHP](https://github.com/Shopify/shopify-app-template-php). It fulfills the requirements by providing a comprehensive dashboard and management interface for Shopify Products, Collections, and Orders, with both manual and automatic synchronization capabilities.

## Tech Stack

*   **Backend Framework:** Laravel (PHP)
*   **Frontend Framework:** React + Vite
*   **UI Library:** Shopify Polaris
*   **Database:** MySQL
*   **Integration:** Shopify Admin API (Rest & GraphQL via Shopify PHP SDK)

## Key Features Implemented

### 1. App Installation & Authentication
*   Fully implemented Shopify OAuth 2.0 flow using the Laravel backend.
*   Seamless redirection to the embedded app within the Shopify Admin upon installation.
*   Automatic handling of session tokens using `@shopify/app-bridge-react`.

### 2. Dashboard Overview (`/`)
A dynamic dashboard providing a high-level view of the store's data:
*   **Summary Cards:** Displays total counts for Products, Collections, Orders, and Total Revenue.
*   **Sync Status:** Shows the timestamp of the last successful sync for each entity.
*   **Real-time Sync:** Individual "Sync" buttons for Products, Collections, and Orders that allow manual triggering of data synchronization from the frontend.
*   **Navigation Shortcuts:** Quick "View" buttons to navigate to detailed list pages.

### 3. Products Management (`/products`)
*   **Data Listing:** Displays products stored in the local database.
*   **Filtering & Search:** Search products by title and filter by status (Active, Draft, Archived).
*   **Pagination:** Efficient pagination (10 items per page).
*   **Sync:** Dedicated sync functionality to fetch fresh data from Shopify.

### 4. Collections & Orders
*   **Collections Page:** Lists collections with their product counts and thumbnails. Includes search and pagination.
*   **Orders Page:** Lists orders with financial and fulfillment status. Includes search and pagination.
*   **Revenue Tracking:** Calculates and displays total revenue from orders on the dashboard.

### 5. Backend Architecture (Laravel)
*   **Controller-Service Pattern:** Business logic is separated into Service classes (`ProductService`, `CollectionService`, `OrderSyncService`, etc.) to keep Controllers clean.
*   **API Response Trait:** A custom `ApiResponse` trait ensures consistent JSON response structures across all endpoints (Success, Error, Pagination).
*   **Database Models:** Eloquent models for `Product`, `Collection`, and `Order` with appropriate casting and relationships.
*   **Webhook Handlers:** Implemented handlers for `PRODUCTS_CREATE`, `PRODUCTS_UPDATE`, and `PRODUCTS_DELETE` to strictly follow the requirement of automatic updates.

## Setup & Installation Steps

### Prerequisites
*   PHP 8.1+
*   Composer
*   Node.js & npm (or yarn)
*   MySQL Database
*   A Shopify Partner Account and a Development Store

### Installation
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd sajan-demo-app
    ```

2.  **Install dependencies:**
    *   Backend:
        ```bash
        cd web
        composer install
        ```
    *   Frontend:
        ```bash
        # From the root directory
        npm install
        ```

3.  **Environment Configuration:**
    *   Copy the example environment file:
        ```bash
        cp web/.env.example web/.env
        ```
    *   Update `web/.env` with your database credentials:
        ```env
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=your_database_name
        DB_USERNAME=your_database_user
        DB_PASSWORD=your_database_password
        ```

4.  **Database Migration:**
    Run the migrations to create the necessary tables:
    ```bash
    cd web
    php artisan migrate
    ```

5.  **Run the App:**
    Start the development server (handles both frontend and backend):
    ```bash
    # From the root directory
    npm run dev
    ```
    This command will also prompt you to log in to your Shopify Partner account and select your app.

## Shopify API Scopes

This app requires the following access scopes to function correctly:
*   `read_products`: To fetch and sync product and collection data.
*   `read_orders`: To fetch and sync order data and calculate revenue.

These are configured in `shopify.app.toml`:
```toml
[access_scopes]
scopes = "read_products,read_orders"
```

## Architectural Decisions

*   **Services vs. Controllers:** I extracted data fetching and synchronization logic into dedicated service classes (e.g., `ProductSyncService`). This makes the `ProductsController` responsible only for handling HTTP requests and returning responses, isolating the complexity of interacting with the Shopify API.
*   **Webhooks:** To achieve the "Bonus Feature," I utilized the `Shopify\Webhooks\Registry` to register handlers for `products/create`, `products/update`, and `products/delete`. These handlers allow the local database to stay in sync near-instantly without requiring a full manual sync.
*   **Response Trait:** A `ApiResponse` trait was created to standardize API responses. This simplifies the frontend's error handling and state management by guaranteeing a predictable payload structure (`success`, `message`, `data`, `errors`).
*   **React Query (useAppQuery):** The frontend leverages `react-query` (wrapped as `useAppQuery`) for efficient data fetching, caching, and state management, providing a snappy user experience.

## Commands Reference

*   **Start Dev Server:** `npm run dev`
*   **Migrate Database:** `cd web && php artisan migrate`
*   **Clear Cache:** `cd web && php artisan config:clear && php artisan cache:clear`
