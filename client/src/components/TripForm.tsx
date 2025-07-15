
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, MapPin } from 'lucide-react';
import type { CreateTripInput } from '../../../server/src/schema';

interface TripFormProps {
  onSubmit: (data: CreateTripInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TripForm({ onSubmit, onCancel, isLoading = false }: TripFormProps) {
  const [formData, setFormData] = useState<CreateTripInput>({
    name: '',
    destination: '',
    start_date: new Date(),
    end_date: new Date(),
    description: null,
    participants: null
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
            <MapPin className="h-5 w-5" />
            ✈️ Create New Trip
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
              <Label htmlFor="name" className="text-gray-300">Trip Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateTripInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="🏖️ Summer Beach Vacation"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-gray-300">Destination</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateTripInput) => ({ ...prev, destination: e.target.value }))
                }
                placeholder="🌴 Bali, Indonesia"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-gray-300">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formatDateForInput(formData.start_date)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateTripInput) => ({ ...prev, start_date: new Date(e.target.value) }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="text-gray-300">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formatDateForInput(formData.end_date)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateTripInput) => ({ ...prev, end_date: new Date(e.target.value) }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="participants" className="text-gray-300">Participants (optional)</Label>
              <Input
                id="participants"
                value={formData.participants || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateTripInput) => ({ 
                    ...prev, 
                    participants: e.target.value || null 
                  }))
                }
                placeholder="👥 John, Sarah, Mike"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateTripInput) => ({ 
                    ...prev, 
                    description: e.target.value || null 
                  }))
                }
                placeholder="📝 A relaxing beach vacation to unwind and explore..."
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                rows={3}
              />
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
