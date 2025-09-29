import AirplaneSeatBooking from "../../components/AirplaneSeatBooking";
import { useSession } from "next-auth/react";

export default function CarouselPage() {
  return <AirplaneSeatBooking tableHeader="DefaultUser" />;
}