'use client';

import { deleteCustomer, updateCustomer } from '@/calls/customers';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { customers } from '@/db/schema';
import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

interface CustomerDialogProps {
  trigger?: React.ReactNode;
  data: typeof customers.$inferSelect;
  onUpdate?: (data: typeof customers.$inferSelect) => void;
}

export function CustomerDialog({
  data,
  trigger = (<Button variant="outline">View Customer</Button>),
  onUpdate,
}: CustomerDialogProps) {
  const [isSaving, startSaving] = useTransition();
  const [isOpen, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: data, values: data });
  const onSubmit: SubmitHandler<typeof data> = ({ name, phone }) => {
    startSaving(async () => {
      await updateCustomer(data.id, { name, phone });
      onUpdate?.(data);
      setOpen(false);
    });
  };
  const onDeleteClick = () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kustomer ini?')) return;

    startSaving(async () => {
      await deleteCustomer(data.id);
      onUpdate?.(data);
      setOpen(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Kustomer</DialogTitle>
          <DialogDescription>Tinjau/Perbarui informasi kustomer</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" {...register('name', { required: true })} />
                {errors.name && <p className="text-red-500">This field is required.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Kontak</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && <p className="text-red-500">This field is required.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="created-at">Ditambahkan pada</Label>
                <Input id="created-at" defaultValue={data.createdAt.toLocaleString('id')} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="updated-at">Terakhir diperbarui</Label>
                <Input id="updated-at" defaultValue={data.updatedAt.toLocaleString('id')} disabled />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" className="min-h-[100px]" placeholder="Beri catatan untuk kustomer ini" disabled />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="destructive" className="mr-auto" onClick={onDeleteClick}>
              Hapus
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Tutup</Button>
            </DialogClose>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>

        {isSaving && <LoadingOverlay />}
      </DialogContent>
    </Dialog>
  );
}