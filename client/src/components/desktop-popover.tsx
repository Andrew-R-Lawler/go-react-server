import '../App.css'
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Edit2 } from "lucide-react"
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from 'axios';

type Product = {
    id: number
    name: string
    description: string
    image_url: string
    price: number
    stock_quantity: number
}

type DesktopPopoverProps = {
    product: Product
    fetchProducts: () => void
}

function DesktopPopover({ product, fetchProducts }: DesktopPopoverProps) {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (error) {
            setOpen(true)
        }
    }, [error])

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
        <Popover open={open}>
            <PopoverTrigger className='w-6 h-8'>
                <Edit2 className="w-4 h-4 translate-x-[-7px] translate-y-[-3px]" onClick={() => setOpen(!open)} />
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
    )
}

export default DesktopPopover
