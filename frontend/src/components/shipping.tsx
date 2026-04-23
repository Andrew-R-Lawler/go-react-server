import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

function Shipping() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
            <div className="mb-6">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>
            <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="max-w-2xl text-center text-muted-foreground mb-4">
                We ship our eco-friendly soaps to anywhere in the world. Standard delivery takes 3-5 business days.
            </p>
            <p className="max-w-2xl text-center text-muted-foreground">
                This is a placeholder page. Detailed shipping policies and rates will be added soon.
            </p>
        </div>
    );
}

export default Shipping;
