import '../App.css'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Product } from './admin-product-card'

function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await axios.get('/api/shop/featured');
                setFeaturedProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch featured products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeatured();
    }, [])


    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative py-20 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center bg-muted/50 border-b border-border transition-colors duration-300">
                <div className="max-w-3xl space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
                        Quality Products for <span className="text-muted-foreground">Lorem Ipsum</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </p>
                    <div className="pt-4">
                        <Link to="/shop">
                            <Button className="text-lg px-8 py-6 transition-all duration-300">
                                Shop Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 px-6 md:px-12 lg:px-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-foreground">Featured Collection</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading featured products...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {featuredProducts.length > 0 ? featuredProducts.map((product) => (
                            <Card key={product.id} className="bg-card border-border overflow-hidden hover:border-accent transition-colors duration-300 shadow-sm flex flex-col">
                                <div className="aspect-video w-full overflow-hidden bg-muted">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 dark:invert"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-card-foreground text-xl line-clamp-1" title={product.name}>{product.name}</CardTitle>
                                    <CardDescription className="text-muted-foreground">${product.price.toFixed(2)}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground text-sm line-clamp-3">
                                        {product.description}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link to={`/shop`} className="w-full">
                                        <Button variant="outline" className="w-full border-input bg-transparent text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                            View in Shop
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )) : (
                            <div className="col-span-full text-center text-muted-foreground">
                                No featured products currently available.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Features/Benefits Section (Optional Middle) */}
            <section className="py-16 bg-muted/30 border-y border-border transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="h-12 w-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">🚛</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Fast Shipping</h3>
                        <p className="text-muted-foreground">Duis aute irure dolor in reprehenderit.</p>
                    </div>
                    <div className="p-6">
                        <div className="h-12 w-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">🛡️</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Secure Payment</h3>
                        <p className="text-muted-foreground">Excepteur sint occaecat cupidatat non proident.</p>
                    </div>
                    <div className="p-6">
                        <div className="h-12 w-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">✨</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Top Quality</h3>
                        <p className="text-muted-foreground">Sunt in culpa qui officia deserunt mollit.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 bg-muted text-muted-foreground text-center text-sm border-t border-border transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left">
                    <div>
                        <h4 className="text-foreground font-bold mb-4">Shop</h4>
                        <ul className="space-y-2">
                            <li>All Products</li>
                            <li>Featured</li>
                            <li>New Arrivals</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-foreground font-bold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>FAQ</li>
                            <li>Shipping</li>
                            <li>Returns</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-foreground font-bold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                            <li>Careers</li>
                            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-foreground font-bold mb-4">Connect</h4>
                        <ul className="space-y-2">
                            <li>Twitter</li>
                            <li>Instagram</li>
                            <li>Facebook</li>
                        </ul>
                    </div>
                </div>
                <p>&copy; {new Date().getFullYear()} Lorem Ipsum Store. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default HomePage
