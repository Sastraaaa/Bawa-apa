import { FinalCheckView } from "@/components/final-check-view";

export default async function FinalCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FinalCheckView tripId={id} />;
}
