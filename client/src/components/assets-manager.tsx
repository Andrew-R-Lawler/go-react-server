
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Trash2, Upload, Copy, Check, FileImage } from "lucide-react"

interface Asset {
    name: string
    url: string
    size: number
    mod_time: string
}

export default function AssetsManager() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchAssets()
    }, [])

    const fetchAssets = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/protected/assets', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAssets(response.data || [])
        } catch (err) {
            console.error("Failed to fetch assets:", err)
            setError("Failed to load assets. Ensure you are logged in as admin.")
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = (url: string, name: string) => {
        navigator.clipboard.writeText(url)
        setCopiedId(name)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}? This cannot be undone.`)) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`/api/protected/assets/${filename}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchAssets() // Refresh list
        } catch (err) {
            console.error("Failed to delete asset:", err)
            setError("Could not delete the file.")
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        try {
            setUploading(true)
            const token = localStorage.getItem('token')
            await axios.post('/api/protected/assets/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            fetchAssets()
        } catch (err) {
            console.error("Upload failed:", err)
            setError("Could not upload the file.")
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assets Manager</h1>
                    <p className="text-muted-foreground mt-2">Manage your server's image assets.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button onClick={handleUploadClick} disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {assets.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No assets found. Upload one to get started.</p>
                        </div>
                    ) : (
                        assets.map((asset) => (
                            <Card key={asset.name} className="overflow-hidden group hover:shadow-md transition-all">
                                <div className="aspect-square relative bg-muted/30">
                                    <img
                                        src={`${asset.url}?t=${Date.now()}`} // Cache bust preview
                                        alt={asset.name}
                                        className="w-full h-full object-contain p-2"
                                        loading="lazy"
                                    />
                                </div>
                                <CardContent className="p-3">
                                    <h3 className="font-medium text-sm truncate" title={asset.name}>{asset.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{formatSize(asset.size)}</p>
                                </CardContent>
                                <CardFooter className="p-3 pt-0 flex justify-between gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 h-8 text-xs"
                                        onClick={() => handleCopy(asset.url, asset.name)}
                                    >
                                        {copiedId === asset.name ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                        {copiedId === asset.name ? "Copied" : "Copy URL"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(asset.name)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
