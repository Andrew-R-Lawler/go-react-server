import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { CookieConsentContext } from '@/context/cookie-consent-context';

export const CookieConsent: React.FC = () => {
    const { consentGiven, setConsent } = useContext(CookieConsentContext);

    if (consentGiven === true) return null;

    if (consentGiven === false) {
        return (
            <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                    You have rejected cookies. This application uses cookies to function and cannot be used without them.
                </p>
                <Button variant="default" onClick={() => setConsent(true)}>
                    Accept Cookies & Continue
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card text-card-foreground p-4 rounded-lg shadow-lg border border-border max-w-md w-full flex flex-col items-center">
            <p className="mb-2 text-center">
                We use cookies to improve your experience. We do not sell any of your personal information. By clicking Accept, you consent to the use of cookies.
            </p>
            <div className="flex gap-4">
                <Button variant="default" onClick={() => setConsent(true)}>
                    Accept
                </Button>
                <Button variant="destructive" onClick={() => setConsent(false)}>
                    Reject
                </Button>
            </div>
        </div>
    );
};
