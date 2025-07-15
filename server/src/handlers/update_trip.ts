
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { type UpdateTripInput, type Trip } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTrip = async (input: UpdateTripInput): Promise<Trip> => {
  try {
    // Check if trip exists
    const existingTrip = await db.select()
      .from(tripsTable)
      .where(eq(tripsTable.id, input.id))
      .execute();

    if (existingTrip.length === 0) {
      throw new Error(`Trip with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.destination !== undefined) updateData.destination = input.destination;
    if (input.start_date !== undefined) updateData.start_date = input.start_date;
    if (input.end_date !== undefined) updateData.end_date = input.end_date;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.participants !== undefined) updateData.participants = input.participants;

    // Update the trip
    const result = await db.update(tripsTable)
      .set(updateData)
      .where(eq(tripsTable.id, input.id))
      .returning()
      .execute();

    // Convert date strings to Date objects to match Trip schema
    const updatedTrip = result[0];
    return {
      ...updatedTrip,
      start_date: new Date(updatedTrip.start_date),
      end_date: new Date(updatedTrip.end_date)
    };
  } catch (error) {
    console.error('Trip update failed:', error);
    throw error;
  }
};
