import { Request, Response } from 'express';
import { prisma } from '../../../database/prisma';
import { AuthRequest } from '../../../types/user';

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const budgets = await prisma.financeBudget.findMany({
      include: {
        expenses: true
      }
    });
    return res.status(200).json({
      success: true,
      data: budgets
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching budgets.' }
    });
  }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
  const { name, amount } = req.body;
  if (!name || amount === undefined) {
    return res.status(400).json({
      success: false,
      error: { message: 'Budget name and amount are required.' }
    });
  }

  try {
    const budget = await prisma.financeBudget.create({
      data: {
        name,
        amount: parseFloat(amount),
        used: 0
      }
    });

    await prisma.auditLog.create({
      data: {
        category: 'SYSTEM',
        message: `Budget "${name}" created with limit ${amount}`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating budget.' }
    });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        budget: true
      },
      orderBy: {
        incurredAt: 'desc'
      }
    });
    return res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching expenses.' }
    });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  const { budgetId, description, amount } = req.body;
  if (!budgetId || !description || amount === undefined) {
    return res.status(400).json({
      success: false,
      error: { message: 'budgetId, description, and amount are required.' }
    });
  }

  try {
    const budget = await prisma.financeBudget.findUnique({
      where: { id: budgetId }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: { message: 'Budget not found.' }
      });
    }

    const expAmount = parseFloat(amount);

    // Create the expense and update budget usage in a transaction
    const [expense, updatedBudget] = await prisma.$transaction([
      prisma.expense.create({
        data: {
          budgetId,
          description,
          amount: expAmount
        }
      }),
      prisma.financeBudget.update({
        where: { id: budgetId },
        data: {
          used: {
            increment: expAmount
          }
        }
      })
    ]);

    await prisma.auditLog.create({
      data: {
        category: 'SYSTEM',
        message: `Expense "${description}" of ${expAmount} recorded under budget "${budget.name}"`,
        user: req.user?.name || 'System'
      }
    });

    return res.status(201).json({
      success: true,
      data: { expense, budget: updatedBudget }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating expense.' }
    });
  }
};
