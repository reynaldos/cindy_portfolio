import SiteLayout from "./(site)/layout";
import NotFound from "./(site)/not-found";

// Unknown URLs land in the bay frame too, with the Media Offline card
export default function RootNotFound() {
  return <SiteLayout><NotFound /></SiteLayout>;
}
