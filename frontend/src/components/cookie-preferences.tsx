import { useContext, useState, useEffect } from 'react'
import { CookieConsentContext } from '@/context/cookie-consent-context'
import { Button } from '@/components/ui/button'
import { SEO } from './seo'
import { Switch } from '@/components/ui/switch'

export default function CookiePreferences() {
    const { analyticsConsent, setConsent } = useContext(CookieConsentContext)
    const [localAnalyticsConsent, setLocalAnalyticsConsent] = useState<boolean>(analyticsConsent === true)
    const [savedMessage, setSavedMessage] = useState<string | null>(null)

    // Sync local state if context changes
    useEffect(() => {
        setLocalAnalyticsConsent(analyticsConsent === true)
    }, [analyticsConsent])

    const handleSave = (analytics: boolean) => {
        setConsent(true, analytics)
        setSavedMessage("Preferences saved successfully!")
        setTimeout(() => setSavedMessage(null), 3000)
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-12 px-4 md:px-8">
            <SEO 
                title="Cookie Preferences" 
                description="Manage your cookie preferences and opt-out of analytics."
            />
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Cookie Preferences</h1>
                    <p className="text-muted-foreground">
                        We use cookies to ensure our website functions correctly and to analyze our traffic. You can manage your preferences below.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-card border border-border rounded-lg shadow-sm flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Essential Cookies</h3>
                            <p className="text-sm text-muted-foreground">
                                These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.
                            </p>
                        </div>
                        <div className="pt-1">
                            <Switch checked={true} disabled={true} />
                        </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-lg shadow-sm flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Analytics Cookies (Matomo)</h3>
                            <p className="text-sm text-muted-foreground">
                                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
                            </p>
                        </div>
                        <div className="pt-1">
                            <Switch 
                                checked={localAnalyticsConsent} 
                                onCheckedChange={(checked) => setLocalAnalyticsConsent(checked)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <Button onClick={() => handleSave(localAnalyticsConsent)}>
                        Save Preferences
                    </Button>
                    <Button variant="outline" onClick={() => handleSave(true)}>
                        Accept All Cookies
                    </Button>
                    {savedMessage && (
                        <span className="text-green-500 text-sm animate-in fade-in duration-300">
                            {savedMessage}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
