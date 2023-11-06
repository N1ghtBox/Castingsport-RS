import { ArgsProps } from "antd/es/message";
import { Categories, Teams } from "./enums";
import DataType from "./interfaces/dataType";
import { team } from ".";

export type final = {
  category: string;
  club: string;
  girl: boolean;
  name: string;
  team: string;
};

export type score = {
  key: string;
  place: number;
  score3: number;
  score5: number;
  // score7: number;
  // score9: number;
};

export type mergedFinals = final & { scores: score[] };
export type finalsWithScores = final & score;

export const getTotalScoreT3 = (a: any) => {
  if (!a.disciplines) return 0;
  let D3 = parseInt(a.disciplines[2].score);
  let D4 = parseInt(a.disciplines[3].score);
  let D5 = Math.round(parseFloat(a.disciplines[4].score) * 1.5 * 1000) / 1000;

  return Math.round((D3 + D4 + D5) * 1000) / 1000;
};

export const getTotalScoreT5 = (a: any) => {
  if (!a.disciplines) return 0;
  let D1 = parseInt(a.disciplines[0].score);
  let D2 =
    parseFloat(a.disciplines[1].score) + parseFloat(a.disciplines[1].score2);
  let D3 = parseInt(a.disciplines[2].score);
  let D4 = parseInt(a.disciplines[3].score);
  let D5 = Math.round(parseFloat(a.disciplines[4].score) * 1.5 * 1000) / 1000;

  return Math.round((D1 + D2 + D3 + D4 + D5) * 1000) / 1000;
};

export const getTotalScoreT12 = (a: any) => {
  if (!a.disciplines) return 0;
  let D6 =
    parseFloat(a.disciplines[5].score) + parseFloat(a.disciplines[5].score2);
  let D7 = Math.round(parseFloat(a.disciplines[6].score) * 1.5 * 1000) / 1000;

  return Math.round((D6 + D7) * 1000) / 1000;
};

export const getTotalScoreT13 = (a: any) => {
  if (!a.disciplines) return 0;
  let D8 = parseFloat(a.disciplines[7].score);
  let D9 = Math.round(parseFloat(a.disciplines[8].score) * 1.5 * 1000) / 1000;
  return Math.round((D8 + D9) * 1000) / 1000;
};

export const getCategoriesForDiscipline = (number: number): [number, 5] => {
  if (number === 11) return [1, 5];
  if (number === 12 || number === 13) return [3, 5];
  if ([6, 7, 8, 9].includes(number)) return [3, 5];
  if ([1, 2].includes(number)) return [1, 5];
  return [0, 5];
};

export const getDisciplineRangeForResults = (key: number): [number, number] => {
  if (key < 10) return [key, key + 1];
  if (key == 10) return [2, 5];
  if (key == 11) return [0, 5];
  if (key == 12) return [5, 7];
  if (key == 13) return [7, 9];
  return [0, 10];
};

export const getTotalScore = (key: number) => {
  if (key === 10) return (a: any) => getTotalScoreT3(a);
  if (key === 11) return (a: any) => getTotalScoreT5(a);
  if (key === 12) return (a: any) => getTotalScoreT12(a);
  if (key === 13) return (a: any) => getTotalScoreT13(a);
  return () => 0;
};

export const mapToTeams = (
  value: DataType,
  array: any[],
  getScore: (value: DataType) => number,
  type: string
) => {
  if (!value.club || !value.team || value.team === Teams.Indywidualnie) return;
  if (type !== value.team) return;
  let teamIndex = array.findIndex(
    (team) => team.teamName === value.club && team.type === value.team
  );
  if (teamIndex >= 0) {
    let localTeam = array[teamIndex];
    localTeam.scores += `${getScore(value)}\n`;
    localTeam.team += `${value.startingNumber} ${value.name}\n`;
    localTeam.total += getScore(value);
  } else {
    array.push({
      key: array.length,
      scores: `${getScore(value)}\n`,
      team: `${value.startingNumber} ${value.name}\n`,
      total: getScore(value),
      teamName: `${value.club}`,
      type: `${value.team}`,
    });
  }
};

export const checkIfTakesPart = (value: DataType, range: [number, number]) => {
  let takesPart = true;
  Object.values(value.disciplines)
    .slice(...range)
    .forEach((dis) => {
      if (!dis.takesPart) {
        takesPart = false;
        return;
      }
    });
  return takesPart;
};

