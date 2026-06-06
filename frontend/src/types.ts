export interface ProductSKU {
    id?: number
    product_id?: number
    sku: string
    variant_name: string
    stock_quantity: number
}

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
    ingredients?: string
    raw_ingredients_json?: string
    featured: boolean
    skus?: ProductSKU[]
}
