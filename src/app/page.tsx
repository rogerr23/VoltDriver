import type { Metadata } from "next";

import { getAuthenticatedHomeDashboard } from "@/modules/home/server/queries";
import { HomeDashboard } from "@/modules/home/ui/home-dashboard";

export const metadata: Metadata = {
  title: "Início | VoltDriver",
  description: "Acompanhe o resultado do seu trabalho hoje e neste mês.",
};

export default async function Home() {
  const dashboard = await getAuthenticatedHomeDashboard();

  return <HomeDashboard dashboard={dashboard} />;
}
