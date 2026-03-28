# FinFlow 💸

A comprehensive B2B SaaS platform designed to streamline payment workflows for entrepreneurs. FinFlow generates custom payment deep-links and branded QR codes, bridging the gap between businesses and their clients through seamless payment integrations.

## 🚀 Business Value
- **Accelerated Payments:** Instant generation of payment links for immediate client billing.
- **Brand Consistency:** Customizable, branded QR codes for offline and online points of sale.
- **Automated Workflows:** Eliminates manual invoicing errors through strictly typed data flows and robust backend processing.

## 🏗 Architecture & Tech Stack
This project is structured as a **Turborepo Monorepo** to ensure code reusability, strict architectural boundaries, and independent scalability of the frontend and backend.

### Core Stack
- **Frontend (`apps/web`):** Next.js, React, TypeScript. Optimized for fast rendering and seamless UX.
- **Backend (`apps/api`):** NestJS, TypeScript. Built with a modular architecture for secure and scalable business logic.
- **Shared (`packages/types`):** A dedicated package for shared TypeScript interfaces and DTOs, ensuring end-to-end type safety between the client and server.

## 📁 Repository Structure
```text
finflow/
├── apps/
│   ├── api/          # NestJS application (Core business logic, Auth, Billing)
│   └── web/          # Next.js application (User dashboard, Landing)
├── packages/
│   └── types/        # Shared TypeScript interfaces (End-to-end type safety)
├── docs/             # Technical and product documentation
└── turbo.json        # Monorepo task orchestration
