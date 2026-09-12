import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/server/session";

import { getActiveVehicleForUser } from "./repository";

export async function getAuthenticatedUserActiveVehicle() {
  const user = await requireAuthenticatedUser();
  return getActiveVehicleForUser(user.id);
}
