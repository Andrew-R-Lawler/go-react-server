import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-0 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-400">
      <Input
        type="text"
        placeholder="Add an item..."
        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none rounded-none p-2 w-10 h-10 flex-shrink-0"
        aria-label="Add item"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  )
}

