
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable, expensesTable } from '../db/schema';
import { type DeleteInput, type CreateTripInput, type CreateExpenseInput } from '../schema';
import { deleteTrip } from '../handlers/delete_trip';
import { eq } from 'drizzle-orm';

// Test input
const testDeleteInput: DeleteInput = {
  id: 1
};

const testTripInput: CreateTripInput = {
  name: 'Test Trip',
  destination: 'Paris',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-01-05'),
  description: 'A test trip',
  participants: 'John, Jane'
};

const testExpenseInput: CreateExpenseInput = {
  name: 'Hotel',
  amount: 150.00,
  currency: 'USD',
  expense_date: new Date('2024-01-01'),
  category: 'Accommodation',
  trip_id: 1
};

describe('deleteTrip', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a trip successfully', async () => {
    // Create a trip first
    await db.insert(tripsTable)
      .values({
        name: testTripInput.name,
        destination: testTripInput.destination,
        start_date: testTripInput.start_date.toISOString().split('T')[0],
        end_date: testTripInput.end_date.toISOString().split('T')[0],
        description: testTripInput.description,
        participants: testTripInput.participants
      })
      .execute();

    const result = await deleteTrip(testDeleteInput);

    expect(result.success).toBe(true);

    // Verify trip is deleted
    const trips = await db.select()
      .from(tripsTable)
      .where(eq(tripsTable.id, testDeleteInput.id))
      .execute();

    expect(trips).toHaveLength(0);
  });

  it('should return false when trip does not exist', async () => {
    const result = await deleteTrip({ id: 999 });

    expect(result.success).toBe(false);
  });

  it('should cascade delete associated expenses', async () => {
    // Create a trip first
    await db.insert(tripsTable)
      .values({
        name: testTripInput.name,
        destination: testTripInput.destination,
        start_date: testTripInput.start_date.toISOString().split('T')[0],
        end_date: testTripInput.end_date.toISOString().split('T')[0],
        description: testTripInput.description,
        participants: testTripInput.participants
      })
      .execute();

    // Create an expense for the trip
    await db.insert(expensesTable)
      .values({
        name: testExpenseInput.name,
        amount: testExpenseInput.amount.toString(),
        currency: testExpenseInput.currency,
        expense_date: testExpenseInput.expense_date.toISOString().split('T')[0],
        category: testExpenseInput.category,
        trip_id: testExpenseInput.trip_id
      })
      .execute();

    // Verify expense exists before deletion
    const expensesBefore = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.trip_id, testDeleteInput.id))
      .execute();

    expect(expensesBefore).toHaveLength(1);

    // Delete the trip
    const result = await deleteTrip(testDeleteInput);

    expect(result.success).toBe(true);

    // Verify trip is deleted
    const trips = await db.select()
      .from(tripsTable)
      .where(eq(tripsTable.id, testDeleteInput.id))
      .execute();

    expect(trips).toHaveLength(0);

    // Verify expenses are cascade deleted
    const expensesAfter = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.trip_id, testDeleteInput.id))
      .execute();

    expect(expensesAfter).toHaveLength(0);
  });
});
