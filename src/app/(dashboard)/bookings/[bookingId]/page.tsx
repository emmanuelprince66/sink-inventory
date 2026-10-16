import BookingDetailsPage from "./BookingDetailsPage";

const Page = async ({ params }: { params: Promise<{ bookingId: string }> }) => {
  const { bookingId } = await params;
  return <BookingDetailsPage bookingId={bookingId} />;
};

export default Page;
