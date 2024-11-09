'use client';
/**
 * TODO: Implements pagination
 */
interface PaginationBarProps {
  total: number;
};

export function PaginationBar({ total }: PaginationBarProps) {
  return (
    <div className="sticky bottom-0 inset-x-0 flex h-14 bg-white px-4 py-2 justify-between gap-4 shadow-t">
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan <b>{total}</b> hasil
        </div>
      </div>
    </div>
  );
}

// const MAX_PAGINATION_ITEMS = 3; // Excluding previous and next
// const PAGINATION_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// interface PaginationBarProps {
//   total: number;
//   perPage: number;
//   currentPage: number;
// };

// export function PaginationBar({ total, perPage }: PaginationBarProps) {
//   return (
//     <div className="sticky bottom-0 inset-x-0 flex h-14 bg-white px-4 py-2 justify-between gap-4 shadow-t">
//       <div className="flex items-center gap-2">
//         <div className="flex items-center gap-1.5">
//           <span className="text-sm">Menampilkan</span>
//           {/* <Select defaultValue={String(perPage)}>
//             <SelectTrigger className="w-[8ch]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {PAGINATION_PER_PAGE_OPTIONS.map((el) => (
//                 <SelectItem key={el} value={String(el)}>
//                   {el}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select> */}
//           <span className="text-sm">dari <b>{total}</b> transaksi</span>
//         </div>
//       </div>

//       {/* <div className="flex items-center gap-2">
//         <Pagination>
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious href="#" />
//             </PaginationItem>
//             {Array.from({ length: Math.ceil(total / perPage) }).map((_, i) => (
//               <PaginationItem key={i}>
//                 <PaginationLink href={`?page=${i + 1}`}>
//                   {i + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}

//             <PaginationItem>
//               <PaginationLink href="#">1</PaginationLink>
//             </PaginationItem>
//             <PaginationItem>
//               <PaginationEllipsis />
//             </PaginationItem>
//             <PaginationItem>
//               <PaginationNext href="#">
//                 <ChevronRight className="h-4 w-4" />
//               </PaginationNext>
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       </div> */}
//     </div>
//   );
// }