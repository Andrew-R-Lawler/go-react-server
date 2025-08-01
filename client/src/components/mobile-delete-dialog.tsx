import '../App.css'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type MobileDeleteDialogProps = {
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

function MobileDeleteDialog({ handleDeleteProduct, product }: MobileDeleteDialogProps) {

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    className="bg-stone-900 text-white border-none p-2 mt-2 w-full"
                    aria-label={`Delete`}
                >
                    Delete Product
                </button>
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

export default MobileDeleteDialog
