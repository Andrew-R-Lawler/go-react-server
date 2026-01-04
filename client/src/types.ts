export interface Product {
    id: number
    name: string
    description: string
    image_url: string
    images?: string[] // Optional for now as we transition
    price: number
    stock_quantity: number
    on_sale: boolean
    sale_price: number
    long_description?: string
    featured: boolean
}
