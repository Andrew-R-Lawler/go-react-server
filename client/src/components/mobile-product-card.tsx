import '../App.css'
import MobilePopover from './mobile-popover'
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
                <CardContent>
                    <CardTitle>Price</CardTitle>
                    <p>{product.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className='flex flex-col'>
                    <MobilePopover product={product} fetchProducts={fetchProducts} />
                    <button
                        className="bg-stone-900 text-white border-none p-2 mt-2 w-full"
                        aria-label={`Delete`}
                        onClick={() => handleDeleteProduct(product)}
                    >
                        Delete Product
                    </button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default MobileProductCard
