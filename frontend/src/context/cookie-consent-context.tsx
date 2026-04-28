import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface CookieConsentContextProps {
    consentGiven: boolean | null;
    analyticsConsent: boolean | null;
    setConsent: (essential: boolean, analytics: boolean) => void;
    resetConsent: () => void;
}

export const CookieConsentContext = createContext<CookieConsentContextProps>({
    consentGiven: null,
    analyticsConsent: null,
    setConsent: () => { },
    resetConsent: () => { }
});

interface ProviderProps {
    children: ReactNode;
}

export const CookieConsentProvider: React.FC<ProviderProps> = ({ children }) => {
    const [consentGiven, setConsentGiven] = useState<boolean | null>(() => {
        const cookieExists = document.cookie.split(';').some((item) => item.trim().startsWith('cookie_consent='));
        const stored = localStorage.getItem('cookieConsent');
        if (!cookieExists && stored) {
            localStorage.removeItem('cookieConsent');
            localStorage.removeItem('analyticsConsent');
            return null;
        }
        if (stored === 'true') return true;
        if (stored === 'false') return false;
        return null;
    });

    const [analyticsConsent, setAnalyticsConsent] = useState<boolean | null>(() => {
        const stored = localStorage.getItem('analyticsConsent');
        if (stored === 'true') return true;
        if (stored === 'false') return false;
        return null;
    });

    useEffect(() => {
        // Apply Matomo consent status if window._paq is available
        if ((window as any)._paq) {
            if (analyticsConsent === false) {
                (window as any)._paq.push(['optUserOut']);
            } else if (analyticsConsent === true) {
                (window as any)._paq.push(['forgetUserOptOut']);
            }
        }
    }, [analyticsConsent]);

    const setConsent = (essential: boolean, analytics: boolean) => {
        localStorage.setItem('cookieConsent', essential.toString());
        localStorage.setItem('analyticsConsent', analytics.toString());
        setConsentGiven(essential);
        setAnalyticsConsent(analytics);
        
        const cookieValue = essential ? 'true' : 'false';
        document.cookie = `cookie_consent=${cookieValue}; path=/; max-age=31536000`;
    };

    const resetConsent = () => {
        localStorage.removeItem('cookieConsent');
        localStorage.removeItem('analyticsConsent');
        document.cookie = 'cookie_consent=; path=/; max-age=0';
        setConsentGiven(null);
        setAnalyticsConsent(null);
        if ((window as any)._paq) {
            (window as any)._paq.push(['optUserOut']); // default to opt out when revoked
        }
    };

    return (
        <CookieConsentContext.Provider value={{ consentGiven, analyticsConsent, setConsent, resetConsent }}>
            {children}
        </CookieConsentContext.Provider>
    );
};
