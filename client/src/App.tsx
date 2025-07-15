
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, MapPin, Users, Plus, Wallet, Plane } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { TripForm } from '@/components/TripForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { TripList } from '@/components/TripList';
import { ExpenseList } from '@/components/ExpenseList';
import type { Trip, Expense, CreateTripInput, CreateExpenseInput } from '../../server/src/schema';

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTripForm, setShowTripForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      const result = await trpc.getTrips.query();
      setTrips(result);
    } catch (error) {
      console.error('Failed to load trips:', error);
    }
  }, []);

  const loadExpensesForTrip = useCallback(async (tripId: number) => {
    try {
      const result = await trpc.getExpensesByTrip.query({ trip_id: tripId });
      setExpenses(result);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (selectedTrip) {
      loadExpensesForTrip(selectedTrip.id);
    }
  }, [selectedTrip, loadExpensesForTrip]);

  const handleCreateTrip = async (tripData: CreateTripInput) => {
    setIsLoading(true);
    try {
      const newTrip = await trpc.createTrip.mutate(tripData);
      setTrips((prev: Trip[]) => [...prev, newTrip]);
      setShowTripForm(false);
    } catch (error) {
      console.error('Failed to create trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async (expenseData: CreateExpenseInput) => {
    setIsLoading(true);
    try {
      const newExpense = await trpc.createExpense.mutate(expenseData);
      setExpenses((prev: Expense[]) => [...prev, newExpense]);
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    try {
      await trpc.deleteTrip.mutate({ id: tripId });
      setTrips((prev: Trip[]) => prev.filter((trip: Trip) => trip.id !== tripId));
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
        setExpenses([]);
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      await trpc.deleteExpense.mutate({ id: expenseId });
      setExpenses((prev: Expense[]) => prev.filter((expense: Expense) => expense.id !== expenseId));
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total: number, expense: Expense) => total + expense.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Travel Planner</h1>
          </div>
          <p className="text-gray-300">✈️ Plan your adventures and track your expenses</p>
        </div>

        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger 
              value="trips" 
              className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              🏝️ My Trips
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              💰 Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trips" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Trip List */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Your Trips
                  </CardTitle>
                  <Button 
                    onClick={() => setShowTripForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trip
                  </Button>
                </CardHeader>
                <CardContent>
                  <TripList 
                    trips={trips} 
                    selectedTrip={selectedTrip}
                    onSelectTrip={setSelectedTrip}
                    onDeleteTrip={handleDeleteTrip}
                  />
                </CardContent>
              </Card>

              {/* Trip Details */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTrip ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {selectedTrip.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-300 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedTrip.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 mb-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {selectedTrip.start_date.toLocaleDateString()} - {selectedTrip.end_date.toLocaleDateString()}
                          </span>
                        </div>
                        {selectedTrip.participants && (
                          <div className="flex items-center gap-2 text-gray-300 mb-2">
                            <Users className="h-4 w-4" />
                            <span>{selectedTrip.participants}</span>
                          </div>
                        )}
                      </div>
                      {selectedTrip.description && (
                        <div className="p-3 bg-gray-700 rounded-lg">
                          <p className="text-gray-300">{selectedTrip.description}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-gray-300">Total Expenses:</span>
                        <span className="text-xl font-bold text-green-400">
                          ${getTotalExpenses().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Select a trip to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Expenses {selectedTrip && `for ${selectedTrip.name}`}
                </CardTitle>
                <Button 
                  onClick={() => setShowExpenseForm(true)}
                  disabled={!selectedTrip}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                {selectedTrip ? (
                  <ExpenseList 
                    expenses={expenses}
                    onDeleteExpense={handleDeleteExpense}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select a trip to view and manage expenses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trip Form Dialog */}
        {showTripForm && (
          <TripForm
            onSubmit={handleCreateTrip}
            onCancel={() => setShowTripForm(false)}
            isLoading={isLoading}
          />
        )}

        {/* Expense Form Dialog */}
        {showExpenseForm && selectedTrip && (
          <ExpenseForm
            tripId={selectedTrip.id}
            onSubmit={handleCreateExpense}
            onCancel={() => setShowExpenseForm(false)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default App;
