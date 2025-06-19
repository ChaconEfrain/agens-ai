import { db } from "@/db";
import { DBQueryConfig, ExtractTablesWithRelations, KnownKeysOnly } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof import("@/db/schema"),
  ExtractTablesWithRelations<typeof import("@/db/schema")>
>;

export type FindFirstUserOptions = Parameters<typeof db.query.users.findFirst>[0];
