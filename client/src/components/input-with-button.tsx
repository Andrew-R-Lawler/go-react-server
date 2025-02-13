import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { StyledTable } from "./styled-table"

interface Item {
  id: number
  name: string
  completed: boolean
}

export function InputWithButton() {
  const [inputValue, setInputValue] = React.useState("")
  const [items, setItems] = React.useState<Item[]>([
    { id: 1, name: "Apple", completed: false },
    { id: 2, name: "Banana", completed: true },
    { id: 3, name: "Orange", completed: false },
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleAddItem = () => {
    if (inputValue.trim()) {
      const newItem: Item = {
        id: Date.now(),
        name: inputValue.trim(),
        completed: false,
      }
      setItems([...items, newItem])
      setInputValue("") // Clear the input after adding
    }
  }

  return (
    <div className="space-y-4 w-full max-w-sm">
      <div className="flex items-center bg-stone-900 space-x-0 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-400">
        <Input
          type="text"
          placeholder="Add an item..."
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
        />
        <Button
          className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none rounded-none p-2 w-10 h-10 flex-shrink-0"
          aria-label="Add item"
          onClick={handleAddItem}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
      <StyledTable items={items} setItems={setItems} />
    </div>
  )
}

