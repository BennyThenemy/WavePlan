import WavePlan from "@/components/WavePlan";
import { BEACHES } from "@/lib/data";

export function generateStaticParams() {
  return BEACHES.map((beach) => ({
    slug: beach.id,
  }));
}

export default async function BeachDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const beachIdx = BEACHES.findIndex((b) => b.id === slug);

  if (beachIdx === -1) {
    return <div>Beach not found</div>;
  }

  return <WavePlan initialBeachIdx={beachIdx} />;
}
