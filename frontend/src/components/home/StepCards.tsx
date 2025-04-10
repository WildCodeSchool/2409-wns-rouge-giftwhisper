import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface StepCard {
  number: number;
  title: string;
  style: string;
  icon: string;
  titleStyle: string;
  numberStyle: string;
  iconStyle: string;
  button: boolean;
}

const StepCardProps: StepCard[] = [
  {
    number: 1,
    title: "Créer ton compte",
    style: "",
    titleStyle: "pl-3 pt-10",
    icon: "/stepcards/1.svg",
    iconStyle: "w-40 h-40 mt-2",
    numberStyle: "right-0 -bottom-25 2xl:right-1 2xl:-bottom-32",
    button: true,
  },
  {
    number: 2,
    title: "Créer un groupe et ajoute tes amis",
    style: "flex-row-reverse",
    titleStyle: "px-2",
    icon: "/stepcards/2.svg",
    iconStyle: "w-42 h-42 mt-14",
    numberStyle: "left-3 -bottom-25 2xl:left-4 2xl:-bottom-32",
    button: false,
  },
  {
    number: 3,
    title: "Organisez les cadeaux ensemble !",
    style: "flex-col gap-4",
    titleStyle: "text-3xl",
    icon: "/stepcards/3.svg",
    iconStyle: "w-42 h-42",
    numberStyle:
      "-top-27 -right-8 xl:-right-9 xl:-top-28 2xl:-right-10 2xl:-top-32",
    button: false,
  },
];

export function StepCard() {
  return (
    <div className="flex flex-col items-center gap-8 pb-10 md:flex-row md:justify-center xl:gap-18">
      {StepCardProps.map((card) => (
        <div key={card.number} className="flex flex-col items-center">
          <div
            className={`${card.style} relative rounded-xl p-4 w-72 h-80 2xl:w-96 2xl:h-100 flex bg-custom-gradient`}
          >
            <img
              src={card.icon}
              alt={card.title}
              className={`${card.iconStyle}`}
            />
            <h3
              className={`${card.titleStyle} text-2xl 2xl:text-3xl font-bold text-white`}
            >
              {card.title}
            </h3>
            <p
              className={`${card.numberStyle} text-[15rem] 2xl:text-[18rem] font-bold text-white absolute`}
            >
              {card.number}
            </p>
            {card.button && (
              <Button
                size="xl"
                variant="primary"
                className="absolute left-7 bottom-10 2xl:left-10 2xl:bottom-12"
              >
                <Link to={"/sign-in"}>Clique ici</Link>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
