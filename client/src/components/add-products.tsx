import '../App.css'
import React, { useState, useEffect } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from './ui/textarea';
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from 'axios'
import { Trash2, Edit2 } from "lucide-react"
import MobilePopover from './mobile-popover'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover"
import { set } from 'react-hook-form';

function AddProducts() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    interface Product {
        id: number
        name: string
        description: string
        image_url: string
        price: number
        stock_quantity: number
    }

    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([]);

    const fetchProducts = async () => {
        const response = await axios.get('/api/shop/products');
        setProducts(response.data)
    }

    const handleDeleteProduct = async (product: Product) => {
        try {
            const response = await axios.delete(`/api/protected/deleteproduct/${product.id}`, { withCredentials: true });
            fetchProducts()
            return response
        } catch (error) {
            console.error('Error deleting product:', error)
        };
    }

    const handleEditProduct = async (event: React.FormEvent<HTMLFormElement>, product: Product) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const putData = {
            name: formData.get('name'),
            image_url: formData.get('image-url'),
            description: formData.get('description'),
            price: Number(formData.get('price')),
            stock_quantity: Number(formData.get('stock-quantity'))
        }
        try {
            await axios.put(`/api/protected/editproduct/${product.id}`, putData, { withCredentials: true })
        } catch (err) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                const response = err.response;
                if (response) {
                    setError(response.data.error || 'An unknown error occured')
                } else {
                    setError('Network error, please try again')
                }
            } else {
                setError("Failed to update product, an unknown error has occured.")
            }
            setIsLoading(false)
        }
        const form = document.getElementById('edit-product-form') as HTMLFormElement
        fetchProducts()
        setIsLoading(false)
        form.reset()
    }

    const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setError('')
        const formData = new FormData(event.currentTarget)
        const postData = {
            name: formData.get('name'),
            image_url: formData.get('image-url'),
            description: formData.get('description'),
            price: Number(formData.get('price')),
            stock_quantity: Number(formData.get('stock-quantity'))
        }
        try {
            await axios.post('/api/protected/products', postData, { withCredentials: true })
        } catch (err) {
            console.error(err)
            if (axios.isAxiosError(err)) {
                const response = err.response;
                if (response) {
                    setError(response.data.error || 'An unknown error occured');
                } else {
                    setError('Network error, please try again later')
                }
            } else {
                setError("Failed create product, an uknown error has occured.")
            }
            setIsLoading(false)
        }
        const form = document.getElementById('product-form') as HTMLFormElement
        fetchProducts()
        form.reset()
        setIsLoading(false)
        setOpen(false)
    }

    useEffect(() => {
        fetchProducts();
    }, [])

    return (
        <div className='new-container chakra-petch-regular flex-col'>
            {isMobile &&
                <div className='p-2 m-2'>
                    {products.map((product) => (
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
                    ))}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger className='text-white ml-auto mt-2' asChild>
                            <button className='w-full' onClick={() => setOpen(!open)}>Add Product</button>
                        </PopoverTrigger>
                        <PopoverContent className='m-3 p-0 w-auto bg-stone-600'>
                            <Card className="bg-stone-600 border-none text-white">
                                <form id='product-form' onSubmit={handleAddProduct} autoComplete='on' >
                                    <CardHeader>
                                        <CardTitle className='pb-3'>Add new product</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {error &&
                                            <Alert variant="destructive" className='border-red-600 text-red-600 p-2 my-2 bg-red-300'>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription><p className='text-red-600'>{error}</p></AlertDescription>
                                            </Alert>
                                        }
                                        <div>
                                            <Label htmlFor="name" className='pl-2'>Name</Label>
                                            <Input id="name" name='name' type='text' placeholder="Lavender Lemon Shampoo Bar" className='border-none justify-self-center' disabled={isLoading} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="image-url" className='pl-2'>Image URL</Label>
                                            <Input id="image-url" name='image-url' type='url' placeholder="google.com" className='border-none justify-self-center' disabled={isLoading} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="">Description</Label>
                                            <Textarea id="description" name='description' placeholder="Description here..." className='border-none justify-self-center bg-stone-700' disabled={isLoading} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="image-url">Price</Label>
                                            <Input id="price" name='price' type='number' step="0.01" min="0" placeholder="Enter Price" className='border-none justify-self-center' disabled={isLoading} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="image-url" className='pl-2'>Stock Quantity</Label>
                                            <Input id="stock-quantity" name='stock-quantity' type='number' min='0' placeholder='0' className='border-none justify-self-center' disabled={isLoading} required />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 justify-center">
                                        <div className='w-[75%]'>
                                            <Button className='w-full' type='submit' disabled={isLoading}>
                                                {isLoading ? "Adding Product..." : "Add Product"}
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </form>
                            </Card>
                        </PopoverContent>
                    </Popover>
                </div>
            }
            {
                !isMobile &&
                <div className='flex flex-col pt-8'>
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
                                            <Popover>
                                                <PopoverTrigger className='w-6 h-8'>
                                                    <Edit2 className="w-4 h-4 translate-x-[-7px] translate-y-[-3px]" />
                                                </PopoverTrigger>
                                                <PopoverContent className='text-white m-3 p-0 w-auto bg-stone-600'>
                                                    <Card className="bg-stone-600 border-none text-white">
                                                        <form id='edit-product-form' onSubmit={(event) => handleEditProduct(event, product)} autoComplete='on' >
                                                            <CardHeader>
                                                                <CardTitle className='pb-3'>Edit Product</CardTitle>
                                                            </CardHeader>
                                                            <CardContent>
                                                                {error &&
                                                                    <Alert variant="destructive" className='border-red-600 text-red-600 p-2 my-2 bg-red-300'>
                                                                        <AlertCircle className="h-4 w-4" />
                                                                        <AlertTitle>Error</AlertTitle>
                                                                        <AlertDescription><p className='text-red-600'>{error}</p></AlertDescription>
                                                                    </Alert>
                                                                }
                                                                <div className='grid grid-cols-2'>
                                                                    <div className="col-span-1">
                                                                        <Label htmlFor="name" className='pl-2'>Name</Label>
                                                                        <Input defaultValue={product.name} id="name" name='name' type='text' placeholder="Lavender Lemon Shampoo Bar" className='border-none justify-self-center' disabled={isLoading} required />
                                                                    </div>
                                                                    <div className="pl-1 col-span-1">
                                                                        <Label htmlFor="image-url" className='pl-2'>Image URL</Label>
                                                                        <Input defaultValue={product.image_url} id="image-url" name='image-url' type='url' placeholder="google.com" className='border-none justify-self-center' disabled={isLoading} required />
                                                                    </div>
                                                                    <div className="pl-1 pb-2 col-span-2">
                                                                        <Label htmlFor="">Description</Label>
                                                                        <Textarea defaultValue={product.description} id="description" name='description' placeholder="Description here..." className='border-none justify-self-center bg-stone-700' disabled={isLoading} required />
                                                                    </div>
                                                                    <div className="pl-1 col-span-1">
                                                                        <Label htmlFor="image-url">Price</Label>
                                                                        <Input defaultValue={product.price} id="price" name='price' type='number' step="0.01" min="0" placeholder="Enter Price" className='border-none justify-self-center' disabled={isLoading} required />
                                                                    </div>
                                                                    <div className="pl-1 col-span-1">
                                                                        <Label htmlFor="image-url" className='pl-2'>Stock Quantity</Label>
                                                                        <Input defaultValue={product.stock_quantity} id="stock-quantity" name='stock-quantity' type='number' min='0' placeholder='0' className='border-none justify-self-center' disabled={isLoading} required />
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                            <CardFooter className="pt-2 justify-center">
                                                                <div className='w-[75%]'>
                                                                    <Button className='w-full' type='submit' disabled={isLoading}>
                                                                        {isLoading ? "Updating Product..." : "Update Product"}
                                                                    </Button>
                                                                </div>
                                                            </CardFooter>
                                                        </form>
                                                    </Card>
                                                </PopoverContent>
                                            </Popover>
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
                    <Popover>
                        <PopoverTrigger className='text-white ml-auto mt-2'>Add Product</PopoverTrigger>
                        <PopoverContent className='m-3 p-0 w-auto bg-stone-600'>
                            <Card className="bg-stone-600 border-none text-white">
                                <form id='product-form' onSubmit={handleAddProduct} autoComplete='on' >
                                    <CardHeader>
                                        <CardTitle className='pb-3'>Add new product</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {error &&
                                            <Alert variant="destructive" className='border-red-600 text-red-600 p-2 my-2 bg-red-300'>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription><p className='text-red-600'>{error}</p></AlertDescription>
                                            </Alert>
                                        }
                                        <div className='grid grid-cols-2'>
                                            <div className="col-span-1">
                                                <Label htmlFor="name" className='pl-2'>Name</Label>
                                                <Input id="name" name='name' type='text' placeholder="Lavender Lemon Shampoo Bar" className='border-none justify-self-center' disabled={isLoading} required />
                                            </div>
                                            <div className="pl-1 col-span-1">
                                                <Label htmlFor="image-url" className='pl-2'>Image URL</Label>
                                                <Input id="image-url" name='image-url' type='url' placeholder="google.com" className='border-none justify-self-center' disabled={isLoading} required />
                                            </div>
                                            <div className="pl-1 pb-2 col-span-2">
                                                <Label htmlFor="">Description</Label>
                                                <Textarea id="description" name='description' placeholder="Description here..." className='border-none justify-self-center bg-stone-700' disabled={isLoading} required />
                                            </div>
                                            <div className="pl-1 col-span-1">
                                                <Label htmlFor="image-url">Price</Label>
                                                <Input id="price" name='price' type='number' step="0.01" min="0" placeholder="Enter Price" className='border-none justify-self-center' disabled={isLoading} required />
                                            </div>
                                            <div className="pl-1 col-span-1">
                                                <Label htmlFor="image-url" className='pl-2'>Stock Quantity</Label>
                                                <Input id="stock-quantity" name='stock-quantity' type='number' min='0' placeholder='0' className='border-none justify-self-center' disabled={isLoading} required />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 justify-center">
                                        <div className='w-[75%]'>
                                            <Button className='w-full' type='submit' disabled={isLoading}>
                                                {isLoading ? "Adding Product..." : "Add Product"}
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </form>
                            </Card>
                        </PopoverContent>
                    </Popover>
                </div>
            }
        </div >
    )
}

export default AddProducts
