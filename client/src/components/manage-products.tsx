import '../App.css'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import MobileProductCard from './mobile-product-card';
import MobileAddProduct from './mobile-add-product';
import DesktopAddProduct from './desktop-add-product';
import DesktopProductTable from './desktop-product-table';

function ManageProducts() {

    interface Product {
        id: number
        name: string
        description: string
        image_url: string
        price: number
        stock_quantity: number
    }

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
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
    }

    useEffect(() => {
        fetchProducts();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    return (
        <div className='new-container chakra-petch-regular flex-col'>
            {isMobile &&
                <div className='p-2 m-2'>
                    {products.map((product) => (
                        <MobileProductCard product={product} fetchProducts={fetchProducts} handleDeleteProduct={handleDeleteProduct} />
                    ))}
                    <MobileAddProduct handleAddProduct={handleAddProduct} error={error} isLoading={isLoading} />
                </div>
            }
            {
                !isMobile &&
                <div className='flex flex-col pt-8'>
                    <DesktopProductTable products={products} fetchProducts={fetchProducts} handleDeleteProduct={handleDeleteProduct} />
                    <DesktopAddProduct handleAddProduct={handleAddProduct} error={error} isLoading={isLoading} />
                </div>
            }
        </div >
    )
}

export default ManageProducts
