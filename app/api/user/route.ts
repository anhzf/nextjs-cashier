import { createUser } from '@/calls/user';
import { db } from '@/db';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const GET = async () => {
  const users = await db.query.users.findMany({
    columns: {
      password: false,
    },
  });
  return NextResponse.json({ data: users });
};

export const POST = async (req: Request) => {
  const Schema = v.object({
    name: v.pipe(v.string('Name is required'), v.minLength(3, 'Name should be more than 3 characters'), v.maxLength(32, 'Name should be less than 32 characters')),
    email: v.pipe(v.string('Email is required'), v.email()),
    password: v.pipe(v.string(), v.minLength(8, 'Password should more than 8 characters'), v.maxLength(32, 'Password should be less than 32 characters')),
  });

  const { name, email, password } = v.parse(Schema, await req.json());

  const created = await createUser(name, email, password);

  return NextResponse.json({
    message: 'User created successfully',
    data: created,
  });
};