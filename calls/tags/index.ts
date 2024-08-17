'use server';

import { db } from '@/db';
import { tags } from '@/db/schema';
import { pick } from '@/utils/object';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

type Tag = typeof tags.$inferSelect;

export const listTag = async (): Promise<Tag[]> => {
  const results = await db.query.tags.findMany();
  return results;
};

export const getTag = async (id: number): Promise<Tag> => {
  const result = await db.query.tags.findFirst({
    where: eq(tags.id, id),
  });

  if (!result) return notFound();

  return result;
};

const ALLOWED_TAG_INSERT_FIELDS = ['name'] satisfies (keyof typeof tags.$inferInsert)[];

type CreateTagData = Pick<typeof tags.$inferInsert, typeof ALLOWED_TAG_INSERT_FIELDS[number]>;

export const createTag = async (data: CreateTagData): Promise<number> => {
  const [tag] = await db.insert(tags).values(
    pick(data, ALLOWED_TAG_INSERT_FIELDS),
  ).returning({
    id: tags.id,
  });

  return tag.id;
};

const ALLOWED_TAG_UPDATE_FIELDS = ALLOWED_TAG_INSERT_FIELDS;

type UpdateTagData = CreateTagData;

export const updateTag = async (id: number, data: UpdateTagData): Promise<void> => {
  const [result] = await db.update(tags).set(
    pick(data, ALLOWED_TAG_UPDATE_FIELDS),
  ).where(eq(tags.id, id))
    .returning({
      id: tags.id,
    });

  if (!result) return notFound();
};

export const deleteTag = async (id: number): Promise<void> => {
  const [result] = await db.delete(tags).where(eq(tags.id, id)).returning({
    id: tags.id,
  });

  if (!result) return notFound();
};