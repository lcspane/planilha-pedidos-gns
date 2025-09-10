// app/(main)/dashboard/settings/page.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Senha atual é obrigatória." }),
  newPassword: z.string().min(6, { message: "Nova senha deve ter no mínimo 6 caracteres." }),
});

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceConfig, setMaintenanceConfig] = useState({ maintenanceMode: false, maintenanceMessage: '' });

  useEffect(() => {
    if (isAdmin) {
      const fetchMaintenanceStatus = async () => {
        const response = await fetch('/api/settings/maintenance');
        const data = await response.json();
        setMaintenanceConfig(data);
      };
      fetchMaintenanceStatus();
    }
  }, [isAdmin]);

  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao alterar a senha.');
      }
      toast.success(result.message);
      passwordForm.reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceConfig),
      });
      if (!response.ok) throw new Error('Falha ao salvar configurações.');
      toast.success("Modo de manutenção atualizado com sucesso!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 flex-shrink-0">
        <h1 className="text-lg font-semibold md:text-2xl">Configurações</h1>
      </header>
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Use o formulário abaixo para alterar sua senha de login.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Modo de Manutenção</CardTitle>
                <CardDescription>
                  Quando ativado, apenas administradores podem fazer login no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceConfig.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setMaintenanceConfig(prev => ({ ...prev, maintenanceMode: checked }))
                    }
                  />
                  <Label htmlFor="maintenance-mode">Ativar Modo de Manutenção</Label>
                </div>
                {maintenanceConfig.maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Mensagem de Manutenção (Opcional)</Label>
                    <Input
                      id="maintenance-message"
                      placeholder="Ex: Sistema em atualização até as 15h."
                      value={maintenanceConfig.maintenanceMessage || ''}
                      onChange={(e) =>
                        setMaintenanceConfig(prev => ({ ...prev, maintenanceMessage: e.target.value }))
                      }
                    />
                  </div>
                )}
                <Button onClick={handleMaintenanceSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}