
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { type CreateTripInput } from '../schema';
import { createTrip } from '../handlers/create_trip';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateTripInput = {
  name: 'Test Trip',
  destination: 'Tokyo, Japan',
  start_date: new Date('2024-06-01'),
  end_date: new Date('2024-06-10'),
  description: 'A wonderful trip to Tokyo',
  participants: 'John, Jane, Bob'
};

describe('createTrip', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a trip', async () => {
    const result = await createTrip(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Trip');
    expect(result.destination).toEqual('Tokyo, Japan');
    expect(result.start_date).toEqual(new Date('2024-06-01'));
    expect(result.end_date).toEqual(new Date('2024-06-10'));
    expect(result.description).toEqual('A wonderful trip to Tokyo');
    expect(result.participants).toEqual('John, Jane, Bob');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save trip to database', async () => {
    const result = await createTrip(testInput);

    // Query using proper drizzle syntax
    const trips = await db.select()
      .from(tripsTable)
      .where(eq(tripsTable.id, result.id))
      .execute();

    expect(trips).toHaveLength(1);
    expect(trips[0].name).toEqual('Test Trip');
    expect(trips[0].destination).toEqual('Tokyo, Japan');
    expect(trips[0].start_date).toEqual('2024-06-01'); // Date stored as string in DB
    expect(trips[0].end_date).toEqual('2024-06-10'); // Date stored as string in DB
    expect(trips[0].description).toEqual('A wonderful trip to Tokyo');
    expect(trips[0].participants).toEqual('John, Jane, Bob');
    expect(trips[0].created_at).toBeInstanceOf(Date);
    expect(trips[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description and participants', async () => {
    const inputWithNulls: CreateTripInput = {
      name: 'Minimal Trip',
      destination: 'Paris, France',
      start_date: new Date('2024-07-01'),
      end_date: new Date('2024-07-07'),
      description: null,
      participants: null
    };

    const result = await createTrip(inputWithNulls);

    expect(result.name).toEqual('Minimal Trip');
    expect(result.destination).toEqual('Paris, France');
    expect(result.description).toBeNull();
    expect(result.participants).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should handle same start and end dates', async () => {
    const sameDate = new Date('2024-08-15');
    const sameDateInput: CreateTripInput = {
      name: 'Day Trip',
      destination: 'Local Museum',
      start_date: sameDate,
      end_date: sameDate,
      description: 'Quick day trip',
      participants: 'Solo'
    };

    const result = await createTrip(sameDateInput);

    expect(result.start_date).toEqual(sameDate);
    expect(result.end_date).toEqual(sameDate);
    expect(result.name).toEqual('Day Trip');
  });
});
