import dynamic from 'next/dynamic';

// Importa o componente do cliente de forma dinâmica, desativando o SSR
const ReportsClientWithNoSSR = dynamic(
  () => import('./reports-client.jsx'),
  { 
    ssr: false,
    loading: () => <p className="p-4">Carregando relatório...</p> 
  }
);

export default function ReportsPage() {
  return (
    <ReportsClientWithNoSSR />
  );
}