export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url?: string;
    available: boolean;
    rating?: number;
    prep_time?: number;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface OrderFormData {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    delivery_address: string;
    payment_method: string;
    special_instructions: string;
}

export interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed';
    items: CartItem[];
    timestamp: Date;
    store_id: string;
}

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}