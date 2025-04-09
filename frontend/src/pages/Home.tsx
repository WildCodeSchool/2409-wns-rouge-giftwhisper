import { Button } from "@/components/ui/button";
import { CiGift } from "react-icons/ci";

export function HomePage() {
  return (
    <>
    <h3 className="text-3xl font-bold underline text-red-500">
      Vive les cadeaux de noël ! <CiGift />
    </h3>

    <div className="flex flex-col items-center justify-center min-h-svh">
      <Button>Entrez</Button>
    </div>

    </>
  );
}
