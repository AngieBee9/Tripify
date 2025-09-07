import useTourBySlug from "../hooks/useTourBySlug";
import DetailPage from "./DetailPage";
import NotFound from "./NotFound";

export default function TourDetailRoute({ slug }) {
  const { item, loading, error } = useTourBySlug(slug);

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>Greška: {String(error)}</p>;
  if (!item) return <NotFound />;

 
  return <DetailPage item={item} tip="ture" backTo="#/ponuda" />;
}
