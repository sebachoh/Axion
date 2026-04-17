'use server';

import db from '@/infrastructure/db/sqlite';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function addWord(formData: FormData) {
  const lang = formData.get('lang') as string;
  const word = formData.get('word') as string;
  const translation = formData.get('translation') as string;
  const precision = formData.get('precision') as string || 'medium';
  const topic = formData.get('topic') as string || '';

  if (!lang || !word || !translation) return;

  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO language_words (id, lang, word, translation, precision, topic) VALUES (@id, @lang, @word, @translation, @precision, @topic)`)
    .run({ id, lang, word, translation, precision, topic });

  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function deleteWord(id: string, lang: string) {
  db.prepare('DELETE FROM language_words WHERE id = @id').run({ id });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function addResource(formData: FormData) {
  const lang = formData.get('lang') as string;
  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const type = formData.get('type') as string || 'SITIO';
  const skill = formData.get('skill') as string || '';

  if (!lang || !title || !url) return;

  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO language_resources (id, lang, title, url, type, skill) VALUES (@id, @lang, @title, @url, @type, @skill)`)
    .run({ id, lang, title, url, type, skill });

  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function deleteResource(id: string, lang: string) {
  db.prepare('DELETE FROM language_resources WHERE id = @id').run({ id });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function updateSkillLevel(lang: string, skill: string, level: number) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO language_skills (id, lang, skill, level) VALUES (@id, @lang, @skill, @level)
    ON CONFLICT(lang, skill) DO UPDATE SET level = @level
  `).run({ id, lang, skill, level });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function addTopic(formData: FormData) {
  const lang = formData.get('lang') as string;
  const title = formData.get('title') as string;
  if (!lang || !title) return;
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO language_topics (id, lang, title) VALUES (@id, @lang, @title)`)
    .run({ id, lang, title });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function updateTopicContent(id: string, lang: string, content: string) {
  db.prepare('UPDATE language_topics SET content = @content WHERE id = @id').run({ id, content });
  revalidatePath(`/academia/idiomas/${lang}`);
}

export async function deleteTopic(id: string, lang: string) {
  db.prepare('DELETE FROM language_topics WHERE id = @id').run({ id });
  revalidatePath(`/academia/idiomas/${lang}`);
}
