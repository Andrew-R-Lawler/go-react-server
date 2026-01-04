export interface Product {
    id: number
    name: string
    description: string
    images: string[]
    price: number
    stock_quantity: number
    on_sale: boolean
    sale_price: number
    long_description?: string
    featured: boolean
}
