import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"

export default function Profile() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: ""
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("/api/protected/profile", { withCredentials: true })
                if (res.status === 200) {
                    setProfile({
                        first_name: res.data.first_name || "",
                        last_name: res.data.last_name || "",
                        phone: res.data.phone || "",
                        address_line1: res.data.address_line1 || "",
                        address_line2: res.data.address_line2 || "",
                        city: res.data.city || "",
                        state: res.data.state || "",
                        postal_code: res.data.postal_code || "",
                        country: res.data.country || ""
                    })
                }
            } catch (err) {
                console.error("Failed to load profile:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)
        try {
            await axios.put("/api/protected/profile", profile, { withCredentials: true })
            setMessage({ text: "Profile updated successfully! PII encryption enabled.", type: 'success' })
        } catch (err) {
            setMessage({ text: "Failed to update profile.", type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your profile and shipping details for a faster checkout experience. 
                        Sensitive identity data is securely encrypted at rest.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>This information will be used to automatically identify your orders.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" name="first_name" value={profile.first_name} onChange={handleChange} placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" name="last_name" value={profile.last_name} onChange={handleChange} placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2 max-w-sm">
                                <Label htmlFor="phone">Phone Number (Encrypted)</Label>
                                <Input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} placeholder="(555) 123-4567" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border mt-8">
                        <CardHeader>
                            <CardTitle>Default Shipping Address</CardTitle>
                            <CardDescription>Your address data is encrypted natively within our database.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address_line1">Address Line 1</Label>
                                <Input id="address_line1" name="address_line1" value={profile.address_line1} onChange={handleChange} placeholder="123 Main St" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                                <Input id="address_line2" name="address_line2" value={profile.address_line2} onChange={handleChange} placeholder="Apt 4B" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" value={profile.city} onChange={handleChange} placeholder="San Francisco" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State / Province</Label>
                                    <Input id="state" name="state" value={profile.state} onChange={handleChange} placeholder="CA" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code / ZIP</Label>
                                    <Input id="postal_code" name="postal_code" value={profile.postal_code} onChange={handleChange} placeholder="94105" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" name="country" value={profile.country} onChange={handleChange} placeholder="US" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 flex items-center justify-between">
                        {message ? (
                            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                {message.text}
                            </p>
                        ) : <div></div>}
                        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                            {isSaving ? "Saving..." : "Save Profile"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
