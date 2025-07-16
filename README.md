# YapaNow - Multi-Channel Ordering Platform

A comprehensive multi-business ordering platform built with React, TypeScript, and modern web technologies. YapaNow connects businesses with customers through Facebook integration, direct web ordering, and future WhatsApp support.

## 🌟 Overview

YapaNow has evolved from a simple food ordering MVP into a versatile multi-channel platform that supports various business types including restaurants, academic services, professional consulting, and more. The platform is designed to integrate seamlessly with social media channels, particularly Facebook, enabling businesses to convert social media engagement into direct orders.

## 🚀 Features

### ✅ Implemented
- **Multi-Business Architecture**: Support for restaurants, academic services, consulting, and more
- **Facebook Integration**: Direct "Order Now" buttons that connect Facebook pages to instant ordering
- **Bilingual Support**: Spanish/English interfaces with dynamic text based on business type
- **Store Directory**: Comprehensive listing of all available businesses and services
- **Dynamic Ordering System**: Adaptive UI that changes based on business type (food orders vs. service requests)
- **Modern OrderNowApp Component**: Complete TypeScript rewrite with strict type safety
- **Professional Service Integration**: Special support for Dr. Verónica's academic biology services
- **Responsive Design**: Modern, mobile-first UI with Tailwind CSS
- **Error Boundary System**: Comprehensive error handling for improved reliability
- **React Router**: Multi-page navigation with clean URL structure
- **TypeScript**: Full type safety throughout the application with strict compliance
- **React Hooks Compliance**: All components follow React Hook rules properly

### 🔄 In Development
- **Real Supabase Integration**: Connect to live database for dynamic content
- **Payment Processing**: Stripe integration for secure transactions
- **WhatsApp Integration**: Conversational ordering and notifications
- **Store Owner Dashboard**: Real-time order management interface
- **Image Upload System**: Dynamic image management for businesses
- **Advanced Analytics**: Business insights and performance tracking

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Payment Processing**: Stripe (planned)
- **Error Handling**: React Error Boundary
- **State Management**: React Hooks
- **Development Tools**: ESLint, Prettier, TypeScript ESLint
- **UI Components**: Headless UI, Heroicons
- **Deployment**: Netlify (yapanow.netlify.app)

## 🏗️ Architecture Overview

### Multi-Business Platform Design

YapaNow is architected to support multiple business types with dynamic content and behavior:

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.tsx       # App-level error handling
│   │   ├── ComponentErrorBoundary.tsx  # Component-level errors
│   │   ├── EnvironmentErrorBoundary.tsx # Environment-specific handling
│   │   └── OrderNowApp.tsx         # Modern ordering component with TypeScript
│   ├── pages/              # Main application pages
│   │   ├── OrderPage.tsx           # Legacy ordering interface
│   │   ├── OrderSuccess.tsx        # Order confirmation page
│   │   └── StoreDirectory.tsx      # Business listing page
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
```

### Key Features

#### 1. **Dynamic Business Types**
- **Restaurants**: Traditional food ordering with cart functionality
- **Academic Services**: Professional consultation requests (Dr. Verónica)
- **Business Consulting**: Service-based ordering system
- **Extensible**: Easy to add new business types

#### 2. **Facebook Integration Ready**
- Direct deep-link support: `yapanow.netlify.app/order/{business-id}`
- Seamless transition from Facebook "Order Now" buttons
- Social media optimized URLs and metadata

#### 3. **Internationalization**
- Dynamic text switching based on business type
- Spanish interface for academic services
- English interface for restaurants and consulting
- Extensible language system

#### 4. **Error Handling Strategy**
- **App-level error boundary** - Catches application-wide errors
- **Component-level boundaries** - Isolates UI component errors
- **Environment-specific handling** - Different experiences for dev/production
- **TypeScript safety** - Compile-time error prevention

#### 5. **Code Quality & TypeScript Compliance**
- **Strict TypeScript**: All components use proper type annotations
- **React Hook Rules**: Components follow React Hook usage guidelines
- **Error Type Safety**: Proper handling of unknown error types in catch blocks
- **Component Separation**: UI components separated to avoid hook violations
- **Lint Compliance**: Zero TypeScript and ESLint errors
- **Type Guards**: Safe type checking for runtime error handling

For complete details on error handling, see the [Error Boundary Setup Guide](./README%20Error%20Boundary%20Setup%20Guide.md).

## 🌐 Live Demo

**Production URL**: [yapanow.netlify.app](https://yapanow.netlify.app)

### Demo Businesses

1. **Dr. Verónica Carolina Rosas Espinoza** (Academic Services)
   - URL: `yapanow.netlify.app/order/dra-veronica-rosas`
   - Spanish interface for biology consulting services
   - Professional service request system

2. **Bella Italia** (Restaurant)
   - URL: `yapanow.netlify.app/order/bella-italia`
   - Traditional food ordering interface
   - Cart-based ordering system

3. **Store Directory**
   - URL: `yapanow.netlify.app/stores`
   - Browse all available businesses

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account (for future database integration)

## 🔧 Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd order-now-mvp
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (optional for current demo)
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## 🎯 Usage Examples

### Facebook Integration
To integrate with Facebook "Order Now" buttons, use these URL patterns:

```
# Academic Services (Spanish)
https://yapanow.netlify.app/order/dra-veronica-rosas

