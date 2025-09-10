// app/(auth)/login/page.jsx
"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  // CORREÇÃO: O hook useSearchParams foi movido para o nível superior do componente.
  const searchParams = useSearchParams();

  useEffect(() => {
    const logoutReason = localStorage.getItem('logoutReason');
    if (logoutReason) {
      toast.info(logoutReason);
      localStorage.removeItem('logoutReason');
    }

    // A lógica que usa o hook agora está correta.
    const urlError = searchParams.get('error');
    if (urlError && !logoutReason) {
      // Usamos a mensagem de erro que vem da nossa própria API
      // Em vez de uma mensagem genérica
      setError(decodeURIComponent(urlError.replace(/\+/g, ' ')));
    }
  }, [searchParams]); // Adicionamos searchParams como dependência do useEffect

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <Package className="h-12 w-12 text-primary" />
            <h1 className="mt-6 text-3xl font-bold">Planilha de Pedidos</h1>
            <p className="mt-2 text-muted-foreground">
              GNS - Lucas Pane
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" disabled={isLoading} />
              <button type="button" className="absolute right-3 top-8 h-5 w-5 text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="text-center">
            <Link href="/" passHref>
              <Button variant="link" className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}