'use client';

import { LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY } from '@/calls/transactions';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRANSACTION_STATUSES } from '@/constants';
import { CalendarPlusIcon, ListFilterIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { InferOutput } from 'valibot';
import type { QuerySchema } from './shared';
import { TRANSACTION_STATUSES_UI } from '@/ui';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { endOfDay, isSameDay } from 'date-fns';

const SORT_BY_ATTRS = {
  createdAt: {
    title: 'Tanggal',
  },
  updatedAt: {
    title: 'Terakhir diubah',
  },
} satisfies Record<typeof LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY[number], Record<string, unknown>>;

type FilterBarProps = InferOutput<typeof QuerySchema>;

const dateToQuery = (date: Date) => date.toISOString().split('T')[0];

export function FilterBar({ from, to, sortBy = 'createdAt', status }: FilterBarProps) {
  const router = useRouter();

  const isToEndOfTheFromDay = from && to && isSameDay(endOfDay(from), to);
  console.log({ from, to, isToEndOfTheFromDay });

  const searchParams = new URLSearchParams();
  if (from) searchParams.append('from', dateToQuery(from));
  if (sortBy) searchParams.append('sortBy', sortBy);
  if (status) searchParams.append('status', status);

  const [showDateEnd, setShowDateEnd] = useState(!!(from && to) && isToEndOfTheFromDay);

  const onStatusChange = (status: string) => {
    if (status) searchParams.set('status', status);
    else searchParams.delete('status');
    router.push(`?${searchParams}`);
  };

  const onSortByChange = (sortBy: string) => {
    if (sortBy) searchParams.set('sortBy', sortBy);
    else searchParams.delete('sortBy');
    router.push(`?${searchParams}`);
  };

  const onFromChange = (value?: Date) => {
    if (value) searchParams.set('from', dateToQuery(value));
    else searchParams.delete('from');
    router.push(`?${searchParams}`);
  };

  const onToChange = (value?: Date) => {
    if (value) searchParams.set('to', dateToQuery(value));
    else searchParams.delete('to');
    router.push(`?${searchParams}`);
  };

  return (
    <div className="sticky top-16 z-10 flex bg-gray-50 items-center gap-x-6 gap-y-2 flex-wrap px-4 py-2.5 border-b">
      <ListFilterIcon className="size-4" />

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Status:
        </Label>

        <Select defaultValue={status || 'all'} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="$all">Semua</SelectItem>
            {TRANSACTION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                <Badge className={TRANSACTION_STATUSES_UI[status].classes}>
                  {TRANSACTION_STATUSES_UI[status].title}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Urut berdasarkan:
        </Label>

        <Select defaultValue={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Urut berdasarkan" />
          </SelectTrigger>
          <SelectContent>
            {LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY.map((el) => (
              <SelectItem key={el} value={el}>
                {SORT_BY_ATTRS[el].title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          {(to || showDateEnd) ? 'Mulai' : 'Tanggal'}:
        </Label>

        <DatePicker
          placeholder="Pilih Tanggal"
          value={from}
          onValueChange={onFromChange}
        />

        {from && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onFromChange()}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>


      <div className="flex items-center gap-2">
        {showDateEnd ? (
          <>
            <Label className="text-gray-500">
              Sampai:
            </Label>

            <DatePicker
              placeholder="Tanggal akhir"
              value={to}
              onValueChange={onToChange}
            />
          </>
        ) : (
          <Button variant="ghost" className="text-muted-foreground" onClick={() => setShowDateEnd(true)}>
            <CalendarPlusIcon className="size-4 mr-2" />
            Tambahkan tanggal akhir
          </Button>
        )}

        {showDateEnd && (
          <Button type="button" variant="ghost" size="icon" onClick={() => to ? onToChange() : setShowDateEnd(false)}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Mulai:
        </Label>

        <DatePicker
          placeholder="Pilih Tanggal"
          value={from}
          onValueChange={onFromChange}
        />

        {from && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onFromChange()}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Sampai:
        </Label>

        <DatePicker
          placeholder="Pilih Tanggal"
          value={to}
          onValueChange={onToChange}
        />

        {to && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onToChange()}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div> */}
    </div>
  );
}

// type DatePreset = "yesterday" | "last3days" | "lastWeek" | "lastMonth"

// function DateRangeFilter() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [startDate, setStartDate] = useState<Date | undefined>(undefined)
//   const [endDate, setEndDate] = useState<Date | undefined>(undefined)

//   const handleDateSelect = (date: Date | undefined, isStart: boolean) => {
//     if (isStart) {
//       setStartDate(date)
//       if (!endDate) {
//         setEndDate(date)
//       } else if (date && isAfter(date, endDate)) {
//         setEndDate(date)
//       }
//     } else {
//       setEndDate(date)
//       if (date && startDate && isBefore(date, startDate)) {
//         setStartDate(date)
//       }
//     }
//   }

//   const inferDateRange = useCallback((): string => {
//     if (startDate) {
//       if (endDate) {
//         if (isEqual(startDate, endDate)) {
//           return `On ${format(startDate, "LLL dd, y")}`
//         }
//         return `${format(startDate, "LLL dd, y")} - ${format(endDate, "LLL dd, y")}`
//       }
//       return `From ${format(startDate, "LLL dd, y")}`
//     }
//     return "Select dates"
//   }, [startDate, endDate])

//   const clearDates = () => {
//     setStartDate(undefined)
//     setEndDate(undefined)
//   }

//   const applyPreset = (preset: DatePreset) => {
//     const today = new Date()
//     switch (preset) {
//       case "yesterday":
//         setStartDate(subDays(today, 1))
//         setEndDate(subDays(today, 1))
//         break
//       case "last3days":
//         setStartDate(subDays(today, 3))
//         setEndDate(today)
//         break
//       case "lastWeek":
//         setStartDate(subDays(today, 7))
//         setEndDate(today)
//         break
//       case "lastMonth":
//         setStartDate(subDays(today, 30))
//         setEndDate(today)
//         break
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           className={cn(
//             "w-[300px] justify-start text-left font-normal",
//             !startDate && "text-muted-foreground"
//           )}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {startDate ? inferDateRange() : "Filter by date"}
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Filter by date range</DialogTitle>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <div className="grid grid-cols-2 gap-4">
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   id="start-date"
//                   variant={"outline"}
//                   className={cn(
//                     "w-full justify-start text-left font-normal",
//                     !startDate && "text-muted-foreground"
//                   )}
//                 >
//                   {startDate ? format(startDate, "LLL dd, y") : <span>Start date</span>}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <Calendar
//                   mode="single"
//                   selected={startDate}
//                   onSelect={(date) => handleDateSelect(date, true)}
//                   initialFocus
//                 />
//               </PopoverContent>
//             </Popover>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   id="end-date"
//                   variant={"outline"}
//                   className={cn(
//                     "w-full justify-start text-left font-normal",
//                     !endDate && "text-muted-foreground"
//                   )}
//                 >
//                   {endDate ? format(endDate, "LLL dd, y") : <span>End date</span>}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0" align="start">
//                 <Calendar
//                   mode="single"
//                   selected={endDate}
//                   onSelect={(date) => handleDateSelect(date, false)}
//                   initialFocus
//                 />
//               </PopoverContent>
//             </Popover>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <Button variant="outline" size="sm" onClick={() => applyPreset("yesterday")}>Yesterday</Button>
//             <Button variant="outline" size="sm" onClick={() => applyPreset("last3days")}>Last 3 days</Button>
//             <Button variant="outline" size="sm" onClick={() => applyPreset("lastWeek")}>Last week</Button>
//             <Button variant="outline" size="sm" onClick={() => applyPreset("lastMonth")}>Last month</Button>
//           </div>
//           <div className="text-sm text-muted-foreground">
//             Selected range: <span className="font-medium text-foreground">{inferDateRange()}</span>
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="ghost" onClick={clearDates} className="w-full sm:w-auto">
//             <X className="mr-2 h-4 w-4" />
//             Clear
//           </Button>
//           <Button type="submit" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
//             Apply Filter
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }