import { prisma } from "./prisma";
// Relational transactions helper
export const runInTransaction = async (callback: (tx: any) => Promise<any>) => {
  return prisma.$transaction(callback);
};
