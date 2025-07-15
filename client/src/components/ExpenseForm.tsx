
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, DollarSign } from 'lucide-react';
import type { CreateExpenseInput, ExpenseCategory } from '../../../server/src/schema';

interface ExpenseFormProps {
  tripId: number;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const categoryEmojis: Record<ExpenseCategory, string> = {
  'Food': '🍕',
  'Accommodation': '🏨',
  'Transport': '🚗',
  'Activities': '🎢',
  'Other': '📦'
};

export function ExpenseForm({ tripId, onSubmit, onCancel, isLoading = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState<CreateExpenseInput>({
    name: '',
    amount: 0,
    currency: 'USD',
    expense_date: new Date(),
    category: 'Food',
    trip_id: tripId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            💰 Add Expense
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Expense Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateExpenseInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="🍕 Lunch at beachside restaurant"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateExpenseInput) => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateExpenseInput) => ({ ...prev, currency: e.target.value }))
                  }
                  placeholder="USD"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expense_date" className="text-gray-300">Expense Date</Label>
              <Input
                id="expense_date"
                type="date"
                value={formatDateForInput(formData.expense_date)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateExpenseInput) => ({ 
                    ...prev, 
                    expense_date: new Date(e.target.value) 
                  }))
                }
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-300">Category</Label>
              <Select
                value={formData.category || 'Food'}
                onValueChange={(value: ExpenseCategory) =>
                  setFormData((prev: CreateExpenseInput) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {Object.entries(categoryEmojis).map(([category, emoji]) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="text-white hover:bg-gray-600"
                    >
                      {emoji} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
