
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable } from '../db/schema';
import { type UpdateTripInput, type CreateTripInput } from '../schema';
import { updateTrip } from '../handlers/update_trip';
import { eq } from 'drizzle-orm';

describe('updateTrip', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test trip
  const createTestTrip = async (input: CreateTripInput) => {
    const insertData = {
      name: input.name,
      destination: input.destination,
      start_date: input.start_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
      end_date: input.end_date.toISOString().split('T')[0],     // Convert Date to YYYY-MM-DD string
      description: input.description,
      participants: input.participants
    };

    const [trip] = await db.insert(tripsTable)
      .values(insertData)
      .returning();

    return {
      ...trip,
      start_date: new Date(trip.start_date),
      end_date: new Date(trip.end_date)
    };
  };

  it('should update a trip with all fields', async () => {
    // Create a test trip first
    const createInput: CreateTripInput = {
      name: 'Original Trip',
      destination: 'Original Destination',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-05'),
      description: 'Original description',
      participants: 'Original participants'
    };

    const createdTrip = await createTestTrip(createInput);

    // Update the trip
    const updateInput: UpdateTripInput = {
      id: createdTrip.id,
      name: 'Updated Trip',
      destination: 'Updated Destination',
      start_date: new Date('2024-02-01'),
      end_date: new Date('2024-02-05'),
      description: 'Updated description',
      participants: 'Updated participants'
    };

    const result = await updateTrip(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(createdTrip.id);
    expect(result.name).toEqual('Updated Trip');
    expect(result.destination).toEqual('Updated Destination');
    expect(result.start_date).toEqual(new Date('2024-02-01'));
    expect(result.end_date).toEqual(new Date('2024-02-05'));
    expect(result.description).toEqual('Updated description');
    expect(result.participants).toEqual('Updated participants');
    expect(result.created_at).toEqual(createdTrip.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdTrip.updated_at).toBe(true);
  });

  it('should update only provided fields', async () => {
    // Create a test trip first
    const createInput: CreateTripInput = {
      name: 'Original Trip',
      destination: 'Original Destination',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-05'),
      description: 'Original description',
      participants: 'Original participants'
    };

    const createdTrip = await createTestTrip(createInput);

    // Update only name and destination
    const updateInput: UpdateTripInput = {
      id: createdTrip.id,
      name: 'Partially Updated Trip',
      destination: 'Partially Updated Destination'
    };

    const result = await updateTrip(updateInput);

    // Verify only specified fields were updated
    expect(result.name).toEqual('Partially Updated Trip');
    expect(result.destination).toEqual('Partially Updated Destination');
    expect(result.start_date).toEqual(createdTrip.start_date);
    expect(result.end_date).toEqual(createdTrip.end_date);
    expect(result.description).toEqual(createdTrip.description);
    expect(result.participants).toEqual(createdTrip.participants);
    expect(result.updated_at > createdTrip.updated_at).toBe(true);
  });

  it('should update trip in database', async () => {
    // Create a test trip first
    const createInput: CreateTripInput = {
      name: 'Test Trip',
      destination: 'Test Destination',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-05'),
      description: 'Test description',
      participants: 'Test participants'
    };

    const createdTrip = await createTestTrip(createInput);

    // Update the trip
    const updateInput: UpdateTripInput = {
      id: createdTrip.id,
      name: 'Updated Trip Name'
    };

    await updateTrip(updateInput);

    // Verify the update was persisted
    const trips = await db.select()
      .from(tripsTable)
      .where(eq(tripsTable.id, createdTrip.id));

    expect(trips).toHaveLength(1);
    expect(trips[0].name).toEqual('Updated Trip Name');
    expect(trips[0].destination).toEqual('Test Destination');
    expect(trips[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update nullable fields to null', async () => {
    // Create a test trip first
    const createInput: CreateTripInput = {
      name: 'Test Trip',
      destination: 'Test Destination',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-05'),
      description: 'Test description',
      participants: 'Test participants'
    };

    const createdTrip = await createTestTrip(createInput);

    // Update nullable fields to null
    const updateInput: UpdateTripInput = {
      id: createdTrip.id,
      description: null,
      participants: null
    };

    const result = await updateTrip(updateInput);

    expect(result.description).toBeNull();
    expect(result.participants).toBeNull();
    expect(result.name).toEqual(createdTrip.name);
    expect(result.destination).toEqual(createdTrip.destination);
  });

  it('should throw error when trip not found', async () => {
    const updateInput: UpdateTripInput = {
      id: 999,
      name: 'Updated Trip'
    };

    await expect(updateTrip(updateInput)).rejects.toThrow(/trip with id 999 not found/i);
  });

  it('should preserve existing dates when not updated', async () => {
    // Create a test trip first
    const createInput: CreateTripInput = {
      name: 'Test Trip',
      destination: 'Test Destination',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-05'),
      description: 'Test description',
      participants: 'Test participants'
    };

    const createdTrip = await createTestTrip(createInput);

    // Update only name, leaving dates unchanged
    const updateInput: UpdateTripInput = {
      id: createdTrip.id,
      name: 'Updated Name Only'
    };

    const result = await updateTrip(updateInput);

    expect(result.name).toEqual('Updated Name Only');
    expect(result.start_date).toEqual(createdTrip.start_date);
    expect(result.end_date).toEqual(createdTrip.end_date);
    expect(result.start_date).toBeInstanceOf(Date);
    expect(result.end_date).toBeInstanceOf(Date);
  });
});
