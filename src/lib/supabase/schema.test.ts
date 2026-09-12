import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260911000000_initial_schema.sql",
  ),
  "utf8",
);

const ownedTables = [
  "profiles",
  "vehicles",
  "work_sessions",
  "charging_sessions",
  "monthly_goals",
] as const;

describe("initial Supabase schema", () => {
  it.each(ownedTables)("creates %s with row level security", (table) => {
    expect(migration).toContain(`create table public.${table}`);
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it.each(ownedTables)("does not expose %s to anonymous users", (table) => {
    expect(migration).toContain(
      `revoke all on table public.${table} from anon, authenticated`,
    );
  });

  it("binds journeys and charges to a vehicle owned by the same user", () => {
    expect(migration).toContain("constraint work_sessions_vehicle_owner_fk");
    expect(migration).toContain("constraint charging_sessions_vehicle_owner_fk");
    expect(migration.match(/foreign key \(vehicle_id, user_id\)/g)).toHaveLength(2);
  });

  it("stores calculation inputs and snapshots, not derived journey metrics", () => {
    expect(migration).toContain("vehicle_consumption_snapshot");
    expect(migration).toContain("energy_rate_snapshot");
    expect(migration).not.toMatch(/\n\s+(estimated_profit|revenue_per_km)\s/);
  });

  it("allows only one monthly goal per driver and month", () => {
    expect(migration).toContain(
      "constraint monthly_goals_user_month_unique unique (user_id, month)",
    );
  });
});
