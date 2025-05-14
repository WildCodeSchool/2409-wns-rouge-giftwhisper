import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface Props {
  email: string;
  setEmail: (value: string) => void;
  emails: string[];
  addEmail: () => void;
  removeEmail: (index: number) => void;
}

export default function StepMembers({
  email,
  setEmail,
  emails,
  addEmail,
  removeEmail,
}: Props) {
  return (
    <div className="space-y-2">
      <Label>Membres du groupe</Label>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Ajouter un email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEmail()}
        />
        <Button type="button" onClick={addEmail}>
          Ajouter
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {emails.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 bg-muted px-3 py-1 rounded-full text-sm"
          >
            {item}
            <button onClick={() => removeEmail(index)}>
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
