import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Separator } from "@/components/ui/separator"

import { Product, ProductSKU } from "@/types"

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null)
    const [timestamp] = useState(Date.now())
    const [loading, setLoading] = useState(true)
    const { addToCart } = useCart()
    const navigate = useNavigate()

    useEffect(() => {
        if (product) {
            const img = (product.images && product.images.length > 0) ? product.images[0] : '';
            setSelectedImage(img || '')
            if (product.skus && product.skus.length > 0) {
                setSelectedSku(product.skus[0])
            }
        }
    }, [product])

    const displayImages = product ? (product.images && product.images.length > 0 ? product.images : []) : [];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/shop/product/${id}`)
                setProduct(response.data)
            } catch (error) {
                console.error("Failed to fetch product:", error)
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchProduct()
        }
    }, [id])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading product...</div>
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-muted-foreground">Product not found.</p>
                <Link to="/shop">
                    <Button variant="outline">Back to Shop</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <div className="mb-6">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                {/* Product Image */}
                {/* Product Image Gallery */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl overflow-hidden bg-muted border border-border aspect-square relative shadow-lg">
                        {selectedImage ? (
                            <img
                                src={`${selectedImage}?t=${timestamp}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                No Image
                            </div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {displayImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {displayImages.map((img, index) => (
                                <button
                                    key={index}
                                    className={`relative rounded-md overflow-hidden w-20 h-20 flex-shrink-0 border-2 transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img src={`${img}?t=${timestamp}`} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
                        <div className="text-2xl font-semibold">
                            {product.on_sale ? (
                                <div className="flex items-baseline gap-3">
                                    <span className="text-green-500">${product.sale_price.toFixed(2)}</span>
                                    <span className="text-lg line-through text-muted-foreground">${product.price.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span className="text-primary">${product.price.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div 
                        className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: product.long_description || product.description || "No description available." }}
                    />

                    <div className="mt-auto space-y-4">
                        {/* Variant Selector */}
                        {product.skus && product.skus.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-sm font-medium">Variant</span>
                                <div className="flex flex-wrap gap-2">
                                    {product.skus.map((sku) => (
                                        <Button
                                            key={sku.sku}
                                            variant={selectedSku?.sku === sku.sku ? "default" : "outline"}
                                            onClick={() => setSelectedSku(sku)}
                                            className="min-w-[4rem]"
                                        >
                                            {sku.variant_name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button size="lg" className="w-full md:w-auto gap-2 text-lg h-12 px-8" onClick={() => addToCart(product, selectedSku)}>
                            <ShoppingCart className="h-5 w-5" />
                            Add to Cart
                        </Button>

                        {(selectedSku ? selectedSku.stock_quantity : product.stock_quantity) < 10 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Only {selectedSku ? selectedSku.stock_quantity : product.stock_quantity} left in stock!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
