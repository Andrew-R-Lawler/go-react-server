import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { SEO } from './seo'

import { Product } from '@/types'

function NewArrivals() {
    const navigate = useNavigate()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { addToCart } = useCart()

    const fetchNewArrivals = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get('/api/shop/new-arrivals')
            if (Array.isArray(response.data)) {
                setProducts(response.data)
            } else {
                console.error("Received unexpected data format:", response.data);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching new arrivals:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNewArrivals()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO 
                title="New Arrivals" 
                description="Explore the latest additions to our natural skincare collection. Fresh artisan soaps and botanical blends, just in."
            />
            {/* Hero Header */}
            <div className="bg-muted py-8 mb-8 animate-in fade-in duration-700">
                <div className="max-w-7xl mx-auto px-4 mb-4">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">New Arrivals</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Discover the latest additions to our collection. The freshest styles, just for you.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pb-16">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-muted-foreground">No new arrivals yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">Check back soon for updates!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => {
                            const mainImage = (product.images && product.images.length > 0) ? product.images[0] + `?t=${Date.now()}` : null;
                            return (
                                <Card key={product.id} className="flex flex-col h-full bg-card border-border overflow-hidden hover:border-accent transition-all duration-300 shadow-sm group pt-0">
                                    <Link to={`/product/${product.id}`} className="block h-full">
                                        <div className="aspect-square relative overflow-hidden bg-muted">
                                            {mainImage ? (
                                                <img
                                                    src={mainImage}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                                NEW
                                            </div>
                                        </div>
                                    </Link>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-xl line-clamp-1">{product.name}</CardTitle>
                                            <span className="font-bold text-lg shrink-0">
                                                {product.on_sale ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-green-500">${product.sale_price.toFixed(2)}</span>
                                                        <span className="text-sm line-through text-muted-foreground">${product.price.toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">${product.price.toFixed(2)}</span>
                                                )}
                                            </span>
                                        </div>
                                        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                            {product.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardFooter className="mt-auto pt-4">
                                        <Button className="w-full gap-2 group-hover:bg-primary/90" onClick={() => addToCart(product)}>
                                            <ShoppingCart className="h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

export default NewArrivals
