import { ListingWizard } from "@/components/listings/listing-wizard";

export default function CreateListingPage() {
  return (
    <div className="min-h-[60vh] py-10 px-6 max-w-[1200px] mx-auto">
      <ListingWizard mode="create" />
    </div>
  );
}
