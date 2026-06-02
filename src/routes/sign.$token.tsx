import NDASigningPage from "@/features/client-nda/components/signing-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign/$token")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token }: { token: string } = Route.useParams();
  return <NDASigningPage token={token} />;
}
