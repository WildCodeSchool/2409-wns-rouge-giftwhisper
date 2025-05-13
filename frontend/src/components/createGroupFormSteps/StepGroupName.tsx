import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  groupName: string;
  setGroupName: (value: string) => void;
  groupType: string;
  setGroupType: (value: string) => void;
  //   endDate: string;
  //   setEndDate: (value: string) => void;
}

export default function StepGroupName({
  groupName,
  setGroupName,
  groupType,
  setGroupType,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="groupName">Nom du groupe</Label>
        <Input
          id="groupName"
          name="groupName"
          placeholder="Mon super groupe"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Type de groupe</Label>
        <RadioGroup
          value={groupType}
          onValueChange={setGroupType}
          name="groupType"
        >
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

      {/* <div className="space-y-2">
        <Label htmlFor="endDate">Date de fin</Label>
        <Input
          id="endDate"
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div> */}
    </div>
  );
}
