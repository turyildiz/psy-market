import { ListingForm } from "@/components/listings/listing-form";

export default function CreateListingPage() {
  return (
    <div className="min-h-[60vh] py-10 px-6 max-w-[1200px] mx-auto">
      <ListingForm mode="create" />
    </div>
  );
}

