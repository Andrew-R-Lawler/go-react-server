"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit2 } from "lucide-react"

interface Item {
  id: number
  name: string
  completed: boolean
}

interface StyledTableProps {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
}

export function StyledTable({ items, setItems }: StyledTableProps) {
  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const toggleCompleted = (id: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const editItem = (id: number) => {
    // Placeholder for edit functionality
    console.log("Edit item:", id)
  }

  return (
    <div className="w-full max-w-sm">
      <Table className="border rounded-md overflow-hidden">
        <TableHeader className="bg-gradient-to-r from-orange-400 to-green-500">
          <TableRow>
            <TableHead className="text-white font-bold">Item</TableHead>
            <TableHead className="text-white font-bold text-center">Status</TableHead>
            <TableHead className="text-white font-bold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className={item.completed ? "bg-gray-100" : ""}>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleCompleted(item.id)}
                  aria-label={`Mark ${item.name} as ${item.completed ? "incomplete" : "complete"}`}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => editItem(item.id)}
                    className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none p-2 w-8 h-8"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteItem(item.id)}
                    className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none p-2 w-8 h-8"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

