// import type { ProductFieldValues } from '@/components/product-form';
// import { useFieldArray, useFormContext } from 'react-hook-form';

// export function ProductVariantField() {
//   const { control, watch } = useFormContext<ProductFieldValues>();
//   const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
//   const variants = watch('variants');

//   return (
//     <>
//       {fields.map((field, index) => (
//         <VariantField
//           key={field.id}
//           index={index}
//           onRemoveClick={() => remove(index)}
//         />
//       ))}

//       <button
//         type="button"
//         disabled={variants?.at(-1)?.name === ''}
//         onClick={() => append({ name: '', attrs: { price: 0 } })}
//       >
//         Tambah Varian
//       </button>
//     </>
//   );
// }

// interface VariantFieldProps {
//   index: number;
//   onRemoveClick?: () => void;
// }

// function VariantField({ index, onRemoveClick }: VariantFieldProps) {
//   const { register } = useFormContext<ProductFieldValues>();

//   return (
//     <div className="flex">
//       <fieldset>
//         <label>
//           Nama Varian
//           <input
//             type="text"
//             id={`product/variants/${index}/name`}
//             required
//             {...register(`variants.${index}.name`, { required: true })}
//             className="px-3 py-2 border rounded"
//           />
//         </label>
//       </fieldset>

//       <fieldset>
//         <label>
//           Harga
//           <input
//             type="number"
//             id={`product/variants/${index}/attrs/price`}
//             required
//             {...register(`variants.${index}.attrs.price`, { required: true, valueAsNumber: true, min: 0 })}
//             className="px-3 py-2 border rounded"
//           />
//         </label>
//       </fieldset>

//       <div className="flex">
//         <button
//           type="button"
//           aria-label="Hapus"
//           onClick={() => onRemoveClick?.()}
//         >
//           <span className="iconify mdi--delete" />
//         </button>
//       </div>
//     </div>
//   );
// }

export { }