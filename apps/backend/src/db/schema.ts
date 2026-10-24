import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  bigserial,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    refreshToken: text("refresh_token"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    longUrl: text("long_url").notNull(),
    shortCode: text("short_code").notNull().unique(),
    passwordHash: text("password_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    // Physical purge time (expiresAt + grace); swept by a daily cleanup job.
    deleteAt: timestamp("delete_at", { withTimezone: true }),
    clickCount: integer("click_count").notNull().default(0),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("links_user_id_idx").on(table.userId)]
);

export const clicks = pgTable(
  "clicks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    clickedAt: timestamp("clicked_at", { withTimezone: true }).defaultNow().notNull(),
    referrer: text("referrer"),
    browser: text("browser"),
    os: text("os"),
    device: text("device"),
    // Salted hash, never a raw IP.
    ipHash: text("ip_hash"),
  },
  (table) => [
    index("clicks_link_clicked_idx").on(table.linkId, table.clickedAt),
    index("clicks_clicked_at_idx").on(table.clickedAt),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
