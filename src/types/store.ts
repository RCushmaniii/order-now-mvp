export interface Store {
    id: string;
    name: string;
    description: string;
    logo_url?: string;
    phone?: string;
    address?: string;
    hours?: string;
    rating?: number;
    type?: 'restaurant' | 'academic' | 'consulting';
}
