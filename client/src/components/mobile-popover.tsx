import '../App.css'
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from './ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover"
import axios from 'axios';

type Product = {
        id: number
        name: string
        description: string
        image_url: string
        price: number
        stock_quantity: number
}

type MobilePopoverProps = {
    product: Product
    fetchProducts: () => void
}

function MobilePopover({product, fetchProducts}: MobilePopoverProps) {

    const [open, setOpen] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
        setOpen(false)
        form.reset()
    }

    return (
        <div className='w-full'>
        <Popover open={open}>
            <PopoverTrigger asChild>
                <button className='w-full' onClick={() => setOpen(!open)}>
                    Edit Product
                </button>
            </PopoverTrigger>
            <PopoverContent className='text-white m-3 p-0 w-full bg-stone-600'>
                <Card className="bg-stone-600 border-none text-white fixed">
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
                            <div>
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input defaultValue={product.name} id="name" name='name' type='text' placeholder="Lavender Lemon Shampoo Bar" className='border-none justify-self-center' disabled={isLoading} required />
                                </div>
                                <div>
                                    <Label htmlFor="image-url">Image URL</Label>
                                    <Input defaultValue={product.image_url} id="image-url" name='image-url' type='url' placeholder="google.com" className='border-none justify-self-center' disabled={isLoading} required />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea defaultValue={product.description} id="description" name='description' placeholder="Description here..." className='border-none justify-self-center bg-stone-700 ml-2' disabled={isLoading} required />
                                </div>
                                <div>
                                    <Label htmlFor="price">Price</Label>
                                    <Input defaultValue={product.price} id="price" name='price' type='number' step="0.01" min="0" placeholder="Enter Price" className='border-none justify-self-center' disabled={isLoading} required />
                                </div>
                                <div>
                                    <Label htmlFor="stock-quantity">Stock Quantity</Label>
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
        </div>
    )
}

export default MobilePopover
