
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Trash2 } from 'lucide-react';
import type { Trip } from '../../../server/src/schema';

interface TripListProps {
  trips: Trip[];
  selectedTrip: Trip | null;
  onSelectTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: number) => void;
}

export function TripList({ trips, selectedTrip, onSelectTrip, onDeleteTrip }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No trips yet! Create your first adventure above 🚀</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {trips.map((trip: Trip) => (
        <Card 
          key={trip.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedTrip?.id === trip.id 
              ? 'bg-blue-600 border-blue-500' 
              : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
          }`}
          onClick={() => onSelectTrip(trip)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{trip.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-300 mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-300 mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {trip.start_date.toLocaleDateString()} - {trip.end_date.toLocaleDateString()}
                  </span>
                </div>
                {trip.participants && (
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Users className="h-3 w-3" />
                    <span>{trip.participants}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="bg-gray-600 text-gray-200">
                  {Math.ceil((trip.end_date.getTime() - trip.start_date.getTime()) / (1000 * 60 * 60 * 24))} days
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onDeleteTrip(trip.id);
                  }}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
