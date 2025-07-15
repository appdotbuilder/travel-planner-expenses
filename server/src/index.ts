
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createTripInputSchema, 
  updateTripInputSchema, 
  createExpenseInputSchema, 
  updateExpenseInputSchema,
  getExpensesByTripInputSchema,
  deleteInputSchema
} from './schema';
import { createTrip } from './handlers/create_trip';
import { getTrips } from './handlers/get_trips';
import { getTripById } from './handlers/get_trip_by_id';
import { updateTrip } from './handlers/update_trip';
import { deleteTrip } from './handlers/delete_trip';
import { createExpense } from './handlers/create_expense';
import { getExpenses } from './handlers/get_expenses';
import { getExpensesByTrip } from './handlers/get_expenses_by_trip';
import { getExpenseById } from './handlers/get_expense_by_id';
import { updateExpense } from './handlers/update_expense';
import { deleteExpense } from './handlers/delete_expense';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Trip routes
  createTrip: publicProcedure
    .input(createTripInputSchema)
    .mutation(({ input }) => createTrip(input)),
  
  getTrips: publicProcedure
    .query(() => getTrips()),
  
  getTripById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getTripById(input.id)),
  
  updateTrip: publicProcedure
    .input(updateTripInputSchema)
    .mutation(({ input }) => updateTrip(input)),
  
  deleteTrip: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteTrip(input)),
  
  // Expense routes
  createExpense: publicProcedure
    .input(createExpenseInputSchema)
    .mutation(({ input }) => createExpense(input)),
  
  getExpenses: publicProcedure
    .query(() => getExpenses()),
  
  getExpensesByTrip: publicProcedure
    .input(getExpensesByTripInputSchema)
    .query(({ input }) => getExpensesByTrip(input)),
  
  getExpenseById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getExpenseById(input.id)),
  
  updateExpense: publicProcedure
    .input(updateExpenseInputSchema)
    .mutation(({ input }) => updateExpense(input)),
  
  deleteExpense: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteExpense(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