export const filterByGender = (x: DataType, selectedCategory: string) => {
  if (selectedCategory === "Wszyscy") return true;
  if (selectedCategory === "Senior")
    return (
      x.category === Categories.Junior ||
      x.category === Categories.Senior ||
      (x.category === Categories.Kadet && !x.girl)
    );
  return (
    x.category === Categories.Juniorka ||
    x.category === Categories.Kobieta ||
    (x.category === Categories.Kadet && x.girl)
  );
};

export const getMessageProps = (
  type: "loading" | "success" | "error",
  content: string,
  duration: number,
  key?: string
): ArgsProps => {
  return {
    type,
    content,
    duration,
    key,
  };
};

export const generateTeamsMergedFinals = (
    finals: { name: string; scores: { teams: team[] } }[]
  ) => {
    return [] as any[]
  }

export const generateIndividualMergedFinals = (
  finals: { name: string; scores: { individual: finalsWithScores[] } }[]
) => {
  let mergedFinals: mergedFinals[] = [];
  let categoryCounts: { [K in keyof typeof Categories]: number } = {
    Kadet: getMaxCountOfCompetetorsIn(
      finals.map((x) => x.scores.individual),
      Categories.Kadet
    ),
    Junior: getMaxCountOfCompetetorsIn(
      finals.map((x) => x.scores.individual),
      Categories.Junior
    ),
    Juniorka: getMaxCountOfCompetetorsIn(
      finals.map((x) => x.scores.individual),
      Categories.Juniorka
    ),
    Kobieta: getMaxCountOfCompetetorsIn(
      finals.map((x) => x.scores.individual),
      Categories.Kobieta
    ),
    Senior: getMaxCountOfCompetetorsIn(
      finals.map((x) => x.scores.individual),
      Categories.Senior
    ),
  };
  for (let i = 0; i < finals.length; i++) {
    const final = finals[i];
    for (let j = 0; j < final.scores.individual.length; j++) {
      const competetor = final.scores.individual[j];
      let indexInList = CompetetorsIndexInList(mergedFinals, competetor);
      if (indexInList < 0)
        mergedFinals.push({
          ...competetor,
          scores: [
            {
              key: final.name,
              place: competetor.place,
              score3: competetor.score3,
              score5: competetor.score5,
              // score7: competetor.score7,
              // score9: competetor.score9,
            },
          ],
        });
      else
        mergedFinals[indexInList].scores.push({
          key: final.name,
          place: competetor.place,
          score3: competetor.score3,
          score5: competetor.score5,
          // score7: competetor.score7,
          // score9: competetor.score9,
        });
    }
    for (let j = 0; j < mergedFinals.length; j++) {
      const competetor = mergedFinals[j];
      if (competetor.scores.length < i + 1) {
        let missingCompetitions = getMissingCompetitions(
          finals.map((x) => x.name),
          competetor.scores.map((x) => x.key)
        );
        missingCompetitions.forEach((name) => {
          if (competetor.scores.length == i + 1) return;
          competetor.scores.push({
            key: name,
            place:
              categoryCounts[competetor.category as keyof typeof Categories],
            score3: 0,
            score5: 0,
            // score7: 0,
            // score9: 0,
          });
        });
      }
    }
  }
  return mergedFinals
};

const getMaxCountOfCompetetorsIn = (
  list: finalsWithScores[][],
  category: Categories
) => {
  let max = Math.max(
    ...list.map((x) => x.filter((x) => x.category == category).length)
  );
  return max + 1;
};

const CompetetorsIndexInList = (list: mergedFinals[], competetor: final) => {
  let [firstName, secondName] = competetor.name.trim().split(" ") as [
    string,
    string
  ];
  return list.findIndex((x) => {
    let [existingFirstName, existingSecondName] = x.name.split(" ") as [
      string,
      string
    ];
    return (
      compareToStrings(firstName, existingFirstName) &&
      compareToStrings(secondName, existingSecondName) &&
      x.category == competetor.category
    );
  });
};

const compareToStrings = (a: string, b: string): boolean => {
  let missMatchedCharacters = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] != b[i]) missMatchedCharacters += 1;
  }
  return missMatchedCharacters <= 1;
};

const getMissingCompetitions = (
  listOfAllCompetitions: string[],
  listOfCompetetorsCompetitions: string[]
): string[] => {
  return listOfAllCompetitions.filter(
    (x) => !listOfCompetetorsCompetitions.includes(x)
  );
};
