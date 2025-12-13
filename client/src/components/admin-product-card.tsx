
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Trash2, Edit } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export interface Product {
    id: number
    name: string
    description: string
    image_url: string
    price: number
    stock_quantity: number
    featured: boolean
    sale_price: number
    on_sale: boolean
}

import { ProductDialog } from "./product-dialog"
import { Star } from "lucide-react"

interface AdminProductCardProps {
    product: Product
    handleDeleteProduct: (product: Product) => void
    handleSaveProduct: (event: React.FormEvent<HTMLFormElement>, product?: Product) => Promise<boolean>
    error?: string
}

export default function AdminProductCard({ product, handleDeleteProduct, handleSaveProduct, error }: AdminProductCardProps) {
    return (
        <Card className="flex flex-col h-full bg-card border-border overflow-hidden group hover:border-accent transition-colors duration-200">
            <div className="aspect-video w-full overflow-hidden bg-muted relative">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                    <div className="bg-black/75 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                        Stock: {product.stock_quantity}
                    </div>
                    {product.featured && (
                        <div className="bg-yellow-500/90 text-white p-1 rounded-md backdrop-blur-sm" title="Featured Product">
                            <Star className="w-3 h-3 fill-current" />
                        </div>
                    )}
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1" title={product.name}>
                        {product.name}
                    </CardTitle>
                    <span className="font-bold text-primary shrink-0">
                        ${product.price.toFixed(2)}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <ProductDialog
                    product={product}
                    handleSaveProduct={handleSaveProduct}
                    error={error}
                    trigger={
                        <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    }
                />

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <span className="font-semibold text-foreground">{product.name}</span>?
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}
