import '../App.css'
import { Link } from 'react-router-dom'

import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Product } from '@/types'
import { Footer } from './footer'

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
                        Quality Products for <span className="text-muted-foreground">Radiant Skin</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground">
                        Discover our collection of handcrafted, eco-friendly soaps. Made with natural ingredients to nourish your skin and protect our planet.
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
            <section id="featured" className="py-16 px-6 md:px-12 lg:px-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-foreground">Featured Collection</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Explore our latest creations, carefully blended for the season to bring you fresh, revitalizing botanical nourishment.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading featured products...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {featuredProducts.length > 0 ? featuredProducts.map((product) => {
                            const mainImage = (product.images && product.images.length > 0) ? product.images[0] + `?t=${Date.now()}` : null;
                            return (
                                <Card key={product.id} className="bg-card border-border overflow-hidden hover:border-accent transition-colors duration-300 shadow-sm flex flex-col pt-0">
                                    <Link to={`/product/${product.id}`} className="block cursor-pointer">
                                        <div className="aspect-video w-full overflow-hidden bg-muted">
                                            {mainImage ? (
                                                <img
                                                    src={mainImage}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                                            )}
                                        </div>
                                    </Link>
                                    <CardHeader>
                                        <Link to={`/product/${product.id}`} className="block cursor-pointer">
                                            <CardTitle className="text-card-foreground text-xl line-clamp-1 hover:underline" title={product.name}>{product.name}</CardTitle>
                                        </Link>
                                        <CardDescription className="text-muted-foreground">
                                            {product.on_sale ? (
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-green-500 font-bold">${product.sale_price.toFixed(2)}</span>
                                                    <span className="text-xs line-through text-muted-foreground">${product.price.toFixed(2)}</span>
                                                </div>
                                            ) : (
                                                <span>${product.price.toFixed(2)}</span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground text-sm line-clamp-3">
                                            {product.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Link to={`/product/${product.id}`} className="w-full">
                                            <Button variant="outline" className="w-full border-input bg-transparent text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                                View Details
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            )
                        }) : (
                            <div className="col-span-full text-center text-muted-foreground">
                                No featured products currently available.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Content Showcase Section */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-background border-t border-border transition-colors duration-300">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Discover Our Philosophy</h2>
                        <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                            <p>
                                At Eco Theory, we believe that true beauty begins with the earth. Our journey started with a simple mission: to craft luxurious, deeply nourishing soaps without compromising our commitment to the environment. Every bar is a testament to our dedication to organic farming, sustainable sourcing, and cruelty-free practices.
                            </p>
                            <p>
                                We carefully select the finest botanical extracts, essential oils, and mineral-rich clays to create blends that not only cleanse but rejuvenate your skin and spirit. By eliminating harsh chemicals and synthetic fragrances, we ensure that what washes down your drain is as gentle on the earth as it is on your body.
                            </p>
                            <p>
                                Join us in our movement towards a cleaner, more sustainable future. With packaging that is 100% biodegradable and processes designed to minimize our carbon footprint, Eco Theory is more than just skincare—it is a promise to preserve the natural harmony of our shared world.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link to="/about">
                                <Button variant="outline" className="text-lg px-8 py-6">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative h-[400px] lg:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-border">
                        <img
                            src="/assets/home_showcase.png"
                            alt="Workspace Showcase"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                        />
                    </div>
                </div>
            </section>

            {/* Features/Benefits Section (Optional Middle) */}
            <section className="py-16 bg-muted/30 border-y border-border transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="h-12 w-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">🚛</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Fast Shipping</h3>
                        <p className="text-muted-foreground">Eco-friendly, carbon-neutral shipping straight to your door.</p>
                    </div>
                    <div className="p-6">
                        <div className="h-12 w-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">🛡️</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Secure Payment</h3>
                        <p className="text-muted-foreground">Complete peace of mind with our safe and encrypted checkout.</p>
                    </div>
                    <div className="p-6">
                        <div className="h-12 w-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">✨</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Top Quality</h3>
                        <p className="text-muted-foreground">Every product is quality checked for purity and performance.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default HomePage
