import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"

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

function Shop() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { addToCart } = useCart()

    const fetchProducts = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get('/api/shop/products')
            setProducts(response.data)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Hero Header */}
            <div className="bg-muted py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Our Collection</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Explore our premium selection of products, curated just for you.
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
                        <p className="text-xl text-muted-foreground">No products available at the moment.</p>
                        <p className="text-sm text-muted-foreground mt-2">Please check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <Card key={product.id} className="flex flex-col h-full bg-card border-border overflow-hidden hover:border-accent transition-all duration-300 shadow-sm group">
                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="aspect-square relative overflow-hidden bg-muted">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">{product.name}</CardTitle>
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
                                </Link>
                                <CardFooter className="mt-auto pt-4">
                                    <Button className="w-full gap-2 group-hover:bg-primary/90" onClick={() => addToCart(product)}>
                                        <ShoppingCart className="h-4 w-4" />
                                        Add to Cart
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Shop
