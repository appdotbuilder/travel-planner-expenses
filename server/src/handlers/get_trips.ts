
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type Trip } from '../schema';

export const getTrips = async (): Promise<Trip[]> => {
  try {
    const results = await db.select()
      .from(tripsTable)
      .orderBy(desc(tripsTable.created_at))
      .execute();

    // Convert date strings to Date objects to match schema
    return results.map(trip => ({
      ...trip,
      start_date: new Date(trip.start_date),
      end_date: new Date(trip.end_date)
    }));
  } catch (error) {
    console.error('Get trips failed:', error);
    throw error;
  }
};
