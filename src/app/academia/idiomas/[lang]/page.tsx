import db from '@/infrastructure/db/sqlite';
import { notFound } from 'next/navigation';
import LanguagePortal, { LangWord, LangResource, LangSkill, LangConfig, LangTopic } from '@/components/LanguagePortal';

const LANG_CONFIGS: Record<string, LangConfig> = {
  frances: {
    name: 'Francés',
    slug: 'frances',
    flag: '🇫🇷',
    bannerUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    countryOutlineUrl: '',
    accentColor: '#4a90d9',
    speakers: '300 millones',
  },
  portugues: {
    name: 'Portugués',
    slug: 'portugues',
    flag: '🇵🇹',
    bannerUrl: 'https://images.unsplash.com/photo-1588598177968-48bd76048698?w=1200&q=80',
    countryOutlineUrl: '',
    accentColor: '#e74c3c',
    speakers: '250 millones',
  },
  darija: {
    name: 'Darija',
    slug: 'darija',
    flag: '🇲🇦',
    bannerUrl: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1400&q=80',
    countryOutlineUrl: '',
    accentColor: '#e67e22',
    speakers: '30 millones',
  },
  aleman: {
    name: 'Alemán',
    slug: 'aleman',
    flag: '🇩🇪',
    bannerUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
    countryOutlineUrl: '',
    accentColor: '#d4ac0d',
    speakers: '130 millones',
  },
  italiano: {
    name: 'Italiano',
    slug: 'italiano',
    flag: '🇮🇹',
    bannerUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80',
    countryOutlineUrl: '',
    accentColor: '#27ae60',
    speakers: '65 millones',
  },
};

export async function generateStaticParams() {
  return Object.keys(LANG_CONFIGS).map(lang => ({ lang }));
}

function getWords(lang: string): LangWord[] {
  const rows = db.prepare('SELECT id, lang, word, translation, precision, topic, created_at as createdAt FROM language_words WHERE lang = @lang ORDER BY created_at DESC').all({ lang }) as any[];
  return rows.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
}

function getResources(lang: string): LangResource[] {
  const rows = db.prepare('SELECT id, lang, title, url, type, skill, created_at as createdAt FROM language_resources WHERE lang = @lang ORDER BY created_at DESC').all({ lang }) as any[];
  return rows.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
}

function getSkills(lang: string): LangSkill[] {
  const rows = db.prepare('SELECT skill, level FROM language_skills WHERE lang = @lang').all({ lang }) as any[];
  return rows;
}

function getTopics(lang: string): LangTopic[] {
  const rows = db.prepare('SELECT id, lang, title, content, created_at as createdAt FROM language_topics WHERE lang = @lang ORDER BY created_at ASC').all({ lang }) as any[];
  return rows.map(r => ({ ...r, createdAt: new Date(r.createdAt) }));
}

export default async function LangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const config = LANG_CONFIGS[lang];
  if (!config) notFound();

  const words = getWords(lang);
  const resources = getResources(lang);
  const skills = getSkills(lang);
  const topics = getTopics(lang);

  return (
    <LanguagePortal
      config={config}
      words={words}
      resources={resources}
      skills={skills}
      topics={topics}
    />
  );
}
