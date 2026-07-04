import {
  int,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const pipedriveTokens = mysqlTable(
  'pipedrive_tokens',
  {
    pipedriveCompanyId: int('pipedrive_company_id').notNull(),
    pipedriveUserId: int('pipedrive_user_id').notNull(),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token').notNull(),
    tokenType: varchar('token_type', { length: 50 })
      .notNull()
      .default('bearer'),
    accessTokenExpiresAt: timestamp('access_token_expires_at').notNull(),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at').notNull(),
    scope: text('scope'),
    apiDomain: varchar('api_domain', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.pipedriveCompanyId, table.pipedriveUserId],
    }),
  }),
);
