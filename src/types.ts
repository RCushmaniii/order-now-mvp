// For OrderNowApp.tsx
export interface MenuItem {
  id: string; // IDs must be strings
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  emoji?: string;
  discount?: number;
  rating?: number;
  originalPrice?: number;
  available: boolean; // 'available' should be a boolean
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Order {
  id: string; // IDs must be strings
  items: CartItem[];
  customer: CustomerInfo;
  totalAmount: number; // Renamed from 'total' for clarity
  timestamp: number;   // Must be a number (e.g., from Date.now() or .getTime())
  status: 'pending' | 'preparing' | 'ready' | 'completed';
}


// For OrderSuccess.tsx (no changes needed here)
export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  type: 'academic' | 'restaurant' | 'consulting';
}

export interface OrderSuccessData {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  store_id: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
  payment_method: string;
}

export interface DebugStep {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: string;
  data?: unknown | null;
}
// Add this property to your existing OrderSuccessData interface
export interface OrderSuccessData {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  store_id: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
  payment_method: string;
  timestamp: number; // This was missing in your original post, make sure it's here
  session_id: string; // This was missing in your original post, make sure it's here
  delivery_address?: string; // <-- ADD THIS LINE
}