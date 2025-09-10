// app/global-error.jsx
'use client'; // Páginas de erro precisam ser Client Components

import { Button } from '@/components/ui/button';
import { ServerCrash } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <ServerCrash className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Algo deu errado!</h2>
          <p className="text-muted-foreground mb-6">
            Ocorreu um erro inesperado no servidor. Por favor, tente novamente.
          </p>
          <Button onClick={() => reset()}>Tentar Novamente</Button>
        </div>
      </body>
    </html>
  );
}