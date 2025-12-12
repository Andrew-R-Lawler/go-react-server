import { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
    id: number;
    quantity: number;
}

interface Order {
    id: number;
    amount: number;
    status: string;
    items: OrderItem[];
    shipping_method: string;
    created_at: string;
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/protected/orders', { withCredentials: true })
                setOrders(response.data)
            } catch (error) {
                console.error("Failed to fetch orders:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">You haven't placed any orders yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-muted/50">
                                    <TableHead className="w-[100px]">Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Shipping</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="border-border hover:bg-muted/50">
                                        <TableCell className="font-medium">#{order.id}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {order.items.map((item, index) => (
                                                    <span key={index} className="text-xs text-muted-foreground">
                                                        Item #{item.id} (x{item.quantity})
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">{order.shipping_method || 'Standard'}</TableCell>
                                        <TableCell className="text-right">
                                            ${(order.amount / 100).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={order.status === 'succeeded' ? 'default' : 'destructive'}>
                                                {order.status === 'succeeded' ? 'Paid' : order.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
