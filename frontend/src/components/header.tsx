import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { useCart } from "@/context/cart-context"
import { ShoppingBag } from "lucide-react"
import logo from "@/assets/image2vector.svg"

interface HeaderProps {
    user: {
        id: number;
        email: string;
        admin: boolean;
        verified: boolean;
    } | null;
    signOut: () => void;
}

export function Header({ user, signOut }: HeaderProps) {
    const { setIsOpen, cartCount } = useCart()

    return (
        <nav className='sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1 px-4 border-b border-border shadow-sm transition-colors duration-300'>
            <ul className='flex justify-end items-center gap-6 max-w-7xl mx-auto'>
                <li className='mr-auto'>
                    <Link to="/">
                        <img src={logo} width="65" height="65" alt="Logo" className="hover:opacity-80 transition-opacity dark:invert" />
                    </Link>
                </li >
                <li>
                    <Link to="/shop" className='hover:text-muted-foreground transition-colors'>Shop</Link>
                </li>
                {
                    user &&
                    <>
                        <li>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost">
                                        Account
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card border-border">
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                            My Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    {user.verified && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/orders" className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                                My Orders
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user.admin && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/manage-products" className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                                Manage Products
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user.admin && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/manage-assets" className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                                Manage Assets
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {user.admin && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/order-fulfillment" className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                                Order Fulfillment
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10">
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </li>
                    </>
                }
                {
                    !user &&
                    <>
                        <li>
                            <Button variant="outline" className="bg-transparent border-input hover:bg-accent hover:text-accent-foreground transition-colors">
                                <Link to="/login">Login</Link>
                            </Button>
                        </li>
                    </>
                }
                <li>
                    <ModeToggle />
                </li>

                <li>
                    <Button variant="ghost" size="icon" className="relative text-foreground" onClick={() => setIsOpen(true)}>
                        <ShoppingBag className="h-[1.2rem] w-[1.2rem]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {cartCount}
                            </span>
                        )}
                        <span className="sr-only">Open cart</span>
                    </Button>
                </li>
            </ul >
        </nav >
    )
}
