
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTrip = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete the trip - expenses will be cascade deleted due to foreign key constraint
    const result = await db.delete(tripsTable)
      .where(eq(tripsTable.id, input.id))
      .returning()
      .execute();

    // Check if any rows were deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Trip deletion failed:', error);
    throw error;
  }
};
