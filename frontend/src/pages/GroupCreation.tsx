import { useState } from "react";
import { Button } from "@/components/ui/button";
import Stepper from "@/components/form/StepperForm";
import StepGroupName from "@/components/createGroupFormSteps/StepGroupName";
import StepMembers from "@/components/createGroupFormSteps/StepMembers";
import StepSummary from "@/components/createGroupFormSteps/StepSummary";
import { useMutation } from "@apollo/client";
import { ADD_USERS_TO_GROUP, CREATE_GROUP } from "@/api/group";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Étapes réutilisables

export default function GroupCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  // const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("classic");
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [createGroup] = useMutation(CREATE_GROUP);
  const [addUsersToGroup] = useMutation(ADD_USERS_TO_GROUP);

  const steps = [
    { title: "Nom du groupe" },
    { title: "Membres du groupe" },
    { title: "Résumé" },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => {
      const nextStep = Math.min(prev + 1, steps.length - 1);
      setMaxStepReached((prevMax) => Math.max(prevMax, nextStep));
      return nextStep;
    });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async () => {
    try {
      // 1. Creation of the group
      const response = await createGroup({
        variables: {
          data: {
            name: groupName,
            is_secret_santa: groupType === "secretSanta",
          },
        },
      });

      const createdGroup = response.data?.createGroup;

      if (!createdGroup) throw new Error("Création du groupe échouée");

      const groupId = createdGroup.id;

      // 2. Add members by their email
      if (emails.length > 0) {
        await addUsersToGroup({
          variables: {
            emails,
            groupId,
          },
        });
      }

      // 3. Reset form
      setGroupName("");
      setEmails([]);
      setEmail("");
      setCurrentStep(0);
      setMaxStepReached(0);

      if (emails.length > 0) {
        toast.success("Groupe créé avec succès ! Des invitations ont été envoyées aux membres.");
      } else {
        toast.success("Groupe créé avec succès !");
      }

      // Redirect to the group settings page
      navigate(`/group/${groupId}/settings`);
    } catch {
      if(!groupName) {
        toast.error("Le nom du groupe est obligatoire");
      } else {
        toast.error("Une erreur est survenue lors de la création du groupe");
      }
    }
  };

  const addEmail = () => {
    if (email && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmail("");
    }
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const goToStep = (index: number) => {
    if (index <= maxStepReached) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-4">
        <h1 className="text-3xl text-primary">CRÉATION DE GROUPE</h1>
      </header>

      {/* VERSION MOBILE */}
      <div className="block md:hidden space-y-10">
        <StepGroupName
          groupName={groupName}
          setGroupName={setGroupName}
          groupType={groupType}
          setGroupType={setGroupType}
        />

        <StepMembers
          email={email}
          setEmail={setEmail}
          emails={emails}
          addEmail={addEmail}
          removeEmail={removeEmail}
        />

        <Button onClick={() => onSubmit()}>Terminer</Button>
      </div>

      {/* VERSION DESKTOP */}
      <section className="hidden md:flex flex-col gap-6 max-w-2xl mx-auto w-full">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
          maxStepReached={maxStepReached}
        />

        <div className="border rounded-xl p-6 min-h-[200px]">
          {currentStep === 0 && (
            <StepGroupName
              groupName={groupName}
              setGroupName={setGroupName}
              groupType={groupType}
              setGroupType={setGroupType}
            />
          )}
          {currentStep === 1 && (
            <StepMembers
              email={email}
              setEmail={setEmail}
              emails={emails}
              addEmail={addEmail}
              removeEmail={removeEmail}
            />
          )}
          {currentStep === 2 && (
            <StepSummary
              emails={emails}
              groupName={groupName}
              groupType={groupType}
            />
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={handlePrev} disabled={currentStep === 0}>
            Précédent
          </Button>
          <Button onClick={currentStep === steps.length - 1 ? () => onSubmit() : handleNext} className="cursor-pointer">
            {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
          </Button>
        </div>
      </section>
    </div>
  );
}
