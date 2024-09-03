"use client"

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { DateRange, type SelectRangeEventHandler } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utils/ui'

type Value = [Date?, Date?];

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  value?: Value;
  placeholder?: string;
  displayValue?: (value: Value) => string;
  onValueChange?: (value: Value) => void;
}

export function DatePickerWithRange({
  placeholder,
  value,
  displayValue,
  onValueChange,
  className,
  ...props
}: Props) {
  const [date, setDate] = React.useState<DateRange | undefined>({ from: value?.[0], to: value?.[1] });

  const handleChange: SelectRangeEventHandler = (range) => {
    onValueChange?.([range?.from, range?.to]);
    setDate(range);
  };

  return (
    <div className={cn('grid gap-2', className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-72 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="shrink-0 mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {displayValue?.([date.from, date.to]) || [
                    format(date.from, 'LLL dd, y'),
                    format(date.to, 'LLL dd, y'),
                  ].join(' - ')}
                </>
              ) : (
                displayValue?.([date.from]) || format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder || 'Pick a date'}</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
