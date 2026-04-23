
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { RichTextEditor } from "./rich-text-editor"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Product, ProductSKU } from "@/types"
import { AssetPicker } from "./asset-picker"
import { Image as ImageIcon } from "lucide-react"

interface ProductDialogProps {
    handleSaveProduct: (event: React.FormEvent<HTMLFormElement>, product?: Product) => Promise<boolean>
    isLoading?: boolean
    error?: string
    product?: Product // If provided, we are in "Edit" mode
    trigger?: React.ReactNode // Custom trigger button
}

export function ProductDialog({ handleSaveProduct, isLoading = false, error, product, trigger }: ProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)
    const [imageUrls, setImageUrls] = useState<string[]>([''])
    const [pickerOpen, setPickerOpen] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
    const [skus, setSkus] = useState<ProductSKU[]>([])
    const [longDescription, setLongDescription] = useState("")

    // Initialize images when product changes or dialog opens
    useEffect(() => {
        if (open) {
            if (product) {
                if (product.images && product.images.length > 0) {
                    setImageUrls(product.images)

                } else {
                    setImageUrls([''])
                }
                if (product.skus) {
                    setSkus(product.skus)
                } else {
                    setSkus([])
                }
                setLongDescription(product.long_description || "")
            } else {
                setSkus([])
                setImageUrls([''])
                setLongDescription("")
            }
        }
    }, [product, open])

    const totalStock = skus.reduce((acc, sku) => acc + (Number(sku.stock_quantity) || 0), 0)

    const addSku = () => {
        setSkus([...skus, { sku: '', variant_name: '', stock_quantity: 0 }])
    }

    const removeSku = (index: number) => {
        const newSkus = [...skus]
        newSkus.splice(index, 1)
        setSkus(newSkus)
    }

    const updateSku = (index: number, field: keyof ProductSKU, value: string | number) => {
        const newSkus = [...skus]
        newSkus[index] = { ...newSkus[index], [field]: value }
        setSkus(newSkus)
    }

    const addImageUrl = () => setImageUrls([...imageUrls, ''])

    const removeImageUrl = (index: number) => {
        const newUrls = [...imageUrls]
        newUrls.splice(index, 1)
        setImageUrls(newUrls)
    }

    const updateImageUrl = (index: number, value: string) => {
        const newUrls = [...imageUrls]
        newUrls[index] = value
        setImageUrls(newUrls)
    }

    const openPicker = (index: number) => {
        setActiveImageIndex(index)
        setPickerOpen(true)
    }

    const handleAssetSelect = (url: string) => {
        if (activeImageIndex !== null) {
            updateImageUrl(activeImageIndex, url)
        }
    }

    // Sync external error to local state when it changes
    useEffect(() => {
        if (error) {
            setLocalError(error)
        }
    }, [error])

    // Reset error when opening
    useEffect(() => {
        if (open) {
            setLocalError(null)
        }
    }, [open])

    const onSubmitWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        const success = await handleSaveProduct(e, product) // Parent prevents default and handles API
        if (success) {
            setOpen(false)
        }
    }

    const isEditMode = !!product

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <form onSubmit={onSubmitWrapper}>
                    <input type="hidden" name="skus" value={JSON.stringify(skus)} />
                    <input type="hidden" name="long-description" value={longDescription} />
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? "Update the product details below."
                                : "Fill in the details below to add a new product to the catalog."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {localError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{localError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Product Name"
                                    defaultValue={product?.name}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    defaultValue={product?.price}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Product Images</Label>
                            <div className="space-y-2">
                                {imageUrls.map((url, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <Input
                                                name="images"
                                                value={url}
                                                onChange={(e) => updateImageUrl(index, e.target.value)}
                                                placeholder={`Select an image...`}
                                                disabled={isLoading}
                                                className="pr-24" // Make room for select button
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="absolute right-1 top-1 h-7 text-xs"
                                                onClick={() => openPicker(index)}
                                                disabled={isLoading}
                                            >
                                                <ImageIcon className="h-3 w-3 mr-1" />
                                                Select
                                            </Button>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeImageUrl(index)}
                                            disabled={isLoading || imageUrls.length === 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addImageUrl}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Image
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Short Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Brief summary for product card..."
                                defaultValue={product?.description}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="long-description">Long Description</Label>
                            <RichTextEditor
                                value={longDescription}
                                onChange={setLongDescription}
                                placeholder="Detailed description for product page..."
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock-quantity">Stock Quantity</Label>
                                <Input
                                    id="stock-quantity"
                                    name="stock-quantity"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    defaultValue={product?.stock_quantity}
                                    required
                                    disabled={isLoading || skus.length > 0}
                                    value={skus.length > 0 ? totalStock : undefined}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="featured">Featured</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="featured" name="featured" defaultChecked={product?.featured} disabled={isLoading} />
                                    <label
                                        htmlFor="featured"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Show on Homepage
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sale-price">Sale Price ($)</Label>
                                <Input
                                    id="sale-price"
                                    name="sale-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    defaultValue={product?.sale_price}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="on-sale">On Sale</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="on-sale" name="on-sale" defaultChecked={product?.on_sale} disabled={isLoading} />
                                    <label
                                        htmlFor="on-sale"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Active Sale
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SKU Management */}
                    <div className="space-y-2 border p-4 rounded-md">
                        <Label>Variants / SKUs</Label>
                        {skus.map((sku, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2 mb-2">
                                <div className="col-span-4">
                                    <Label className="text-xs">SKU Code</Label>
                                    <Input
                                        value={sku.sku}
                                        onChange={(e) => updateSku(index, 'sku', e.target.value)}
                                        placeholder="e.g. TSHIRT-S"
                                        required
                                    />
                                </div>
                                <div className="col-span-4">
                                    <Label className="text-xs">Variant Name</Label>
                                    <Input
                                        value={sku.variant_name}
                                        onChange={(e) => updateSku(index, 'variant_name', e.target.value)}
                                        placeholder="e.g. Small"
                                        required
                                    />
                                </div>
                                <div className="col-span-3">
                                    <Label className="text-xs">Stock</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={sku.stock_quantity}
                                        onChange={(e) => updateSku(index, 'stock_quantity', Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => removeSku(index)}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSku}
                            className="gap-2 w-full"
                        >
                            <Plus className="h-4 w-4" />
                            Add Variant
                        </Button>
                    </div>


                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Add Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            <AssetPicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onSelect={handleAssetSelect}
            />
        </Dialog >
    )
}
