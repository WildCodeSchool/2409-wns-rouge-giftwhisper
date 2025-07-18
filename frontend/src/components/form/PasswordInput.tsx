import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  name,
  id,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        id={id}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
