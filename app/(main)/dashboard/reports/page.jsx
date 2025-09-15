import { Suspense } from 'react';
import ReportsClient from './reports-client.jsx';

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Carregando relatório...</div>}>
      <ReportsClient />
    </Suspense>
  );
}