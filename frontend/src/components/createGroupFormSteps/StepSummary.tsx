interface Props {
  //   endDate: string;
  emails: string[];
  groupName: string;
  groupType: string;
}

export default function StepSummary({ emails, groupName, groupType }: Props) {
  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <p>
        <span className="font-semibold">Nom :</span>{" "}
        {groupName || "[non renseigné]"}
        {/* <p>Date de fin : {endDate}</p> */}
      </p>
      <p>
        <span className="font-semibold">Type :</span>{" "}
        {groupType === "secretSanta" ? "Secret Santa" : "Classique"}
      </p>
      <p>
        <span className="font-semibold">Membres du groupe :</span>{" "}
        {emails.length > 0 ? emails.join(", ") : "[aucun membre]"}
      </p>
    </div>
  );
}
