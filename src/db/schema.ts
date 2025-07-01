import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

//Tables
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const productsOrServicesEnum = pgEnum("products_or_services", [
  "products",
  "services",
  "both",
]);

export const chatbotToneEnum = pgEnum("chatbot_tone", [
  "formal",
  "casual",
  "friendly",
  "professional",
]);

export const businesses = pgTable(
  "businesses",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    allowedWebsites: json("allowed_websites").$type<string[]>().notNull(),
    foundedYear: varchar("founded_year", { length: 255 }),
    productsOrServices: productsOrServicesEnum(
      "products_or_services"
    ).notNull(),
    items: json("items").$type<
      {
        name: string;
        description: string;
        price: string;
      }[]
    >(),
    hasPhysicalProducts: boolean("has_physical_products").default(false),
    shippingMethods: text("shipping_methods"),
    deliveryTimeframes: text("delivery_timeframes"),
    returnPolicy: text("return_policy"),
    internationalShipping: boolean("international_shipping").default(false),
    shippingRestrictions: text("shipping_restrictions"),
    supportHours: text("support_hours"),
    contactMethods: json("contact_methods").$type<string[]>().notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 255 }),
    whatsapp: varchar("whatsapp", { length: 255 }),
    socialMedia: text("social_media"),
    responseTime: varchar("response_time", { length: 255 }),
    commonQuestions: json("common_questions").$type<
      {
        question: string;
        answer: string;
      }[]
    >(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [index("businesses_user_id_idx").on(table.userId)]
);

export const formWizardsProgress = pgTable(
  "form_wizards_progress",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    wizardId: text("wizard_id").notNull(),
    step: integer("step").notNull(),
    data: json("data").$type<Partial<FormWizardData>>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    unique().on(table.wizardId),
    index("wizardsProgress_wizard_id_idx").on(table.wizardId),
  ]
);

export const files = pgTable(
  "files",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    businessId: integer("business_id")
      .references(() => businesses.id, { onDelete: "cascade" })
      .notNull(),
    chatbotId: integer("chatbot_id")
      .references(() => chatbots.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    fileUrl: varchar("file_url", { length: 512 }).notNull(),
    createdAT: timestamp("created_at").notNull().defaultNow(),
    updatedAT: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("files_business_id_idx").on(table.businessId),
    index("files_chatbot_id_idx").on(table.chatbotId),
  ]
);

export const chatbots = pgTable(
  "chatbots",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    businessId: integer("business_id")
      .references(() => businesses.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    subscriptionId: integer("subscription_id").references(
      () => subscriptions.id,
      { onDelete: "set null" }
    ),
    allowedDomains: json("allowed_domains").$type<string[]>().notNull(),
    instructions: text("instructions").notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    styles: json("styles").$type<ChatbotStyles>().notNull(),
    testMessagesCount: integer("test_messages_count").notNull().default(0),
    currentPeriodMessagesCount: integer("current_period_messages_count")
      .notNull()
      .default(0),
    pdfInputTokens: integer("pdf_input_tokens").notNull(),
    pdfOutputTokens: integer("pdf_output_tokens").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("chatbots_business_id_idx").on(table.businessId),
    index("chatbots_user_id_idx").on(table.userId),
    index("chatbots_slug_idx").on(table.slug),
  ]
);

export const embeddings = pgTable(
  "embeddings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    chatbotId: integer("chatbot_id")
      .references(() => chatbots.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("embeddings_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
    index("embeddings_chatbot_id_idx").on(table.chatbotId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    chatbotId: integer("chatbot_id")
      .references(() => chatbots.id, { onDelete: "cascade" })
      .notNull(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    message: text("message").notNull(),
    rewrittenMessage: text("rewritten_message").notNull(),
    response: text("response").notNull(),
    liked: boolean("liked"),
    isTest: boolean("is_test").default(false).notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    rewriteInputTokens: integer("rewrite_input_tokens").notNull(),
    rewriteOutputTokens: integer("rewrite_output_tokens").notNull(),
    totalInputTokens: integer("total_input_tokens").notNull(),
    totalOutputTokens: integer("total_output_tokens").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("messages_chatbot_session_active_created_idx").on(
      table.chatbotId,
      table.sessionId,
      table.isActive,
      table.createdAt
    ),
    index("messages_chatbot_id_idx").on(table.chatbotId),
    index("messages_created_at_idx").on(table.createdAt),
  ]
);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "basic",
  "pro",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 255,
    }).notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
    stripeItemId: varchar("stripe_item_id", { length: 255 }).notNull(),
    plan: subscriptionPlanEnum("plan").notNull(),
    messageCount: integer("message_count").notNull().default(0),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_stripe_sub_id_idx").on(table.stripeSubscriptionId),
  ]
);

//Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  chatbots: many(chatbots),
  files: many(files),
  formWizardsProgress: many(formWizardsProgress),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, { fields: [businesses.userId], references: [users.id] }),
  files: many(files),
}));

export const formWizardsProgressRelations = relations(
  formWizardsProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [formWizardsProgress.userId],
      references: [users.id],
    }),
  })
);

export const filesRelations = relations(files, ({ one }) => ({
  business: one(businesses, {
    fields: [files.businessId],
    references: [businesses.id],
  }),
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  chatbot: one(chatbots, {
    fields: [files.chatbotId],
    references: [chatbots.id],
  }),
}));

export const chatbotsRelations = relations(chatbots, ({ one, many }) => ({
  business: one(businesses, {
    fields: [chatbots.businessId],
    references: [businesses.id],
  }),
  user: one(users, { fields: [chatbots.userId], references: [users.id] }),
  files: many(files),
  subscription: one(subscriptions, {
    fields: [chatbots.subscriptionId],
    references: [subscriptions.id],
  }),
  messages: many(messages),
}));

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  chatbot: one(chatbots, {
    fields: [embeddings.chatbotId],
    references: [chatbots.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chatbot: one(chatbots, {
    fields: [messages.chatbotId],
    references: [chatbots.id],
  }),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ many, one }) => ({
    chatbots: many(chatbots),
    businesses: many(businesses),
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
  })
);

//Types
export type User = typeof users.$inferSelect;
export type Chatbot = typeof chatbots.$inferSelect;
export type ChatbotInsert = typeof chatbots.$inferInsert;
export type Business = typeof businesses.$inferSelect;
export type File = typeof files.$inferSelect;
export type FileInsert = typeof files.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type MessageInsert = typeof messages.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;
export type FormWizardProgress = typeof formWizardsProgress.$inferSelect;
