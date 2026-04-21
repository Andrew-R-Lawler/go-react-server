import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="py-10 bg-muted text-muted-foreground text-center text-sm border-t border-border transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left">
                <div>
                    <h4 className="text-foreground font-bold mb-4">Shop</h4>
                    <ul className="space-y-2">
                        <li><Link to="/shop" className="hover:text-foreground transition-colors">All Products</Link></li>
                        <li><a href="#featured" className="hover:text-foreground transition-colors">Featured</a></li>
                        <li><Link to="/new-arrivals" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-foreground font-bold mb-4">Support</h4>
                    <ul className="space-y-2">
                        <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                        <li><Link to="/returns" className="hover:text-foreground transition-colors">Returns</Link></li>
                        <li><Link to="/shipping" className="hover:text-foreground transition-colors">Shipping</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-foreground font-bold mb-4">Company</h4>
                    <ul className="space-y-2">
                        <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        <li><Link to="/manage-products" className="hover:text-primary transition-colors text-muted-foreground">Admin</Link></li>
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
            <p>&copy; {new Date().getFullYear()} Eco Theory Soap Co. All rights reserved.</p>
        </footer>
    )
}
