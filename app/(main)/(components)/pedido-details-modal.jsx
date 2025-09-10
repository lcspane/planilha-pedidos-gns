// app/(main)/(components)/pedido-details-modal.jsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return "R$ 0,00";
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function PedidoDetailsModal({ pedido, isOpen, onOpenChange }) {
  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <DialogDescription>
            Informações completas sobre o pedido de {pedido.cliente}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-semibold text-muted-foreground">Situação</span>
            <span className="col-span-2">{pedido.situacao}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-semibold text-muted-foreground">Valor Total</span>
            <span className="col-span-2 font-bold">{formatCurrency(pedido.valorTotal)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-semibold text-muted-foreground">Cond. Pagamento</span>
            <span className="col-span-2">{pedido.condPagamento || 'Não informado'}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-semibold text-muted-foreground">Previsão Entrega</span>
            <span className="col-span-2">{pedido.previsao ? format(new Date(pedido.previsao), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informada'}</span>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-sm font-semibold text-muted-foreground">Observações</span>
            <p className="col-span-2 text-sm p-3 bg-muted rounded-md min-h-[80px]">
                {pedido.detalhes || 'Nenhuma observação.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}