// lib/prisma.js
const { PrismaClient } = require('@prisma/client');

// Este padrão impede a criação de múltiplas instâncias do PrismaClient
// durante o hot reloading no ambiente de desenvolvimento.
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

module.exports = prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}