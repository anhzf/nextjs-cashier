import { listTransaction } from '@/calls/transactions';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

export const GET = defineApi(async (req) => {
  const recipient = process.env.NOTIFY_RECIPIENT;
  if (!recipient) return NextResponse.json({ data: 'Recipient not set' });
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) return notAuthorized();

  const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_TLS === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const transaction = await listTransaction({
    status: 'pending',
    sortBy: 'createdAt',
    sort: 'desc',
    limit: 100,
    includes: ['customer'],
  });

  const html = `<h1>Pengingat Pembayaran</h1>
<p>Berikut adalah 100 transaksi yang belum dibayar, seluruh data dapat dilihat di <a href="https://nextjs-cashier.vercel.app">aplikasi</a>:</p>
${transaction.map((transaction) => `<div>
  <h3>${transaction.customer?.name || 'Tanpa Nama'}</h3>
  <div>Kontak: ${transaction.customer?.phone || '-'}</div>
  <div>Tenggat bayar: ${transaction.dueDate?.toLocaleDateString('id') || '-'}</div>
</div>`).join('<hr />')}`;

  const { messageId } = await transporter.sendMail({
    from: '"Cashier App" <anh.dev7@gmail.com>',
    to: recipient,
    subject: 'Pengingat Pembayaran',
    html,
  });

  return NextResponse.json({ data: messageId });
});