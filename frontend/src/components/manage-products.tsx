import '../App.css'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AdminProductCard from './admin-product-card'
import { Product } from '@/types'
import { ProductDialog } from './product-dialog'
import { LayoutDashboard } from 'lucide-react'

function ManageProducts() {

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([]);

    const fetchProducts = async () => {
        const response = await axios.get('/api/shop/products');
        setProducts(response.data || [])
    }

    const handleDeleteProduct = async (product: Product) => {
        try {
            await axios.delete(`/api/protected/deleteproduct/${product.id}`, { withCredentials: true });
            fetchProducts()
        } catch (error) {
            console.error('Error deleting product:', error)
        };
    }

    const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>, product?: Product): Promise<boolean> => {
        event.preventDefault()
        setIsLoading(true)
        setError('')
        const formData = new FormData(event.currentTarget)

        const images = formData.getAll('images') as string[]
        const validImages = images.filter(url => url.trim() !== '')

        const postData = {
            name: formData.get('name'),
            description: formData.get('description'),
            images: validImages,

            price: Number(formData.get('price')),
            stock_quantity: Number(formData.get('stock-quantity')),
            featured: formData.get('featured') === 'on',
            on_sale: formData.get('on-sale') === 'on',
            sale_price: Number(formData.get('sale-price')),
            long_description: formData.get('long-description'),
            ingredients: formData.get('ingredients'),
            raw_ingredients_json: formData.get('raw-ingredients-json') || '[]',
            gtin: formData.get('gtin'),
            weight: Number(formData.get('weight')),
            skus: JSON.parse(formData.get('skus') as string || '[]')
        }

        try {
            if (product) {
                // EDIT Mode
                await axios.put(`/api/protected/editproduct/${product.id}`, postData, { withCredentials: true })
            } else {
                // ADD Mode
                await axios.post('/api/protected/products', postData, { withCredentials: true })
            }
            fetchProducts()
            return true
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
                setError("Failed product operation, an unknown error has occured.")
            }
            return false
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts();
    }, [])

    return (
        <div className='min-h-screen bg-background text-foreground flex flex-col'>
            <div className='max-w-7xl mx-auto w-full px-4 py-8 space-y-8'>

                {/* Header Section */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                            <LayoutDashboard className='w-6 h-6 text-primary' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight'>Manage Products</h1>
                            <p className='text-muted-foreground'>View, add, and manage your store inventory.</p>
                        </div>
                    </div>
                    <ProductDialog handleSaveProduct={handleSaveProduct} isLoading={isLoading} error={error} />
                </div>

                {/* Product Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {products.map((product) => (
                        <AdminProductCard
                            key={product.id}
                            product={product}
                            handleDeleteProduct={handleDeleteProduct}
                            handleSaveProduct={handleSaveProduct}
                            error={error}
                        />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className='text-center py-20'>
                        <p className='text-muted-foreground'>No products found. Start by adding one!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManageProducts
