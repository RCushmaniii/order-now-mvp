import React from 'react';
import { Store } from '../../types/store';
import { MapPin, Clock, Star } from 'lucide-react';

interface StoreInfoProps {
    store: Store | null;
}

export const StoreInfo: React.FC<StoreInfoProps> = ({ store }) => {
    if (!store) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start space-x-4">
                {store.logo_url && (
                    <img 
                        src={store.logo_url} 
                        alt={store.name}
                        className="w-16 h-16 rounded-lg object-cover"
                    />
                )}
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                    <p className="text-gray-600 mt-1">{store.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        {store.rating && (
                            <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{store.rating}</span>
                            </div>
                        )}
                        
                        {store.address && (
                            <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{store.address}</span>
                            </div>
                        )}
                        
                        {store.hours && (
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{store.hours}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
