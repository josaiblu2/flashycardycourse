import { auth } from "@clerk/nextjs/server";
import { LandingPage } from "@/components/landing-page";
import { RedirectIfSignedIn } from "@/components/redirect-if-signed-in";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    return <RedirectIfSignedIn />;
  }

  return <LandingPage />;
}
