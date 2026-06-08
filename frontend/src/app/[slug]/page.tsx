import { fetchBeachBySlug } from "@/lib/api";
import BeachDetail from "@/components/BeachDetail";

type Params = Promise<{ slug: string }>;

export default async function BeachPage({ params }: { params: Params }) {
  const { slug } = await params;
  const beach = await fetchBeachBySlug(slug);

  return <BeachDetail beach={beach} />;
}
