
import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
    isSubscribed: boolean;
    daysRemaining: number;
    expiryDate: number;
    loading: boolean;
    checkSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: PropsWithChildren<{}>) => {
    const { user, isLoading: authLoading } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);
    const [expiryDate, setExpiryDate] = useState(0);
    const [loading, setLoading] = useState(true);

    const checkSubscription = () => {
        if (!db) return;

        // Se for o Breno, acesso liberado eternamente
        if (user?.username === 'Breno') {
            setIsSubscribed(true);
            setDaysRemaining(999);
            setLoading(false);
            return;
        }

        const subRef = db.ref('system_settings/subscription_expiry');
        subRef.on('value', (snapshot) => {
            const expiry = snapshot.val() || 0;
            const now = Date.now();
            const msPerDay = 1000 * 60 * 60 * 24;
            const remaining = Math.ceil((expiry - now) / msPerDay);
            
            setExpiryDate(expiry);
            setDaysRemaining(remaining);
            setIsSubscribed(now < expiry);
            setLoading(false);
        });

        return () => subRef.off();
    };

    useEffect(() => {
        if (!authLoading) {
            const cleanup = checkSubscription();
            return cleanup;
        }
    }, [user, authLoading]);

    return (
        <SubscriptionContext.Provider value={{ isSubscribed, daysRemaining, expiryDate, loading, checkSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription deve ser usado dentro de um SubscriptionProvider');
    }
    return context;
};
