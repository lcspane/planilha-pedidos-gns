'use client';

import dynamic from 'next/dynamic';

// A lógica da importação dinâmica agora vive dentro de um Componente de Cliente.
const ReportsClientWithNoSSR = dynamic(
  () => import('./reports-client.jsx'),
  { 
    ssr: false,
    loading: () => <p className="p-4">Carregando relatório...</p> 
  }
);

export default function ReportsLoader() {
  return <ReportsClientWithNoSSR />;
}