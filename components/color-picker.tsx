"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const COLORS = [
  { id: "1", name: "Lavender", className: "bg-[#a4bdfc]" },
  { id: "2", name: "Sage", className: "bg-[#7ae7bf]" },
  { id: "3", name: "Grape", className: "bg-[#dbadff]" },
  { id: "4", name: "Flamingo", className: "bg-[#ff887c]" },
  { id: "5", name: "Banana", className: "bg-[#fbd75b]" },
  { id: "6", name: "Tangerine", className: "bg-[#ffb878]" },
  { id: "7", name: "Peacock", className: "bg-[#46d6db]" },
  { id: "8", name: "Graphite", className: "bg-[#e1e1e1]" },
  { id: "9", name: "Blueberry", className: "bg-[#5484ed]" },
  { id: "10", name: "Basil", className: "bg-[#51b749]" },
  { id: "11", name: "Tomato", className: "bg-[#dc2127]" },
]

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="my-3">
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-[1px]"
      >
        {COLORS.map((color) => (
          <div key={color.id} className="flex items-center">
            <RadioGroupItem
              value={color.id}
              id={`color-${color.id}`}
              className="peer sr-only "
            />
            <Label
              htmlFor={`color-${color.id}`}
              className={cn(
                "w-5 h-5 rounded-full cursor-pointer border-2 border-transparent transition-all",
                "hover:scale-110 peer-data-[state=checked]:border-foreground peer-data-[state=checked]:scale-110 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-offset-2",
                color.className
              )}
              title={color.name}
            />
          </div>
        ))}
      </RadioGroup>

      <p className="text-sm text-muted-foreground my-2 ml-3">
        Selected:{" "}
        <span className="font-medium text-foreground">
          {COLORS.find((c) => c.id === value)?.name}
        </span>
      </p>
    </div>
  )
}