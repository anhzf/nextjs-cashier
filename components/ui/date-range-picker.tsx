"use client"

import { addDays, format, lastDayOfWeek, startOfWeek } from 'date-fns'
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

type Value = readonly [Date, Date];

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Value;
  onChange?: (value: Value) => void;
}

export function DatePickerWithRange({
  value: [from, to] = [startOfWeek(new Date()), lastDayOfWeek(new Date())],
  onChange,
  className,
  ...props
}: Props) {
  const [date, setDate] = React.useState<DateRange | undefined>({ from, to });

  const handleChange: SelectRangeEventHandler = (range) => {
    if (typeof onChange === 'function') {
      onChange([range?.from ?? from, range?.to ?? to]);
    } else {
      setDate(range);
    }
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
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
