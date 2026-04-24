import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { CookieConsentContext } from '@/context/cookie-consent-context';

export const CookieConsent: React.FC = () => {
    const { consentGiven, setConsent } = useContext(CookieConsentContext);

    if (consentGiven === true) return null;

    if (consentGiven === false) {
        return (
            <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Cookies Required</h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                    This application requires essential cookies to function correctly (such as keeping you logged in). You can choose to allow analytics cookies or proceed with essential cookies only.
                </p>
                <div className="flex gap-4">
                    <Button variant="default" onClick={() => setConsent(true, true)}>
                        Accept All
                    </Button>
                    <Button variant="outline" onClick={() => setConsent(true, false)}>
                        Essential Only
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card text-card-foreground p-4 rounded-lg shadow-lg border border-border max-w-md w-full flex flex-col items-center z-50">
            <p className="mb-4 text-sm text-center text-muted-foreground">
                We use cookies to improve your experience and analyze site traffic. We do not sell your personal information. By clicking "Accept All", you consent to our use of cookies.
            </p>
            <div className="flex gap-3 w-full justify-center">
                <Button variant="default" onClick={() => setConsent(true, true)}>
                    Accept All
                </Button>
                <Button variant="outline" onClick={() => setConsent(true, false)}>
                    Essential Only
                </Button>
            </div>
        </div>
    );
};
