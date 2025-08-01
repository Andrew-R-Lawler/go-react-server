import '../App.css'
import { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "./ui/label";
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

type DesktopProductCardProps = {
    handleAddProduct: (event: React.FormEvent<HTMLFormElement>) => void
    error: string
    isLoading: boolean
}

function DesktopAddProduct({handleAddProduct, error, isLoading}: DesktopProductCardProps) {

    const [open, setOpen] = useState(false)
    
    useEffect(() => {
        if (error) {
            setOpen(true)
        }
    }, [error])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className='text-white ml-auto mt-2' onClick={() => setOpen(!open)}>Add Product</PopoverTrigger>
            <PopoverContent className='m-3 p-0 w-auto bg-stone-600'>
                <Card className="bg-stone-600 border-none text-white">
                    <form id='product-form' onSubmit={(event) => (handleAddProduct(event), setOpen(false))} autoComplete='on' >
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
    )
}

export default DesktopAddProduct
