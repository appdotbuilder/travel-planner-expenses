
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trash2 } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../../../server/src/schema';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: number) => void;
}

const categoryEmojis: Record<ExpenseCategory, string> = {
  'Food': '🍕',
  'Accommodation': '🏨',
  'Transport': '🚗',
  'Activities': '🎢',
  'Other': '📦'
};

const categoryColors: Record<ExpenseCategory, string> = {
  'Food': 'bg-orange-600',
  'Accommodation': 'bg-blue-600',
  'Transport': 'bg-green-600',
  'Activities': 'bg-purple-600',
  'Other': 'bg-gray-600'
};

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">💰</div>
        <p className="text-gray-400">No expenses recorded yet! Add your first expense above</p>
      </div>
    );
  }

  const totalAmount = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-4">
      {/* Total Summary */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Total Expenses:</span>
          <span className="text-2xl font-bold text-green-400">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {expenses.map((expense: Expense) => (
          <Card key={expense.id} className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${categoryColors[expense.category]} text-white`}>
                      {categoryEmojis[expense.category]} {expense.category}
                    </Badge>
                    <span className="text-lg font-semibold text-white">
                      {expense.amount.toFixed(2)} {expense.currency}
                    </span>
                  </div>
                  <h3  className="font-medium text-white mb-1">{expense.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Calendar className="h-3 w-3" />
                    <span>{expense.expense_date.toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteExpense(expense.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
