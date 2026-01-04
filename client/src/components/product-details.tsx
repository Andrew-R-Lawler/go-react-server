import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Separator } from "@/components/ui/separator"

interface Product {
    id: number
    name: string
    description: string
    image_url: string
    price: number
    stock_quantity: number
    on_sale: boolean
    sale_price: number
    long_description?: string
}

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const { addToCart } = useCart()
    const navigate = useNavigate()

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
                <div className="rounded-xl overflow-hidden bg-muted border border-border aspect-square relative shadow-lg">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                            No Image
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

                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {product.long_description || product.description || "No description available."}
                        </p>
                    </div>

                    <div className="mt-auto">
                        <Button size="lg" className="w-full md:w-auto gap-2 text-lg h-12 px-8" onClick={() => addToCart(product)}>
                            <ShoppingCart className="h-5 w-5" />
                            Add to Cart
                        </Button>
                        {product.stock_quantity < 10 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Only {product.stock_quantity} left in stock!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
