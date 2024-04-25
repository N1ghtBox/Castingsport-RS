import { Capitalize } from "./utils";

export enum Categories {
  Kadet = "Kadet",
  Junior = "Junior",
  Juniorka = "Juniorka",
  Senior = "Senior",
  Kobieta = "Kobieta",
}

export const ParseStringToCategory = (text: string): Categories => {
  text = Capitalize(text)
  return Categories[text as Categories];
};

export const ParseStringToTeam = (text: string): Teams => {
  text = Capitalize(text)
  return Teams[text as Teams];
};

export enum DisciplinesForCategories {
  Kadet = 3,
  Junior = 5,
  Juniorka = 5,
  Senior = 5,
  Kobieta = 5,
}

export enum Teams {
  Indywidualnie = "Indywidualnie",
  Młodzieżowa = "Młodzieżowa",
  Seniorów = "Seniorów",
  Kobiet = "Kobiet",
}
