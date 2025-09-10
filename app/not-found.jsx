// app/not-found.jsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileWarning } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <FileWarning className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-4xl font-bold mb-2">Erro 404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página Não Encontrada</h2>
      <p className="text-muted-foreground mb-6">
        A página que você está tentando acessar não existe ou foi movida.
      </p>
      <Link href="/">
        <Button>Voltar para a Página Inicial</Button>
      </Link>
    </div>
  );
}