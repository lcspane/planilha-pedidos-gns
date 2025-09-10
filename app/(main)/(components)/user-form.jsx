// app/(main)/(components)/user-form.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

const userFormSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  // A senha é opcional ao editar, mas obrigatória ao criar
  password: z.string().optional(),
  vendedorPadrao: z.string().min(1, { message: "Nome do vendedor é obrigatório." }),
  role: z.enum(["USER", "ADMIN"]),
  status: z.enum(["ATIVO", "BLOQUEADO"]),
});

export function UserForm({ user, onSubmit, onCancel }) {
  const isEditing = !!user;

  const form = useForm({
    resolver: zodResolver(userFormSchema),
  });

  useEffect(() => {
    // Popula o formulário quando o usuário a ser editado é definido
    if (isEditing) {
      form.reset({
        email: user.email,
        vendedorPadrao: user.vendedorPadrao,
        role: user.role,
        status: user.status,
        password: '', // Senha sempre começa vazia por segurança
      });
    } else {
      form.reset({
        email: '',
        vendedorPadrao: '',
        role: 'USER',
        status: 'ATIVO',
        password: '',
      });
    }
  }, [user, form, isEditing]);

  const handleFormSubmit = form.handleSubmit((data) => {
    // Garante que a senha seja obrigatória ao criar
    if (!isEditing && !data.password) {
      form.setError("password", { type: "manual", message: "A senha é obrigatória para novos usuários." });
      return;
    }
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" placeholder={isEditing ? 'Deixe em branco para não alterar' : 'Senha inicial'} {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="vendedorPadrao" render={({ field }) => ( <FormItem><FormLabel>Vendedor Padrão</FormLabel><FormControl><Input placeholder="Nome do Vendedor" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="role" render={({ field }) => ( <FormItem><FormLabel>Permissão</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USER">Usuário</SelectItem><SelectItem value="ADMIN">Administrador</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ATIVO">Ativo</SelectItem><SelectItem value="BLOQUEADO">Bloqueado</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
        <div className="md:col-span-2 flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar Usuário</Button>
        </div>
      </form>
    </Form>
  );
}