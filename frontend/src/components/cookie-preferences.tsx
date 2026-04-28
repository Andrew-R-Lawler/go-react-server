import { useContext, useState, useEffect } from 'react'
import { CookieConsentContext } from '@/context/cookie-consent-context'
import { Button } from '@/components/ui/button'
import { SEO } from './seo'
import { Switch } from '@/components/ui/switch'
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function CookiePreferences() {
    const { analyticsConsent, setConsent } = useContext(CookieConsentContext)
    const [localAnalyticsConsent, setLocalAnalyticsConsent] = useState<boolean>(analyticsConsent === true)
    const [savedMessage, setSavedMessage] = useState<string | null>(null)
    const navigate = useNavigate()

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
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO 
                title="Privacy & Tracking Preferences" 
                description="Manage your privacy preferences and opt-out of analytics."
            />
            {/* Hero Section */}
            <div className="bg-muted py-8 md:py-16 animate-in fade-in duration-700">
                <div className="max-w-7xl mx-auto px-6 mb-8">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Privacy & Tracking Preferences</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        We use essential cookies to ensure our website functions correctly. We also use cookieless tracking to analyze our traffic. You can manage your preferences below.
                    </p>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 py-16 space-y-8">

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
                            <h3 className="text-lg font-semibold mb-1">Analytics Tracking (Matomo)</h3>
                            <p className="text-sm text-muted-foreground">
                                We use cookieless tracking to count visits and traffic sources so we can measure and improve the performance of our site. It helps us to know which pages are the most and least popular without storing personal cookies on your device.
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
                        Accept All Tracking
                    </Button>
                    {savedMessage && (
                        <span className="text-green-500 text-sm animate-in fade-in duration-300">
                            {savedMessage}
                        </span>
                    )}
                </div>
            </main>
        </div>
    )
}
