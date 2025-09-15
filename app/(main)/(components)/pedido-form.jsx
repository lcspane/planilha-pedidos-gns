// app/(main)/(components)/pedido-form.jsx
'use client';

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./currency-input";

// ALTERADO: Refinamos a validação dos campos opcionais
const formSchema = z.object({
  // Campos Obrigatórios
  situacao: z.string().min(1, { message: "Situação é obrigatória." }),
  data: z.date({ required_error: "Data é obrigatória." }),
  cliente: z.string().min(1, { message: "Cliente é obrigatório." }),
  valorTotal: z.coerce.number().min(0, { message: "Valor Total é obrigatório e não pode ser negativo." }),

  // Campos Opcionais
  // .nullable().optional() permite que o campo seja nulo, indefinido ou uma string
  contato: z.string().nullable().optional(),
  referencia: z.string().nullable().optional(),
  confirmado: z.string().nullable().optional(),
  detalhes: z.string().nullable().optional(),
  previsao: z.date().nullable().optional(),
  condPagamento: z.string().nullable().optional(),
  proximoContato: z.date().nullable().optional(),
});

export function PedidoForm({ pedido, defaultDate, onSubmit, onCancel }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      situacao: "Orçamento",
      cliente: "",
      contato: "",
      referencia: "",
      valorTotal: 0,
      confirmado: "",
      data: defaultDate || new Date(),
      detalhes: "",
      previsao: null,
      condPagamento: "",
      proximoContato: null,
    },
  });

  useEffect(() => {
    const values = pedido
      ? { ...pedido, data: new Date(pedido.data), previsao: pedido.previsao ? new Date(pedido.previsao) : null, proximoContato: pedido.proximoContato ? new Date(pedido.proximoContato) : null }
      : {
          situacao: "Orçamento",
          cliente: "",
          contato: "",
          referencia: "",
          valorTotal: 0,
          confirmado: "",
          data: defaultDate ? new Date(defaultDate) : new Date(),
          detalhes: "",
          previsao: null,
          condPagamento: "",
          proximoContato: null,
        };
    form.reset(values);
  }, [pedido, defaultDate, form]);

  const handleFormSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="situacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situação <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Orçamento">Orçamento</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data <span className="text-red-500">*</span></FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value instanceof Date && !isNaN(field.value) ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cliente"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Cliente <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valorTotal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <CurrencyInput placeholder="R$ 0,00" value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contato"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contato</FormLabel>
              <FormControl>
                <Input placeholder="(Opcional)" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="referencia"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Referência</FormLabel>
              <FormControl>
                <Input placeholder="(Opcional)" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Confirmado</FormLabel>
              <FormControl>
                <Input placeholder="(Opcional)" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2 pt-4 border-t">
          <h3 className="text-lg font-semibold">Detalhes Adicionais</h3>
        </div>
        <FormField
          control={form.control}
          name="previsao"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Previsão de Entrega</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value instanceof Date && !isNaN(field.value) ? format(field.value, "PPP", { locale: ptBR }) : <span>Sem previsão</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condPagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condição de Pagamento</FormLabel>
              <FormControl>
                <Input placeholder="(Opcional)" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="detalhes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="(Opcional)" className="resize-y" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proximoContato"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Próximo Contato (Follow-up)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value instanceof Date && !isNaN(field.value) ? format(field.value, "PPP", { locale: ptBR }) : <span>Sem agendamento</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2 flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}