import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function ButtonDemo() {
  return (
    <Button
      className="bg-stone-900 text-white border-none p-2 w-10 h-10"
      aria-label="Add item"
    >
      <Plus className="w-6 h-6" />
    </Button>
  )
}

