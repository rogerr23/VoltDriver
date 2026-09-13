import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/server/session";

import { getCurrentMonthGoalOverviewForUser } from "./repository";

export async function getAuthenticatedCurrentMonthGoalOverview() {
  const user = await requireAuthenticatedUser();
  return getCurrentMonthGoalOverviewForUser(user.id);
}
