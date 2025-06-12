import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof import("@/db/schema"),
  ExtractTablesWithRelations<typeof import("@/db/schema")>
>;