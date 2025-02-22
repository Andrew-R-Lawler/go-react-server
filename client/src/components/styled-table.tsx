"use client"

import type React from "react"
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit2, X, Check } from "lucide-react"
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

    const [inputValue, setInputValue] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

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
          fetchTodos();
          return response
      } catch (error) {
          console.error('Error deleting item:', error)
      };
  }

  const toggleCompleted = (id: number, completed: boolean) => {
    console.log("completed toggle press ID:", id, "completed:", completed)
  }

  const editItem = (id: number) => {
    // Placeholder for edit functionality
    setItems(items.map((item) => (item.id === id ? { ...item, editable: !item.editable } : item)))
    setError('')
  }

  const updateItem = async (id: number) => {
        if (inputValue.trim() === '') {
            setError('Input Cannot be empty');
        } else {
          try {
              const response = await axios.put(`/api/todo/${id}`, inputValue)
              editItem(id)
              fetchTodos()
              setError('')
              setInputValue('')
              return response
          } catch (error) {
              console.error('Error updating item:', error)
          }
        }
  }

  return (
    <div className="text-white w-full max-w-sm">
    {error && <p className= "chakra-petch-regular text-red-500 text-left">{error}</p>}
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
                  onCheckedChange={() => toggleCompleted(item.id, item.completed)}
                  aria-label={`Mark ${item.name} as ${item.completed ? "incomplete" : "complete"}`}
                />
              </TableCell>
              {item.editable === false && 
                  <>
                      <TableCell className="chakra-petch-regular">
                         {item.name}
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
                  </>
              }
              {item.editable === true && 
                  <>
                      <TableCell className="chakra-petch-regular">
                          <Input
                                  type="text"
                                  placeholder={item.name}
                                  className="chakra-petch-regular border-none focus-visible:ring-0 focus-visible:ring-offset-0 m-0 p-1 text-white"
                                  value={inputValue}
                                  onChange={handleChange}
                                />
                      </TableCell>
                      <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                              <Button
                              type="submit"
                              onClick={() => updateItem(item.id)}
                              className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none p-2 w-8 h-8"
                              aria-label={`Edit ${item.name}`}
                              >
                                <Check />
                              </Button>
                              <Button
                              onClick={() => editItem(item.id)}
                              className="bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600 text-white border-none p-2 w-8 h-8"
                              aria-label={`Delete ${item.name}`}
                              >
                                  <X className="w-4 h-4" />
                              </Button>
                          </div>
                      </TableCell>
                  </>
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

