
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { getTrips } from '../handlers/get_trips';

describe('getTrips', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no trips exist', async () => {
    const result = await getTrips();
    expect(result).toEqual([]);
  });

  it('should return all trips ordered by creation date', async () => {
    // Create first trip
    await db.insert(tripsTable).values({
      name: 'First Trip',
      destination: 'Paris',
      start_date: '2024-01-01',
      end_date: '2024-01-05',
      description: 'First trip description',
      participants: 'Alice, Bob'
    }).execute();

    // Add small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second trip
    await db.insert(tripsTable).values({
      name: 'Second Trip',
      destination: 'Tokyo',
      start_date: '2024-02-01',
      end_date: '2024-02-10',
      description: 'Second trip description',
      participants: 'Charlie, Diana'
    }).execute();

    const result = await getTrips();

    expect(result).toHaveLength(2);
    
    // Check that trips are ordered by creation date (newest first)
    expect(result[0].name).toEqual('Second Trip');
    expect(result[1].name).toEqual('First Trip');
    
    // Verify all fields are present and dates are converted
    expect(result[0].destination).toEqual('Tokyo');
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].end_date).toBeInstanceOf(Date);
    expect(result[0].start_date).toEqual(new Date('2024-02-01'));
    expect(result[0].end_date).toEqual(new Date('2024-02-10'));
    expect(result[0].description).toEqual('Second trip description');
    expect(result[0].participants).toEqual('Charlie, Diana');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should handle nullable fields correctly', async () => {
    await db.insert(tripsTable).values({
      name: 'Minimal Trip',
      destination: 'London',
      start_date: '2024-03-01',
      end_date: '2024-03-03',
      description: null,
      participants: null
    }).execute();

    const result = await getTrips();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Minimal Trip');
    expect(result[0].destination).toEqual('London');
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].end_date).toBeInstanceOf(Date);
    expect(result[0].start_date).toEqual(new Date('2024-03-01'));
    expect(result[0].end_date).toEqual(new Date('2024-03-03'));
    expect(result[0].description).toBeNull();
    expect(result[0].participants).toBeNull();
  });
});
