# Order Now MVP

A modern, responsive food ordering application built with React, TypeScript, and Supabase.

## 🌟 Overview

Order Now is a minimum viable product (MVP) for a food ordering system designed to streamline the ordering process for restaurants and food businesses. This application provides a user-friendly interface for customers to browse menus, place orders, and track deliveries.

## 🚀 Features

### Implemented
- ✅ Project setup with React, TypeScript, and Vite
- ✅ UI styling with Tailwind CSS
- ✅ Supabase integration for backend functionality
- ✅ Environment configuration for development
- ✅ Comprehensive error boundary system for improved reliability

### Planned
- 🔄 User authentication and account management
- 🔄 Restaurant/menu browsing interface
- 🔄 Shopping cart functionality
- 🔄 Order placement and tracking
- 🔄 Payment integration
- 🔄 Admin dashboard for restaurants
- 🔄 Order management system

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Backend as a Service**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Hooks (with potential for additional libraries as needed)
- **Development Tools**: ESLint, Prettier

## 🔧 Technical Architecture

### Error Handling Strategy

The application implements a comprehensive error boundary system that improves reliability and user experience:

- **App-level error boundary** (`ErrorBoundary.tsx`) - Catches errors throughout the entire application
- **Component-level boundaries** (`ComponentErrorBoundary.tsx`) - Isolates errors to specific UI components
- **Environment-specific handling** (`EnvironmentErrorBoundary.tsx`) - Provides different error experiences based on development/production environment
- **Async error support** (`useAsyncError.ts`) - Captures errors in asynchronous operations
- **Error reporting** (`errorReporting.ts`) - Framework for logging and monitoring errors

For complete details on the error handling implementation, see the [Error Boundary Setup Guide](./README%20Error%20Boundary%20Setup%20Guide.md).

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account and project setup

## 🔧 Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd order-now-mvp
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📁 Project Structure

```
/
├── public/            # Static assets
├── src/
│   ├── assets/        # Images and other assets
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Application pages
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Entry point
│   ├── supabaseClient.ts # Supabase client configuration
├── .env.local         # Environment variables (not committed to git)
├── index.html         # HTML entry point
├── package.json       # Project dependencies and scripts
├── postcss.config.js  # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## 🚀 Development Status

The project is currently in the initial development phase. The foundation with React, TypeScript, Vite, and Supabase has been set up. UI components using Tailwind CSS are being developed.

### Current Tasks

- Setting up database schema in Supabase
- Designing core UI components
- Implementing authentication flow

## 🔮 Roadmap

1. **Phase 1**: Core UI and authentication - *In Progress*
2. **Phase 2**: Menu browsing and cart functionality
3. **Phase 3**: Order placement and tracking
4. **Phase 4**: Admin dashboard and order management
5. **Phase 5**: Payment integration and deployment

## 📜 License

[MIT License](LICENSE)

## 👥 Contributors

- Robert Cushman - Project Lead
