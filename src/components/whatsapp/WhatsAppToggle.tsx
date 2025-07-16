// src/components/whatsapp/WhatsAppToggle.tsx
import React from 'react';
import { MessageCircle, Check, AlertCircle } from 'lucide-react';
import { WhatsAppStatus } from '../../types/whatsapp';

interface WhatsAppToggleProps {
    enabled: boolean;
    status: WhatsAppStatus;
    error: string | null;
    isAcademicServices: boolean;
    onToggle: (enabled: boolean) => void;
}

export const WhatsAppToggle: React.FC<WhatsAppToggleProps> = ({
    enabled,
    status,
    error,
    isAcademicServices,
    onToggle
}) => {
    const getText = (key: string) => {
        const texts = {
            title: isAcademicServices ? 'Notificaciones WhatsApp' : 'WhatsApp Notifications',
            description: isAcademicServices
                ? 'Recibe actualizaciones de tu solicitud por WhatsApp'
                : 'Get order updates via WhatsApp',
            sending: 'Enviando notificaciones...',
            sent: '¡Notificaciones enviadas!',
            error: 'Error'
        };
        return texts[key as keyof typeof texts] || key;
    };

    return (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                        {getText('title')}
                    </span>
                </div>
                <ToggleSwitch enabled={enabled} onToggle={onToggle} />
            </div>

            <p className="text-xs text-green-600 mt-1">
                {getText('description')}
            </p>

            <WhatsAppStatusIndicator
                status={status}
                error={error}
                getText={getText}
            />
        </div>
    );
};

interface ToggleSwitchProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onToggle(e.target.checked)}
                className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-green-600' : 'bg-gray-200'
                }`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                    } mt-0.5`} />
            </div>
        </label>
    );
};

interface WhatsAppStatusIndicatorProps {
    status: WhatsAppStatus;
    error: string | null;
    getText: (key: string) => string;
}

const WhatsAppStatusIndicator: React.FC<WhatsAppStatusIndicatorProps> = ({
    status,
    error,
    getText
}) => {
    if (status === 'sending') {
        return (
            <div className="text-xs text-blue-600 mt-2 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                {getText('sending')}
            </div>
        );
    }

    if (status === 'sent') {
        return (
            <div className="text-xs text-green-600 mt-2 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                {getText('sent')}
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-xs text-red-600 mt-2 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                <div>
                    <div>{getText('error')}: {error}</div>
                </div>
            </div>
        );
    }

    return null;
};