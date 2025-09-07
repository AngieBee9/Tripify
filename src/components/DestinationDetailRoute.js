import useDestinationBySlug from "../hooks/useDestinationBySlug";
import DetailPage from "./DetailPage";
import NotFound from "./NotFound";

export default function DestinationDetailRoute({ slug }) {
  const { item, loading, error } = useDestinationBySlug(slug);

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>Greška: {String(error)}</p>;
  if (!item) return <NotFound />;

 
  return <DetailPage item={item} tip="dest" backTo="#/ponuda" />;
}
