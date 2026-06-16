import WavePlan from "@/components/WavePlan";

export default async function BeachDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WavePlan initialSlug={slug} />;
}
