"use client"

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utils/ui'
import type { SelectSingleEventHandler } from 'react-day-picker'

type Value = Date | undefined;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  value?: Value;
  placeholder?: string;
  onValueChange?: (value: Value) => void;
}

export function DatePicker({ value, placeholder, onValueChange }: Props) {
  const [date, setDate] = React.useState<Date | undefined>(value);

  const handleChange: SelectSingleEventHandler = (v) => {
    onValueChange?.(v);
    setDate(v);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-56 justify-start text-left font-normal',
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder || 'Pick a date'}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
