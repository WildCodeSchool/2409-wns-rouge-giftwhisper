import { useState } from "react";
import { Plus, Gift, Heart, Trash2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface WishItem {
  id: number;
  title: string;
  description: string;
  price?: number;
  imageUrl?: string;
  link?: string;
  isFavorite: boolean;
}

export default function Wishlist() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWish, setNewWish] = useState<Partial<WishItem>>({
    title: "",
    description: "",
    price: undefined,
    imageUrl: "",
    link: "",
    isFavorite: false,
  });

  const [wishItems, setWishItems] = useState<WishItem[]>([
    {
      id: 1,
      title: "Montre connectée",
      description: "",
      price: 1000.00,
      imageUrl: "",
      link: "#",
      isFavorite: false,
    },
    {
      id: 2,
      title: "Montre connectée",
      description: "",
      price: 1000.00,
      imageUrl: "https://cdn.pixabay.com/photo/2015/06/25/17/21/smart-watch-821557_1280.jpg",
      link: "#",
      isFavorite: true,
    },
  ]);

  const handleLike = (id: number) => {
    setWishItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleDelete = (id: number) => {
    setWishItems(wishItems.filter(item => item.id !== id));
  };

  const handleAddWish = () => {
    if (newWish.title && newWish.description) {
      const newItem: WishItem = {
        id: wishItems.length > 0 ? Math.max(...wishItems.map(item => item.id)) + 1 : 1,
        title: newWish.title,
        description: newWish.description,
        price: newWish.price ? Number(newWish.price) : undefined,
        imageUrl: newWish.imageUrl || "",
        link: newWish.link || "",
        isFavorite: newWish.isFavorite || false,
      };
      setWishItems([...wishItems, newItem]);
      setIsModalOpen(false);
      setNewWish({
        title: "",
        description: "",
        price: undefined,
        imageUrl: "",
        link: "",
        isFavorite: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 md:px-14 lg:px-20 xl:px-16 pt-8 pb-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Ma Wishlist 📜  
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une envie, une idée ? Glisse-la ici et laisse tes proches découvrir ce qui te ferait vraiment plaisir !
          </p>
        </div>
      </div>

      <section className="px-6 md:px-14 lg:px-20 xl:px-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-3 lg:gap-2 justify-items-center max-w-[1400px] mx-auto">
          <Card
            className="w-full max-w-[320px] h-[280px] bg-[#D36567] border-0 cursor-pointer text-[#FFFBFF] flex items-center justify-center p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-20 w-20" />
          </Card>
          {wishItems.map((item) => (
            <div key={item.id} className="flex flex-col items-center w-full max-w-[320px]">
              <Card className="relative w-full h-[280px] rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 p-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                    <Gift className="h-24 w-24 text-[#D36567]" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-[#D36567] bg-white/70 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-300 h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-[#D36567] bg-white/70 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-300 h-8 w-8"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-medium bg-white text-[#D36567] gap-1 shadow-sm cursor-pointer"
                  onClick={() => handleLike(item.id)}
                >
                  {item.isFavorite ? (
                    <Heart className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Heart className="h-3.5 w-3.5" />
                  )}
                </div>
              </Card>
              <div className="text-left mt-2">
                <p className="text-gray-900 text-base">
                  {item.title}
                </p>
                {item.price && (
                  <p className="text-gray-500 text-sm mt-1">
                    {item.price.toFixed(2)} €
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] [&>button]:cursor-pointer">
            <DialogHeader className="text-center">
              <div className="w-16 h-16 bg-[#D36567] rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Ajouter un souhait
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Remplissez les informations pour ajouter un nouveau souhait à votre liste
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Titre
                </Label>
                <Input
                  id="title"
                  value={newWish.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWish({ ...newWish, title: e.target.value })}
                  className="border-gray-200 focus:border-[#D36567] focus:ring-[#D36567]/20"
                  placeholder="Ex: Nouveau smartphone"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newWish.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewWish({ ...newWish, description: e.target.value })}
                  className="border-gray-200 focus:border-[#D36567] focus:ring-[#D36567]/20"
                  placeholder="Ex: Un smartphone avec une bonne caméra et une grande autonomie"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Prix (€) (optionnel)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={newWish.price || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWish({ ...newWish, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="border-gray-200 focus:border-[#D36567] focus:ring-[#D36567]/20"
                  placeholder="Ex: 499.99"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
                  URL de l'image (optionnel)
                </Label>
                <Input
                  id="imageUrl"
                  value={newWish.imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWish({ ...newWish, imageUrl: e.target.value })}
                  className="border-gray-200 focus:border-[#D36567] focus:ring-[#D36567]/20"
                  placeholder="Ex: https://cdn.pixabay.com/photo/2015/06/25/17/21/smart-watch-821557_1280.jpg"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="link" className="text-sm font-medium text-gray-700">
                  Lien du produit (optionnel)
                </Label>
                <Input
                  id="link"
                  value={newWish.link}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWish({ ...newWish, link: e.target.value })}
                  className="border-gray-200 focus:border-[#D36567] focus:ring-[#D36567]/20"
                  placeholder="Ex: https://www.apple.com/fr/watch/"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddWish}
                className="flex-1 bg-[#D36567] hover:bg-[#B12A5B] cursor-pointer"
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
