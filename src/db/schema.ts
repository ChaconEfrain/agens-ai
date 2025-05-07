import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, varchar, vector } from "drizzle-orm/pg-core";

//Tables
export const users = pgTable("users", {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const businesses = pgTable("businesses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1024 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, table => [index("businesses_user_id_idx").on(table.userId)]
);

export const chatbots = pgTable("chatbots", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  businessId: integer("business_id").references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  instructions: varchar("instructions", { length: 2000 }), // system prompt
  slug: varchar("slug", { length: 255 }).notNull().unique(), // para compartir tipo embed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, table => [
  index("chatbots_business_id_idx").on(table.businessId),
  index("chatbots_user_id_idx").on(table.userId)
  ]
);

export const embeddings = pgTable("embeddings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  chatbotId: integer("chatbot_id").references(() => chatbots.id, { onDelete: 'cascade' }).notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, table => [
  index("embeddings_chatbot_id_idx").on(table.chatbotId),
]);

//Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  chatbots: many(chatbots),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, { fields: [businesses.userId], references: [users.id] }),
  chatbots: many(chatbots),
}));

export const chatbotsRelations = relations(chatbots, ({ one }) => ({
  business: one(businesses, { fields: [chatbots.businessId], references: [businesses.id] }),
  user: one(users, { fields: [chatbots.userId], references: [users.id] }),
}));

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  chatbot: one(chatbots, { fields: [embeddings.chatbotId], references: [chatbots.id] }),
}));

//Types
export type User = typeof users.$inferSelect;
export type Chatbot = typeof chatbots.$inferSelect;
export type Business = typeof businesses.$inferSelect;