import { getSummaryOfTransactionPendingDebtAmount } from '@/calls/summary/transaction-pending';
import { listTransaction } from '@/calls/transactions';
import { listUser } from '@/calls/user';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { priceFormatter } from '@/utils/format';
import { NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

export const GET = defineApi(async (req) => {
  if (process.env.NODE_ENV === 'production'
    && req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return notAuthorized();
  }

  const users = await listUser();

  const recipients = users.filter((user) => user.config.notifications.silentDailyDebtReminder !== false);

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
  const debtAmount = await getSummaryOfTransactionPendingDebtAmount(
    ...transaction.map((transaction) => transaction.id),
  );

  const html = `<h1>Pengingat Pembayaran</h1>
<p>Berikut adalah 100 transaksi yang belum dibayar, seluruh data dapat dilihat di <a href="https://nextjs-cashier.vercel.app">aplikasi</a>:</p>
${transaction.map((transaction) => {
    const amount = debtAmount.find((item) => item.id === transaction.id)?.minus ?? 0;
    return `<div>
  <h3>${transaction.customer?.name || 'Tanpa Nama'}</h3>
  <div>Kontak: ${transaction.customer?.phone || '-'}</div>
  <div>
    <span>Tenggat bayar: ${transaction.dueDate?.toLocaleDateString('id') || '-'}</span>
    <span>Kekurangan: ${priceFormatter.format(amount)}</span>
  </div>
</div>`
  }).join('<hr />')}`;

  const { messageId } = await transporter.sendMail({
    from: '"Cashier App" <anh.dev7@gmail.com>',
    to: recipients.map((user) => user.email),
    subject: 'Pengingat Pembayaran',
    html,
  });

  return NextResponse.json({ data: messageId });
});