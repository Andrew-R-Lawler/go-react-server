import '../App.css'
import MobilePopover from './mobile-popover'
import MobileDeleteDialog from './mobile-delete-dialog'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card"

type Product = {
        id: number
        name: string
        description: string
        image_url: string
        price: number
        stock_quantity: number
}

type MobileProductcardProps = {
    product: Product
    fetchProducts: () => void
    handleDeleteProduct: (product: Product) => void
}

function MobileProductCard({product, fetchProducts, handleDeleteProduct}: MobileProductcardProps) {

    return (
        <div>
            <Card className='bg-stone-700 text-white m-2 mt-4'>
                <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription className='text-white'>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <CardTitle>Image URL</CardTitle>
                    <a className='link' href={product.image_url}>{product.image_url}</a>
                </CardContent>
                <div className='grid grid-cols-2'>
                <CardContent className='col-span-1'>
                    <CardTitle>Price</CardTitle>
                    <p>{product.price.toFixed(2)}</p>
                </CardContent>
                <CardContent className='col-span-1'>
                    <CardTitle>Stock Quantity</CardTitle>
                    <p>{product.stock_quantity}</p>
                </CardContent>
                </div>
                <CardFooter className='flex flex-col'>
                    <MobilePopover product={product} fetchProducts={fetchProducts} />
                    <MobileDeleteDialog product={product} handleDeleteProduct={handleDeleteProduct} />
                </CardFooter>
            </Card>
        </div>
    )
}

export default MobileProductCard
