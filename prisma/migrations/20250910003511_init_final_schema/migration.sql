-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "vendedorPadrao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "sessionToken" TEXT
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "situacao" TEXT NOT NULL,
    "contato" TEXT,
    "data" DATETIME NOT NULL,
    "cliente" TEXT NOT NULL,
    "referencia" TEXT,
    "vendedor" TEXT NOT NULL,
    "valorTotal" REAL NOT NULL,
    "confirmado" TEXT,
    "detalhes" TEXT,
    "previsao" DATETIME,
    "condPagamento" TEXT,
    "proximoContato" DATETIME
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
