import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface CookieConsentContextProps {
    consentGiven: boolean | null;
    setConsent: (value: boolean) => void;
}

export const CookieConsentContext = createContext<CookieConsentContextProps>({
    consentGiven: null,
    setConsent: () => { }
});

interface ProviderProps {
    children: ReactNode;
}

export const CookieConsentProvider: React.FC<ProviderProps> = ({ children }) => {
    const [consentGiven, setConsentGiven] = useState<boolean | null>(() => {
        // Check if the actual cookie exists
        const cookieExists = document.cookie.split(';').some((item) => item.trim().startsWith('cookie_consent='));

        const stored = localStorage.getItem('cookieConsent');

        // If the cookie is missing but localStorage has a value, it means the cookie was deleted manually or expired.
        // In this case, we should reset the state to null (ask for consent again) and clear localStorage.
        if (!cookieExists && stored) {
            localStorage.removeItem('cookieConsent');
            return null;
        }

        if (stored === 'true') return true;
        if (stored === 'false') return false;
        return null;
    });

    useEffect(() => {
        // Double check or handle side effects if needed, but primary initialization is in useState
    }, []);

    const setConsent = (value: boolean) => {
        // Store in localStorage for UI persistence
        localStorage.setItem('cookieConsent', value.toString());
        setConsentGiven(value);
        // Set a cookie for server-side checks (expires in 1 year)
        const cookieValue = value ? 'true' : 'false';
        document.cookie = `cookie_consent=${cookieValue}; path=/; max-age=31536000`;
    };

    return (
        <CookieConsentContext.Provider value={{ consentGiven, setConsent }}>
            {children}
        </CookieConsentContext.Provider>
    );
};