# Restaurant (English)
https://yapanow.netlify.app/order/bella-italia

# Business Consulting
https://yapanow.netlify.app/order/consulting-pro
```

### Adding New Business Types
1. Add business data to `StoreDirectory.tsx`
2. Configure business-specific text in `OrderPage.tsx`
3. Add routing in `App.tsx`
4. Customize UI behavior based on business type

## 📁 Project Structure

```
order-now-mvp/
├── public/                     # Static assets
│   ├── images/                 # Image assets organized by category
│   │   ├── stores/             # Store/business specific images
│   │   │   ├── logos/          # Business logos and branding
│   │   │   ├── menus/          # Menu items and food photos
│   │   │   ├── profiles/       # Business profile images
│   │   │   └── banners/        # Header/banner images
│   │   ├── placeholders/       # Placeholder images for development
│   │   └── ui/                 # UI icons and graphics
│   └── vite.svg
├── src/
│   ├── assets/                 # Images and static resources
│   ├── components/             # Reusable UI components
│   │   ├── ErrorBoundary.tsx           # App-level error handling
│   │   ├── ComponentErrorBoundary.tsx  # Component-level errors
│   │   └── EnvironmentErrorBoundary.tsx # Environment handling
│   ├── pages/                  # Main application pages
│   │   ├── OrderPage.tsx               # Dynamic ordering interface
│   │   └── StoreDirectory.tsx          # Business listing
│   ├── utils/                  # Utility functions
│   │   └── supabase.ts                 # Supabase client config
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

## 🖼️ Image Asset Organization

YapaNow uses a structured approach to organize images for scalability across multiple businesses:

### Directory Structure
- **`public/images/stores/`** - Business-specific assets
  - `logos/` - Business logos and branding materials
  - `menus/` - Food items, service photos, product images
  - `profiles/` - Business profile and team photos
  - `banners/` - Header images and promotional banners
- **`public/images/placeholders/`** - Development placeholder images
- **`public/images/ui/`** - UI icons, graphics, and interface elements

### Naming Convention
```
# Business logos
logos/{business-slug}-logo.{ext}
logos/dra-veronica-rosas-logo.png
logos/bella-italia-logo.jpg

# Menu/service items
menus/{business-slug}/{item-slug}.{ext}
menus/bella-italia/margherita-pizza.jpg
menus/dra-veronica-rosas/biology-consultation.png

# Profile images
profiles/{business-slug}-profile.{ext}
profiles/dra-veronica-rosas-profile.jpg
```

### Future Integration
- Images will be dynamically loaded based on business slug
- Supabase Storage integration planned for user-uploaded content
- Automatic image optimization and responsive sizing
- CDN integration for improved performance

## 🚀 Deployment

### Current Deployment
- **Platform**: Netlify
- **URL**: [yapanow.netlify.app](https://yapanow.netlify.app)
- **Auto-deploy**: Connected to main branch

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Multi-business platform architecture
- [x] Facebook integration ready
- [x] Responsive design with Tailwind CSS
- [x] Error boundary system
- [x] TypeScript implementation with strict compliance
- [x] Store directory system
- [x] OrderNowApp component with full type safety
- [x] React Hook rules compliance
- [x] Modern routing with App.tsx updates
- [x] Order success page integration

### Phase 2: Backend Integration 🔄
- [ ] Connect to live Supabase database
- [ ] Dynamic menu/service loading
- [ ] Real-time order management
- [ ] User authentication system
- [ ] Image upload and management

### Phase 3: Payment & Communication 📋
- [ ] Stripe payment integration
- [ ] WhatsApp API integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Order tracking system

### Phase 4: Business Tools 📋
- [ ] Store owner dashboard
- [ ] Analytics and reporting
- [ ] Inventory management
- [ ] Customer management
- [ ] Marketing tools

### Phase 5: Scale & Optimize 📋
- [ ] Multi-language support expansion
- [ ] Performance optimization
- [ ] Mobile app development
- [ ] API for third-party integrations
- [ ] Advanced analytics

## 🤝 Contributing

This is currently a private MVP project. For questions or collaboration opportunities, please contact the development team.

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Support

For technical support or business inquiries:
- **Demo Site**: [yapanow.netlify.app](https://yapanow.netlify.app)
- **Email**: Contact through the demo site
- **Documentation**: See [Error Boundary Setup Guide](./README%20Error%20Boundary%20Setup%20Guide.md)

---

**YapaNow** - Connecting businesses with customers across all channels 🚀
