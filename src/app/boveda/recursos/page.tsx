import VaultUI from '@/components/VaultUI';
import { getVaultResources } from './actions';
import NotionEditor from '@/components/NotionEditor';
import { getPageContent } from '@/core/usecases/pageUsecases';

export default async function Page() {
  const resources = await getVaultResources();
  const initialContent = await getPageContent('/boveda/recursos');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Bóveda de Recursos</h1>
        <p className="page-subtitle">Repositorio de conocimiento y multimedia</p>
      </header>

      {/* Interactive Media Vault */}
      <VaultUI initialResources={resources as any} />

      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', margin: '2rem 0' }} />

      {/* Notion-Like Free Text Area for unstructured notes */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', opacity: 0.5 }}>Notas Desestructuradas</h3>
        <NotionEditor initialContent={initialContent} route="/boveda/recursos" />
      </div>
    </div>
  );
}
