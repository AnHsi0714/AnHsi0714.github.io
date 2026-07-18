# SilkRoad — Beverage E-Commerce Platform

## Related Links

Demo: https://youtu.be/oEN80YCLeAc
(The database is currently disabled, so the live site is not functional.)

## Project Overview

This was the final project for a database systems course, aimed at applying database design and requirements-documentation skills to a complete system. We chose "SilkRoad," a <span data-term="b2c">B2C</span> online beverage trading platform that lets shops list, sell, take payment for, and arrange delivery of drinks entirely online — saving customers time, giving shops an extra sales channel, and leaving admins responsible for keeping the platform fair and secure.

Broken down by role into three usage scenarios:

- **Customers**: browse/search listed products, purchase and manage orders, enjoy membership perks and discounts
- **Vendors**: list and manage beverage products, set prices and discount plans, view sales data and customer feedback
- **Admins**: publish announcements, safeguard information security, assist with platform administration

## System Architecture

Built with a decoupled frontend/backend architecture:

- Frontend: React + Next.js
- Backend: Node.js (Express/NestJS) or Python (Django/Flask), depending on requirements
- Database: MySQL

Layering: Client (PC/mobile device) → Frontend Application Layer (web platform) → Connectivity Layer (API) → Service Layer → Data Layer (MySQL). The Service Layer is further split into eight subsystems, coordinated by the main "Online Ordering System" (OOS):

| Subsystem | Code | Scope |
| --- | --- | --- |
| Admin Management | AM | Announcements, permission control, ban records |
| Vendor Management | VMS | Shop info, product listing entry point |
| Customer Management | CMS | Member data, login state |
| Shopping Cart | SCS | Staged items, pre-checkout |
| Product Management | PMS | Product <span data-term="crud">CRUD</span>, customization options |
| Financial Management | FMS | Payment transactions, discounts, refunds |
| Store Review & Rating | SRRS | Customer ratings and reviews |
| Order & Delivery Management | ODMS | Order status, delivery info |

## Key Business Rules

Constraints established during system design to keep data integrity and business logic consistent:

- Product prices and discount amounts can never be negative; discount rates cannot exceed 100%
- Transaction records cannot be deleted, only marked as "refunded," and a refund amount can never exceed the original payment amount
- Inventory for a given product cannot go below 0; order totals must be greater than 0
- User accounts must be unique, and passwords are stored encrypted
- Vendors can only manage their own products, cannot delete products that already have transaction records — those can only be delisted
- Admins can review/freeze vendor accounts that violate rules, but cannot directly modify transaction amounts

## Database Design

The biggest design challenge was beverages' "multi-dimensional customization": the same drink has sweetness, ice level, and size options, and size also affects the price. To balance <span data-term="normalization">Normalization</span> against query performance, we ended up splitting these options into independent `SUGAR_OPTIONS`, `ICE_OPTIONS`, and `SIZES_OPTIONS` sub-tables (all keyed to `product_id` as an <span data-term="pk-fk">FK</span>), so each product can have its own set of option combinations; `SIZES_OPTIONS` additionally carries a `price_step` field to handle size-based price increases.

At checkout, `CART_ITEM` / `ORDER_ITEM` store a snapshot of the `selected_sugar` / `selected_ice` / `selected_size` chosen at that moment along with the final `price`, rather than referencing `PRODUCT`'s current settings live — so if a vendor later changes a product's options or price, existing historical orders aren't retroactively affected.

For roles, `USER` is a shared base table, with `ADMIN` / `CUSTOMER` / `VENDOR` simulating inheritance through a 1:1 <span data-term="pk-fk">PK-FK</span> relationship. `VENDOR` also has a separate `VENDOR_MANAGER` entity, since a single vendor manager may run multiple branches (e.g. "50 Lan – Da'an Branch" and "KeBuKe – Xinyi Branch" might both report to the same regional manager).

<figure>
  <img src="/images/projects/silkroad/erdplus.png" alt="SilkRoad ER Model" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">SilkRoad ER Model</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/schema.png" alt="SilkRoad Logical Database Schema" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">SilkRoad Logical Database Schema</figcaption>
</figure>

## Core Features

With a decoupled frontend/backend, the frontend focuses on an intuitive shopping interface and live price display, while the backend handles data validation, business logic, and database access.

### Customer Side

On a product page, customers can pick size, ice level, and sweetness directly and see the adjusted price update live; after adding to cart, they can switch between pickup/delivery and choose a payment method. Once an order is placed, it appears on the order history page as horizontally scrollable cards showing each order's details.

<figure>
  <img src="/images/projects/silkroad/buy-drink.png" alt="Product customization options (size/ice/sweetness)" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Product customization options (size/ice/sweetness)</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/cart.png" alt="Shopping cart and delivery method selection" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Shopping cart and delivery method selection</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/order.png" alt="Order history" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Order history</figcaption>
</figure>

### Vendor Side

Vendors can directly edit listing status, price, and customization options from the product management page; the discount management center summarizes all currently active discounts and provides a form for creating new discount codes (percentage-off or fixed-amount, minimum spend, maximum discount, membership eligibility).

<figure>
  <img src="/images/projects/silkroad/product-manage.png" alt="Product management" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Product management</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/discount-manage.png" alt="Discount management center" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Discount management center</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/post-discount.png" alt="Publishing a new discount" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Publishing a new discount</figcaption>
</figure>

### Admin Side

Admins can toggle between customer and vendor lists on the user management page, search by name or email, and ban accounts flagged as problematic.

<figure>
  <img src="/images/projects/silkroad/user-manage.png" alt="User management" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">User management</figcaption>
</figure>

We also implemented a homepage for browsing vendors, an About Us page, login/registration (with email verification codes), profile pages for each role, a customer top-up center, a customer review section (filterable by star rating and date), and system announcement management, among other pages.

## Reflections

From the initial <span data-term="er-model">ER Model</span> design through splitting out the customization-attribute relation tables, this project gave us a firsthand feel for how schema design shapes backend API complexity and the frontend user experience. It also gave us early exposure to collaborating under a decoupled frontend/backend workflow — API integration frequently got stuck on data-format mismatches or guest-vs-member cart state falling out of sync, and we worked through each of those issues via close team communication and debugging.
