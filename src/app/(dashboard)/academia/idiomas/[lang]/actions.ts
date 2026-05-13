'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function addWord(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const lang = formData.get('lang') as string;
  const word = formData.get('word') as string;
  const translation = formData.get('translation') as string;
  const precision = formData.get('precision') as string || 'medium';
  const topic = formData.get('topic') as string || '';

  if (!lang || !word || !translation) return;

  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO language_words (id, user_id, lang, word, translation, precision, topic) VALUES (@id, @userId, @lang, @word, @translation, @precision, @topic)`)
    .run({ id, userId, lang, word, translation, precision, topic });

  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function deleteWord(id: string, lang: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.prepare('DELETE FROM language_words WHERE id = @id AND user_id = @userId').run({ id, userId });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function addResource(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const lang = formData.get('lang') as string;
  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const type = formData.get('type') as string || 'SITIO';
  const skill = formData.get('skill') as string || '';

  if (!lang || !title || !url) return;

  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO language_resources (id, user_id, lang, title, url, type, skill) VALUES (@id, @userId, @lang, @title, @url, @type, @skill)`)
    .run({ id, userId, lang, title, url, type, skill });

  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function deleteResource(id: string, lang: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.prepare('DELETE FROM language_resources WHERE id = @id AND user_id = @userId').run({ id, userId });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function updateSkillLevel(lang: string, skill: string, level: number) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const id = crypto.randomUUID();
  await db.prepare(`
    INSERT INTO language_skills (id, user_id, lang, skill, level) VALUES (@id, @userId, @lang, @skill, @level)
    ON CONFLICT(user_id, lang, skill) DO UPDATE SET level = @level
  `).run({ id, userId, lang, skill, level });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function addTopic(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  const lang = formData.get('lang') as string;
  const title = formData.get('title') as string;
  if (!lang || !title) return;
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO language_topics (id, user_id, lang, title) VALUES (@id, @userId, @lang, @title)`)
    .run({ id, userId, lang, title });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function updateTopicContent(id: string, lang: string, content: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.prepare('UPDATE language_topics SET content = @content WHERE id = @id AND user_id = @userId').run({ id, content, userId });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function deleteTopic(id: string, lang: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Unauthorized");

  await db.prepare('DELETE FROM language_topics WHERE id = @id AND user_id = @userId').run({ id, userId });
  revalidatePath(`/academia/idiomas/${lang}`);
}
