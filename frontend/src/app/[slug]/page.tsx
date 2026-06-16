import GraphPage from "@/components/GraphPage";

export default async function BeachGraphPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GraphPage slug={slug} />;
}
