import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

function Dashboard() {
  const [giftMode, setGiftMode] = useState<"classic" | "secret">("classic");
  const navigate = useNavigate();

  return (
    <section className="w-full px-6 md:px-14 lg:px-20 xl:px-16 py-12">
      <div className="flex border-b mb-8">
        {/* Selection of a mode (classic or secret)*/}
        <button
          onClick={() => setGiftMode("classic")}
          className={`mr-6 pb-1 text-lg font-medium cursor-pointer ${giftMode === "classic"
            ? "border-b-2 border-[#D36567] text-gray-900"
            : "text-gray-500"
            }`}
        >
          Classique
        </button>
        <button
          onClick={() => setGiftMode("secret")}
          className={`pb-1 text-lg font-medium cursor-pointer ${giftMode === "secret"
            ? "border-b-2 border-[#D36567] text-gray-900"
            : "text-gray-500"
            }`}
        >
          Secret
        </button>
      </div>

      {/* If  "classic" mode is selected*/}
      {giftMode === "classic" && (
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-12">
          {/* Option + (to create a new group) */}
          <Card className="bg-[#D36567] rounded-xl h-32 flex items-center justify-center cursor-pointer hover:opacity-90">
            <CardContent className="text-white text-5xl font-bold">+</CardContent>
          </Card>

          {/* Other groups */}
          {[
            { title: "Amis", color: "from-[#FF8177] via-[#CF556C] to-[#B12A5B]", route: "/friends" },
            { title: "Travail", color: "from-[#BAC8E0] to-[#6A85B6]", route: "/work" },
            { title: "Famille", color: "from-[#8DDAD5] to-[#00CDAC]", route: "/family" },
          ].map((card) => (
            <Card
              key={card.title}
              className={`relative bg-gradient-to-br ${card.color} rounded-xl h-32 p-4 text-white flex-col justify-center items-center cursor-pointer hover:opacity-90`}
              onClick={() => navigate(card.route)}
            >
              <Settings className="absolute top-2 right-2 w-5 h-5 opacity-80" />
              <CardContent className="flex-1 text-center text-lg font-semibold mt-8">
                {card.title}
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* If  "secret" mode is selected*/}
      {giftMode === "secret" && (
        <section className="text-gray-500 text-center mt-10">
          <p>Prochainement un mode "Secret Santa" à venir ! (dans la v12)</p>
        </section>
      )}
    </section>
  );
}

export default Dashboard;
