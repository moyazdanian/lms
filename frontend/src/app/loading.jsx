import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Commet } from "react-loading-indicators";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen z-50">
      {/* <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 dark:border-gray-200"></div> */}
      <Spinner
        variant="infinite"
        size="50"
        className="dark:color-gray-200 color-gray-900"
      />
    </div>
  );
}
