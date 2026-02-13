import { ListingForm } from "@/components/listings/listing-form";

export default function CreateListingPage() {
  return (
    <div className="bg-[var(--dark-1)] text-white min-h-[60vh] p-8">
      <ListingForm mode="create" />
    </div>
  );
}

