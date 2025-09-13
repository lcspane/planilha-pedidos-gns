// app/(main)/(components)/import-modal.jsx
"use client";

import { useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const SYSTEM_FIELDS = [
  { key: 'situacao', label: 'Situação', required: true },
  { key: 'data', label: 'Data', required: true },
  { key: 'cliente', label: 'Cliente', required: true },
  { key: 'valorTotal', label: 'Valor Total', required: true },
  { key: 'contato', label: 'Contato', required: false },
  { key: 'referencia', label: 'Referência', required: false },
];

export function ImportModal({ isOpen, onOpenChange, onImportSuccess }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importErrors, setImportErrors] = useState([]);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    Papa.parse(selectedFile, {
      header: true,
      preview: 1,
      complete: (results) => {
        const detectedHeaders = results.meta.fields || [];
        setHeaders(detectedHeaders);
        const initialMapping = {};
        SYSTEM_FIELDS.forEach(field => {
          const fieldKeywords = {
            situacao: ['situação', 'status'],
            data: ['data'],
            cliente: ['cliente', 'empresa'],
            valorTotal: ['valor', 'total'],
            contato: ['contato', 'telefone'],
            referencia: ['referência', 'ref', 'omie', 'pdv'],
          };
          const foundHeader = detectedHeaders.find(h => 
            fieldKeywords[field.key].some(keyword => 
              h.toLowerCase().includes(keyword)
            )
          );
          if (foundHeader) {
            initialMapping[field.key] = foundHeader;
          }
        });
        setMapping(initialMapping);
        setStep(2);
      }
    });
  };

  const handleMappingChange = (systemField, fileHeader) => {
    setMapping(prev => ({ ...prev, [systemField]: fileHeader }));
  };

  const handleImport = async () => {
    setStep(3);
    setImportErrors([]);
    toast.info("Iniciando importação...");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    try {
      const response = await fetch('/api/import', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) {
        if (result.details) setImportErrors(result.details);
        throw new Error(result.error || 'Falha ao importar o arquivo.');
      }
      toast.success(result.message);
      onImportSuccess();
      closeModal();
    } catch (error) {
      toast.error(error.message);
      setStep(2);
    }
  };

  const closeModal = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setMapping({});
    setImportErrors([]);
    onOpenChange(false);
  };
  
  const isMappingValid = SYSTEM_FIELDS.every(field => field.required ? !!mapping[field.key] && mapping[field.key] !== '--ignore--' : true);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Pedidos de Planilha (CSV)</DialogTitle>
          <DialogDescription>
            {step === 1 && "Selecione o arquivo .csv que você deseja importar."}
            {step === 2 && "Associe as colunas da sua planilha com os campos do sistema."}
            {step === 3 && "Aguarde enquanto os dados estão sendo processados e importados."}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="p-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-48">
            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileSelect} className="w-full" />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Dica: A coluna 'Situação' deve conter um dos seguintes valores: Orçamento, Pendente, Finalizado, Cancelado.
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">O sistema tentou adivinhar as colunas. Por favor, verifique e ajuste se necessário.</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo do Sistema</TableHead>
                  <TableHead>Coluna da Sua Planilha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SYSTEM_FIELDS.map(field => (
                  <TableRow key={field.key}>
                    <TableCell className="font-medium">{field.label} {field.required && <span className="text-red-500">*</span>}</TableCell>
                    <TableCell>
                      <Select value={mapping[field.key]} onValueChange={(value) => handleMappingChange(field.key, value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione uma coluna..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="--ignore--">-- Ignorar esta coluna --</SelectItem>
                          {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {importErrors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erros na Última Tentativa</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 max-h-40 overflow-y-auto">{importErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Importando dados... Isso pode levar alguns instantes.</p>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
          {step === 2 && <Button onClick={handleImport} disabled={!isMappingValid}>{!isMappingValid ? "Preencha os campos obrigatórios" : "Importar Dados"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}