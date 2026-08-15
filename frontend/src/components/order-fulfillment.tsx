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
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, ChevronDown } from "lucide-react"

interface OrderItem {
    id: number;
    title?: string;
    quantity: number;
}

interface Order {
    id: number;
    amount: number;
    status: string;
    items: OrderItem[];
    shipping_method: string;
    created_at: string;
    receipt_email: string;
    tracking_number: string;
    label_url?: string;
}

export default function OrderFulfillment() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<number | null>(null)

    // Shipping Dialog State
    const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
    const [trackingNumber, setTrackingNumber] = useState("")
    const [buyingLabel, setBuyingLabel] = useState(false)

    // Live Rate Shopping States
    const [showRateShopping, setShowRateShopping] = useState(false)
    const [length, setLength] = useState("5")
    const [width, setWidth] = useState("5")
    const [height, setHeight] = useState("5")
    const [weight, setWeight] = useState("16")
    const [rates, setRates] = useState<any[]>([])
    const [loadingRates, setLoadingRates] = useState(false)
    const [fetchingRatesError, setFetchingRatesError] = useState("")

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/protected/admin/orders', { withCredentials: true })
            setOrders(response.data)
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const initiateStatusUpdate = (orderId: number, newStatus: string) => {
        if (newStatus === 'shipped') {
            setSelectedOrderId(orderId)
            setTrackingNumber("")
            setShowRateShopping(false)
            setLength("5")
            setWidth("5")
            setHeight("5")
            setWeight("16")
            setRates([])
            setFetchingRatesError("")
            setShippingDialogOpen(true)
        } else {
            handleStatusUpdate(orderId, newStatus)
        }
    }

    const fetchRates = async () => {
        if (!selectedOrderId) return
        setLoadingRates(true)
        setRates([])
        setFetchingRatesError("")
        try {
            const response = await axios.post(`/api/protected/admin/orders/${selectedOrderId}/shippo-rates`, {
                length: length,
                width: width,
                height: height,
                weight: Number(weight),
                distance_unit: "in",
                mass_unit: "oz"
            }, { withCredentials: true })
            setRates(response.data.rates || [])
        } catch (error) {
            console.error("Failed to fetch rates:", error)
            setFetchingRatesError(axios.isAxiosError(error) ? error.response?.data?.error || "Error fetching rates" : "Unknown error")
        } finally {
            setLoadingRates(false)
        }
    }

    const buySpecificRate = async (rateId: string) => {
        if (!selectedOrderId) return
        setBuyingLabel(true)
        try {
            const response = await axios.post(`/api/protected/admin/orders/${selectedOrderId}/shippo-label`, {
                rate_id: rateId
            }, { withCredentials: true })
            const { label_url, tracking_number } = response.data
            
            setOrders(orders.map(o => o.id === selectedOrderId ? { 
                ...o, 
                status: 'shipped', 
                tracking_number: tracking_number, 
                label_url: label_url 
            } : o))
            
            setShippingDialogOpen(false)
            setSelectedOrderId(null)
            setRates([])
            setShowRateShopping(false)
        } catch (error) {
            console.error("Failed to buy specific label:", error)
            alert("Error buying label: " + (axios.isAxiosError(error) ? error.response?.data?.error : "Unknown error"))
        } finally {
            setBuyingLabel(false)
        }
    }

    const buyShippoLabel = async () => {
        if (!selectedOrderId) return
        setBuyingLabel(true)
        try {
            const response = await axios.post(`/api/protected/admin/orders/${selectedOrderId}/shippo-label`, {}, { withCredentials: true })
            const { label_url, tracking_number } = response.data
            
            setOrders(orders.map(o => o.id === selectedOrderId ? { 
                ...o, 
                status: 'shipped', 
                tracking_number: tracking_number, 
                label_url: label_url 
            } : o))
            
            setShippingDialogOpen(false)
            setSelectedOrderId(null)
        } catch (error) {
            console.error("Failed to buy Shippo label:", error)
            alert("Error buying label: " + (axios.isAxiosError(error) ? error.response?.data?.error : "Unknown error"))
        } finally {
            setBuyingLabel(false)
        }
    }

    const confirmShipping = async () => {
        if (selectedOrderId) {
            await handleStatusUpdate(selectedOrderId, 'shipped', trackingNumber)
            setShippingDialogOpen(false)
            setSelectedOrderId(null)
            setTrackingNumber("")
        }
    }

    const handleStatusUpdate = async (orderId: number, newStatus: string, trackingNum: string = "") => {
        setUpdating(orderId)
        try {
            await axios.put(`/api/protected/admin/orders/${orderId}/status`, {
                status: newStatus,
                tracking_number: trackingNum
            }, { withCredentials: true })

            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, tracking_number: trackingNum || o.tracking_number } : o))
        } catch (error) {
            console.error("Failed to update status:", error)
        } finally {
            setUpdating(null)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        Order Fulfillment
                    </CardTitle>
                    <Button variant="outline" onClick={fetchOrders}>Refresh</Button>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No orders found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-muted/50">
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Shipping</TableHead>
                                    <TableHead>Tracking</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[180px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="border-border hover:bg-muted/50">
                                        <TableCell className="font-medium">#{order.id}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={order.receipt_email}>
                                            {order.receipt_email}
                                        </TableCell>
                                        <TableCell className="capitalize">{order.shipping_method || 'Standard'}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {order.tracking_number ? (
                                                <div className="flex flex-col gap-1">
                                                    <span>{order.tracking_number}</span>
                                                    {order.label_url && (
                                                        <a 
                                                            href={order.label_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-emerald-500 hover:underline text-xs flex items-center gap-1 font-semibold"
                                                        >
                                                            Print Label
                                                        </a>
                                                    )}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${(order.amount / 100).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-[140px] justify-between capitalize"
                                                        disabled={updating === order.id}
                                                    >
                                                        {order.status}
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => initiateStatusUpdate(order.id, 'processing')}>Processing</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => initiateStatusUpdate(order.id, 'shipped')}>Shipped</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => initiateStatusUpdate(order.id, 'delivered')}>Delivered</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => initiateStatusUpdate(order.id, 'cancelled')} className="text-destructive">Cancelled</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
                <DialogContent className="sm:max-w-[500px] md:max-w-[650px] overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Mark Order as Shipped</DialogTitle>
                        <DialogDescription>
                            Enter the tracking number for this order, or buy a Shippo label.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tracking" className="text-right">
                                Tracking #
                            </Label>
                            <Input
                                id="tracking"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="col-span-3"
                                placeholder="USPS Tracking Number"
                                disabled={buyingLabel}
                            />
                        </div>

                        <div className="border-t border-border pt-4">
                            <button
                                type="button"
                                onClick={() => setShowRateShopping(!showRateShopping)}
                                className="text-sm text-primary hover:underline font-semibold flex items-center gap-1"
                            >
                                {showRateShopping ? "[-] Hide Rate Shopping" : "[+] Advanced: Live Rate Shopping"}
                            </button>
                        </div>

                        {showRateShopping && (
                            <div className="space-y-4 bg-muted/20 p-4 rounded-md border border-border">
                                <div className="grid grid-cols-4 gap-2 items-center">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Length (in)</Label>
                                        <Input value={length} onChange={e => setLength(e.target.value)} placeholder="5" disabled={buyingLabel} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Width (in)</Label>
                                        <Input value={width} onChange={e => setWidth(e.target.value)} placeholder="5" disabled={buyingLabel} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Height (in)</Label>
                                        <Input value={height} onChange={e => setHeight(e.target.value)} placeholder="5" disabled={buyingLabel} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Weight (oz)</Label>
                                        <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="16" disabled={buyingLabel} />
                                    </div>
                                </div>

                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={fetchRates} 
                                    disabled={loadingRates || buyingLabel}
                                    className="w-full text-xs font-semibold"
                                >
                                    {loadingRates ? "Fetching Rates..." : "Get Live Quotes"}
                                </Button>

                                {fetchingRatesError && (
                                    <p className="text-xs text-destructive">{fetchingRatesError}</p>
                                )}

                                {rates.length > 0 && (
                                    <div className="max-h-[220px] overflow-y-auto border border-border rounded-md bg-background">
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="border-b bg-muted/50 font-semibold">
                                                    <th className="p-2">Carrier / Service</th>
                                                    <th className="p-2">Days</th>
                                                    <th className="p-2">Cost</th>
                                                    <th className="p-2 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rates.map((rate: any) => (
                                                    <tr key={rate.object_id} className="border-b hover:bg-muted/30">
                                                        <td className="p-2 font-medium">
                                                            {rate.provider} - {rate.servicelevel.name}
                                                        </td>
                                                        <td className="p-2">
                                                            {rate.estimated_days ? `${rate.estimated_days} days` : "-"}
                                                        </td>
                                                        <td className="p-2 font-semibold">
                                                            ${Number(rate.amount).toFixed(2)}
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => buySpecificRate(rate.object_id)}
                                                                disabled={buyingLabel}
                                                                className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                                                            >
                                                                Buy
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <Button 
                            variant="secondary" 
                            onClick={buyShippoLabel} 
                            disabled={buyingLabel}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        >
                            {buyingLabel ? "Buying..." : "Buy Shippo Label (Auto)"}
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShippingDialogOpen(false)} disabled={buyingLabel}>Cancel</Button>
                            <Button onClick={confirmShipping} disabled={buyingLabel}>Confirm Shipment</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
