import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WhatsAppStatus } from '../../types/whatsapp';

interface WhatsAppContextType {
    enabled: boolean;
    status: WhatsAppStatus;
    error: string | null;
    setEnabled: (enabled: boolean) => void;
    setStatus: (status: WhatsAppStatus) => void;
    setError: (error: string | null) => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

interface WhatsAppProviderProps {
    children: ReactNode;
}

export const WhatsAppProvider: React.FC<WhatsAppProviderProps> = ({ children }) => {
    const [enabled, setEnabled] = useState(false);
    const [status, setStatus] = useState<WhatsAppStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const value = {
        enabled,
        status,
        error,
        setEnabled,
        setStatus,
        setError
    };

    return (
        <WhatsAppContext.Provider value={value}>
            {children}
        </WhatsAppContext.Provider>
    );
};

export const useWhatsApp = (): WhatsAppContextType => {
    const context = useContext(WhatsAppContext);
    if (context === undefined) {
        throw new Error('useWhatsApp must be used within a WhatsAppProvider');
    }
    return context;
};
