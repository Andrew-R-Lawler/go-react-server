import '../App.css'
import { Trash2 } from "lucide-react"
import { Button } from './ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type DesktopDeleteDialogProps = {
    handleDeleteProduct: (product: Product) => void
    product: Product
}

type Product = {
    id: number
    name: string
    description: string
    image_url: string
    price: number
    stock_quantity: number
}

function DesktopDeleteDialog({ handleDeleteProduct, product }: DesktopDeleteDialogProps) {

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className="bg-stone-900 text-white border-none p-2 w-8 h-8"
                    aria-label={`Delete`}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='bg-stone-800 text-white'>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this product from the store.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className='text-white'>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteProduct(product)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DesktopDeleteDialog
