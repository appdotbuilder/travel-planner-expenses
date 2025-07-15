
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { type CreateTripInput, type Trip } from '../schema';

export const createTrip = async (input: CreateTripInput): Promise<Trip> => {
  try {
    // Insert trip record
    const result = await db.insert(tripsTable)
      .values({
        name: input.name,
        destination: input.destination,
        start_date: input.start_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        end_date: input.end_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        description: input.description,
        participants: input.participants
      })
      .returning()
      .execute();

    // Convert date strings back to Date objects before returning
    const trip = result[0];
    return {
      ...trip,
      start_date: new Date(trip.start_date),
      end_date: new Date(trip.end_date)
    };
  } catch (error) {
    console.error('Trip creation failed:', error);
    throw error;
  }
};
