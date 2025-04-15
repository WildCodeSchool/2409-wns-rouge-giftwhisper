import { useState } from "react";
import { Button } from "@/components/ui/button";
import Stepper from "@/components/form/StepperForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

export default function GroupCreation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [endDate, setEndDate] = useState("");

  const steps = [
    { title: "Nom du groupe" },
    { title: "Membres du groupe" },
    { title: "Résumé" },
  ];

  const onSubmit = (data: any) => {
    console.log("form submitted:", data);
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  const addEmail = () => {
    if (email && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmail("");
    }
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col  px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-4">
        <h1 className="text-3xl text-primary">CRÉATION DE GROUPE</h1>
      </header>

      {/* mobile */}
      {/* VERSION MOBILE (scroll fluide) */}
      <div className="block md:hidden space-y-10">
        <section className="space-y-4">
          <Label htmlFor="groupName">Nom du groupe</Label>
          <Input id="groupName" placeholder="Mon super groupe" />

          <Label>Type de groupe</Label>
          <RadioGroup defaultValue="classic" name="groupType">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="classic" id="classic" />
              <Label htmlFor="classic">Classique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="secretSanta" id="secretSanta" />
              <Label htmlFor="secretSanta">Secret Santa</Label>
            </div>
          </RadioGroup>

          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </section>

        <section className="space-y-4">
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
                className="flex justify-between items-center bg-muted px-3 py-1 rounded-full text-sm"
              >
                {item}
                <button onClick={() => removeEmail(index)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <Label>Résumé</Label>
          <div className="text-sm text-muted-foreground">
            Nom : [à insérer dynamiquement]
            <br />
            Type : [à insérer]
            <br />
            Date de fin : {endDate}
            <br />
            Emails : {emails.join(", ")}
          </div>
          <Button onClick={() => onSubmit({})}>Terminer</Button>
        </section>
      </div>

      {/* Desktop */}

      <section className="hidden md:flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Stepper horizontal */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Form content per step */}
        <div className="border rounded-xl p-6  min-h-[200px] ">
          {/* step 1 */}
          {currentStep === 0 && (
            <form action="">
              <div className="flex flex-col gap-4">
                <div className="mb-4 space-y-2">
                  <Label htmlFor="groupName">Nom du groupe</Label>
                  <Input
                    id="groupName"
                    name="groupName"
                    placeholder="Mon super groupe"
                  />
                </div>

                <div className="flex flex-col space-y-2 mb-4">
                  <Label>Type de groupe</Label>
                  <RadioGroup defaultValue="classic" name="groupType">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="classic" id="classic" />
                      <Label htmlFor="classic">Classique</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="secretSanta" id="secretSanta" />
                      <Label htmlFor="secretSanta">Secret Santa</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </form>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
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
          )}

          {currentStep === 3 && <div>Résumé avant soumission</div>}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button onClick={handlePrev} disabled={currentStep === 0}>
            Précédent
          </Button>
          <Button
            onClick={
              currentStep === steps.length - 1 ? () => onSubmit({}) : handleNext
            }
          >
            {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
          </Button>
        </div>
      </section>
    </div>
  );
}
