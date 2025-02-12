import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function ButtonDemo() {
  return (
    <Button
      className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none p-2 w-10 h-10"
      aria-label="Add item"
    >
      <Plus className="w-6 h-6" />
    </Button>
  )
}

