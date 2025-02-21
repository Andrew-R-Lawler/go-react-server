"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit2 } from "lucide-react"
import '../App.css'
import axios from 'axios'

interface Item {
  id: number
  name: string
  completed: boolean
  editable: boolean
}

interface StyledTableProps {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
}

export function StyledTable({ items, setItems }: StyledTableProps) {

    const fetchTodos = async () => {
        const response = await axios.get('/api/todo/');
        if (response.data === null) {
            setItems([{id: 1, name: "start adding to-dos", completed: false, editable: false }]);  
        } else {
            setItems(response.data);
        }
        return response.data;
    }

  const deleteItem = async (id: number) => {
      try {
          const response = await axios.delete(`/api/todo/${id}`);
          console.log(`Item deleted: ${id}`, response.data)
          fetchTodos();
      } catch (error) {
          console.error('Error deleting item:', error)
      };
  }

  const toggleCompleted = (id: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const editItem = (id: number) => {
    // Placeholder for edit functionality
    console.log("Edit item:", id)
  }

  return (
    <div className="text-white w-full max-w-sm">
      <Table className="chakra-petch-regular border-none border-radius bg-stone-700 rounded-md overflow-hidden">
        <TableHeader className="bg-gradient-to-r from-orange-400 to-green-500">
          <TableRow className="border-none">
            <TableHead className="text-white font-bold w-16">Status</TableHead>
            <TableHead className="text-white font-bold">Item</TableHead>
            <TableHead className="text-white font-bold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className={item.completed ? "bg-stone-500 border-none" : "border-none"}>
              <TableCell className="text-center">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleCompleted(item.id)}
                  aria-label={`Mark ${item.name} as ${item.completed ? "incomplete" : "complete"}`}
                />
              </TableCell>
              <TableCell className="chakra-petch-regular">{item.name}</TableCell>
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

