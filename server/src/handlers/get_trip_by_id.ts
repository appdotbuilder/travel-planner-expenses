
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { type Trip } from '../schema';
import { eq } from 'drizzle-orm';

export const getTripById = async (id: number): Promise<Trip | null> => {
  try {
    const result = await db.select()
      .from(tripsTable)
      .where(eq(tripsTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert date strings to Date objects to match schema
    const trip = result[0];
    return {
      ...trip,
      start_date: new Date(trip.start_date),
      end_date: new Date(trip.end_date)
    };
  } catch (error) {
    console.error('Get trip by ID failed:', error);
    throw error;
  }
};
