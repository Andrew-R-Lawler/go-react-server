
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface Asset {
    name: string
    url: string
}

interface AssetPickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (url: string) => void
}

export function AssetPicker({ open, onOpenChange, onSelect }: AssetPickerProps) {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            fetchAssets()
        }
    }, [open])

    const fetchAssets = async () => {
        try {
            setLoading(true)
            setError(null)
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/protected/assets', {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Filter is already done on backend, but good to be safe if reused elsewhere
            setAssets(response.data || [])
        } catch (err) {
            console.error("Failed to fetch assets:", err)
            setError("Failed to load assets.")
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (url: string) => {
        onSelect(url)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Select an Image</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-center text-destructive p-8">{error}</div>
                ) : assets.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">No assets found. Upload some in the Assets Manager first.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                        {assets.map((asset) => (
                            <div
                                key={asset.name}
                                className="group relative aspect-square cursor-pointer border rounded-lg overflow-hidden hover:border-primary transition-all bg-muted/20"
                                onClick={() => handleSelect(asset.url)}
                            >
                                <img
                                    src={`${asset.url}?t=${Date.now()}`}
                                    alt={asset.name}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
