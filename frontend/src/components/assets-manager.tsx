
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
                            <Card key={asset.name} className="flex flex-col h-full bg-card border-border overflow-hidden hover:border-accent transition-all duration-300 shadow-sm group pt-0 gap-2">
                                <div className="aspect-square relative overflow-hidden bg-muted">
                                    <img
                                        src={`${asset.url}?t=${Date.now()}`} // Cache bust preview
                                        alt={asset.name}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                        onError={(e) => {
                                            console.error(`Failed to load image: ${asset.url}`)
                                            const target = e.currentTarget
                                            target.style.display = 'none'
                                            const parent = target.parentElement
                                            if (parent && !parent.querySelector('.img-error')) {
                                                const err = document.createElement('div')
                                                err.className = 'img-error absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-2 gap-1'
                                                err.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-40 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>Image not found</span><span class="opacity-60 break-all">${asset.url}</span>`
                                                parent.appendChild(err)
                                            }
                                        }}
                                    />
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors" title={asset.name}>{asset.name}</CardTitle>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{formatSize(asset.size)}</p>
                                </CardHeader>
                                <CardFooter className="mt-auto pt-0 pb-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm" // Keeping small to fit two buttons
                                        className="flex-1"
                                        onClick={() => handleCopy(asset.url, asset.name)}
                                    >
                                        {copiedId === asset.name ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                                        {copiedId === asset.name ? "Copied" : "Copy"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-9 w-9 shrink-0"
                                        onClick={() => handleDelete(asset.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
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
