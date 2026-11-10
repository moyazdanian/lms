import * as OutlineIcons from "@heroicons/react/24/outline";
import * as SolidIcons from "@heroicons/react/24/solid";
import { convertHeroiconName } from "./HeroiconsConvert";

export function getHeroiconComponent(iconName) {
  if (!iconName) return OutlineIcons["QuestionMarkCircleIcon"];

  const formattedName = convertHeroiconName(iconName);

  // تشخیص نوع آیکون (solid یا outline)
  const isSolid = iconName.includes("heroicon-o");
  const IconSet = isSolid ? OutlineIcons : SolidIcons;

  return IconSet[formattedName] || OutlineIcons["QuestionMarkCircleIcon"];
}
