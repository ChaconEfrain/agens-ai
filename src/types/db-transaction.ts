import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";

export type Transaction = PgTransaction<NodePgQueryResultHKT, typeof import("c:/Users/efrain.chacon/Proyects/agens-ai/src/db/schema"), ExtractTablesWithRelations<typeof import("c:/Users/efrain.chacon/Proyects/agens-ai/src/db/schema")>>;