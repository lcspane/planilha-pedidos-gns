// app/(main)/dashboard/settings/page.jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Download, AlertTriangle, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Senha atual é obrigatória." }),
  newPassword: z.string().min(6, { message: "Nova senha deve ter no mínimo 6 caracteres." }),
});

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [maintenanceConfig, setMaintenanceConfig] = useState({ maintenanceMode: false, maintenanceMessage: '' });
  const [restoreFile, setRestoreFile] = useState(null);
  const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false);
  const [deleteAllPassword, setDeleteAllPassword] = useState('');
  
  const dbFileInputRef = useRef(null);

  useEffect(() => { if (isAdmin) { const fetchMaintenanceStatus = async () => { try { const response = await fetch('/api/settings/maintenance'); if (!response.ok) return; const data = await response.json(); setMaintenanceConfig(data); } catch (error) { console.error("Falha ao buscar status de manutenção", error); } }; fetchMaintenanceStatus(); } }, [isAdmin]);
  const passwordForm = useForm({ resolver: zodResolver(passwordFormSchema), defaultValues: { currentPassword: "", newPassword: "" } });
  const onPasswordSubmit = async (data) => { setIsLoading(true); try { const response = await fetch('/api/user/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) { throw new Error(result.error || 'Falha ao alterar a senha.'); } toast.success(result.message); passwordForm.reset(); } catch (error) { toast.error(error.message); } finally { setIsLoading(false); } };
  const handleMaintenanceSave = async () => { setIsLoading(true); try { const response = await fetch('/api/settings/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(maintenanceConfig) }); if (!response.ok) throw new Error('Falha ao salvar configurações.'); toast.success("Modo de manutenção atualizado com sucesso!"); } catch (error) { toast.error(error.message); } finally { setIsLoading(false); } };
  const handleBackup = async () => { setIsDownloading(true); toast.info("Preparando o backup para download..."); try { const response = await fetch('/api/backup'); if (!response.ok) { const result = await response.json(); throw new Error(result.error || 'Falha ao gerar o backup.'); } const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); const contentDisposition = response.headers.get('content-disposition'); let fileName = 'backup.db'; if (contentDisposition) { const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i); if (fileNameMatch && fileNameMatch.length > 1) { fileName = fileNameMatch[1]; } } a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); toast.success("Backup autenticado baixado com sucesso!"); } catch (error) { toast.error(error.message); } finally { setIsDownloading(false); } };
  const handleRestoreFileChange = (event) => { const file = event.target.files[0]; if (file) { setRestoreFile(file); setIsRestoreAlertOpen(true); } };
  const handleRestoreConfirm = async () => { if (!restoreFile) return; setIsRestoring(true); toast.info("Restaurando backup... Por favor, aguarde."); const formData = new FormData(); formData.append('file', restoreFile); try { const response = await fetch('/api/restore', { method: 'POST', body: formData }); const result = await response.json(); if (!response.ok) { throw new Error(result.error || 'Falha ao restaurar o backup.'); } toast.success(result.message); toast.info("Você será desconectado para aplicar as mudanças."); setTimeout(() => signOut({ callbackUrl: '/login' }), 3000); } catch (error) { toast.error(error.message); setIsRestoring(false); } finally { setRestoreFile(null); if (dbFileInputRef.current) { dbFileInputRef.current.value = ""; } } };
  
  const handleDeleteAllConfirm = async () => {
    if (!deleteAllPassword) {
      toast.error("Por favor, digite sua senha para confirmar.");
      return;
    }
    try {
      const response = await fetch('/api/pedidos/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deleteAllPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast.success(result.message);
      setIsDeleteAllAlertOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteAllPassword('');
    }
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 flex-shrink-0"><h1 className="text-lg font-semibold md:text-2xl">Configurações</h1></header>
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="space-y-8">
          <Card><CardHeader><CardTitle>Alterar Senha</CardTitle><CardDescription>Use o formulário abaixo para alterar sua senha de login.</CardDescription></CardHeader><CardContent><Form {...passwordForm}><form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md"><FormField control={passwordForm.control} name="currentPassword" render={({ field }) => ( <FormItem><FormLabel>Senha Atual</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} /><FormField control={passwordForm.control} name="newPassword" render={({ field }) => ( <FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} /><Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}</Button></form></Form></CardContent></Card>
          {isAdmin && (
            <>
              <Card><CardHeader><CardTitle>Gerenciamento de Dados</CardTitle><CardDescription>Gerencie backups e restaure o sistema.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="pt-4 border-t"><h3 className="font-semibold mb-2">Backup Autenticado do Sistema</h3><p className="text-sm text-muted-foreground mb-2">Baixe um arquivo de backup seguro (.db) que é o único formato aceito para restauração.</p><Button onClick={handleBackup} disabled={isDownloading}>{isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isDownloading ? 'Gerando...' : <><Download className="mr-2 h-4 w-4" /> Baixar Backup Agora</>}</Button></div><div className="pt-4 border-t border-red-500"><h3 className="font-semibold mb-2 text-red-600">Restaurar Backup</h3><p className="text-sm text-muted-foreground mb-2"><strong className="text-red-700">Atenção:</strong> Todos os dados atuais serão substituídos.</p><Input id="db-upload" type="file" accept=".db" ref={dbFileInputRef} onChange={handleRestoreFileChange} className="max-w-md" disabled={isRestoring} />{isRestoring && <p className="text-sm text-muted-foreground mt-2 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Restaurando, não feche esta página...</p>}</div></CardContent></Card>
              <Card className="border-red-500"><CardHeader><CardTitle className="text-red-600">Zona de Perigo</CardTitle><CardDescription>Ações irreversíveis. Tenha muito cuidado.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="pt-4 border-t border-red-200"><h3 className="font-semibold mb-2">Excluir Todos os Meus Pedidos</h3><p className="text-sm text-muted-foreground mb-2">Esta ação irá deletar permanentemente <strong className="text-red-700">todos os seus pedidos</strong>. Os pedidos de outros vendedores não serão afetados.</p><Button variant="destructive" onClick={() => setIsDeleteAllAlertOpen(true)}>Excluir Meus Pedidos</Button></div></CardContent></Card>
              <Card><CardHeader><CardTitle>Modo de Manutenção</CardTitle><CardDescription>Quando ativado, apenas administradores podem fazer login.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex items-center space-x-2"><Switch id="maintenance-mode" checked={maintenanceConfig.maintenanceMode} onCheckedChange={(checked) => setMaintenanceConfig(prev => ({ ...prev, maintenanceMode: checked }))} /><Label htmlFor="maintenance-mode">Ativar Modo de Manutenção</Label></div>{maintenanceConfig.maintenanceMode && (<div className="space-y-2"><Label htmlFor="maintenance-message">Mensagem de Manutenção (Opcional)</Label><Input id="maintenance-message" placeholder="Ex: Sistema em atualização até as 15h." value={maintenanceConfig.maintenanceMessage || ''} onChange={(e) => setMaintenanceConfig(prev => ({ ...prev, maintenanceMessage: e.target.value }))} /></div>)}<Button onClick={handleMaintenanceSave} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isLoading ? 'Salvando...' : 'Salvar Configurações'}</Button></CardContent></Card>
            </>
          )}
        </div>
      </main>
      <AlertDialog open={isRestoreAlertOpen} onOpenChange={setIsRestoreAlertOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500" />Atenção! Ação Irreversível</AlertDialogTitle><AlertDialogDescription>Você está prestes a restaurar um backup. Todos os dados inseridos após a data deste backup serão permanentemente perdidos. Você tem certeza de que deseja continuar?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => { setRestoreFile(null); if (dbFileInputRef.current) { dbFileInputRef.current.value = ""; } }}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleRestoreConfirm} className="bg-red-600 hover:bg-red-700">Sim, Restaurar Backup</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={isDeleteAllAlertOpen} onOpenChange={setIsDeleteAllAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir todos os seus pedidos?</AlertDialogTitle><AlertDialogDescription>Esta ação é irreversível e irá deletar todos os pedidos associados ao vendedor "{session?.user?.vendedor}". Para confirmar, digite sua senha.</AlertDialogDescription></AlertDialogHeader>
          <div className="py-2"><Input type="password" placeholder="Digite sua senha" value={deleteAllPassword} onChange={(e) => setDeleteAllPassword(e.target.value)} /></div>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setDeleteAllPassword('')}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteAllConfirm} className="bg-red-600 hover:bg-red-700">Confirmar Exclusão Total</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}