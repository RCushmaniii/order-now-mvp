export interface MenuItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  emoji: string;
  available: boolean;
  discount?: number;
  rating: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string;
  phone: string;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  items: OrderItem[];
  timestamp: Date;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}

export interface Business {
  id: string;
  name: string;
  type: 'restaurant' | 'academic' | 'consulting';
  description: string;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  language: 'en' | 'es';
}
