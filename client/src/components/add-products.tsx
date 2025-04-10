import '../App.css'
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from './ui/textarea';
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import axios from 'axios'

function AddProducts() {

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setError('')
        const formData = new FormData(event.currentTarget)
        const name = formData.get('name')
        const imageUrl = formData.get('image-url')
        const description = formData.get('description')
        const price = formData.get('price')
        const stockQuantity = formData.get('stock-quantity')
        const postData = {
            name: name,
            imageUrl: imageUrl,
            description: description,
            price: price,
            stockQuantity: stockQuantity
        }
        console.log('postData:', postData)
        const form = document.getElementById('product-form') as HTMLFormElement
        form.reset()
        setIsLoading(false)
    } 

    return (
        <div className='flex-container chakra-petch-regular'>
        <Card className="w-[60%] bg-stone-600 border-none text-white">
        <form id='product-form' onSubmit={handleAddProduct} autoComplete='on' >
            <CardHeader>image
                <CardTitle className='pb-3'>Add new product</CardTitle>
            </CardHeader>
            <CardContent>
                { error && 
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
                    <Input id="image-url" name='image-url' type='url' placeholder="google.com" className='border-none justify-self-center'  disabled={isLoading} required/>
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
            <CardFooter className="pt-2">
                <Button className='w-full' type='submit' disabled={isLoading}>
                    {isLoading ? "Adding Product..." : "Add Product"}
                </Button>
            </CardFooter>
        </form>
        </Card>
        </div>
    )
}

export default AddProducts
