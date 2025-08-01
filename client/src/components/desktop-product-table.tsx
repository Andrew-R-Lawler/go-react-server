import '../App.css'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from './ui/button';
import { Trash2 } from "lucide-react"
import DesktopPopover from './desktop-popover';

type DesktopProductTableProps = {
    handleDeleteProduct: (product: Product) => void
    fetchProducts: () => void
    products: Product[]
}

type Product = {
        id: number
        name: string
        description: string
        image_url: string
        price: number
        stock_quantity: number
}

function DesktopProductTable({products, handleDeleteProduct, fetchProducts}: DesktopProductTableProps) {

    return (
        <Table className='bg-stone-700 rounded-lg m-auto w-auto text-white'>
            <TableHeader>
                <TableRow className='p-2 m-2 bg-stone-800 rounded-lg'>
                    <TableHead className='text-white'>Product Name</TableHead>
                    <TableHead className='text-white'>Image URL</TableHead>
                    <TableHead className='text-white'>Description</TableHead>
                    <TableHead className='text-white'>Price</TableHead>
                    <TableHead className='text-white'>Stock Quantity</TableHead>
                    <TableHead className='text-white'>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product) => (
                    <TableRow>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.image_url}</TableCell>
                        <TableCell className='break-words max-w-[350px] whitespace-normal'>{product.description}</TableCell>
                        <TableCell>{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                                <DesktopPopover product={product} fetchProducts={fetchProducts} />
                                <Button
                                    className="bg-stone-900 text-white border-none p-2 w-8 h-8"
                                    aria-label={`Delete`}
                                    onClick={() => handleDeleteProduct(product)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default DesktopProductTable
