
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { getTripById } from '../handlers/get_trip_by_id';

describe('getTripById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a trip when found', async () => {
    // Create a test trip
    const testTrip = {
      name: 'Test Trip',
      destination: 'Test Destination',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      description: 'A test trip',
      participants: 'Alice, Bob'
    };

    const insertResult = await db.insert(tripsTable)
      .values(testTrip)
      .returning()
      .execute();

    const tripId = insertResult[0].id;

    // Test the handler
    const result = await getTripById(tripId);

    expect(result).toBeDefined();
    expect(result?.id).toBe(tripId);
    expect(result?.name).toBe('Test Trip');
    expect(result?.destination).toBe('Test Destination');
    expect(result?.start_date).toBeInstanceOf(Date);
    expect(result?.end_date).toBeInstanceOf(Date);
    expect(result?.description).toBe('A test trip');
    expect(result?.participants).toBe('Alice, Bob');
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when trip is not found', async () => {
    const result = await getTripById(999);
    expect(result).toBeNull();
  });

  it('should return trip with null optional fields', async () => {
    // Create a trip with null optional fields
    const testTrip = {
      name: 'Minimal Trip',
      destination: 'Minimal Destination',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      description: null,
      participants: null
    };

    const insertResult = await db.insert(tripsTable)
      .values(testTrip)
      .returning()
      .execute();

    const tripId = insertResult[0].id;

    const result = await getTripById(tripId);

    expect(result).toBeDefined();
    expect(result?.id).toBe(tripId);
    expect(result?.name).toBe('Minimal Trip');
    expect(result?.destination).toBe('Minimal Destination');
    expect(result?.description).toBeNull();
    expect(result?.participants).toBeNull();
  });
});
