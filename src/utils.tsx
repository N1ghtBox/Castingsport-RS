import { ArgsProps } from "antd/es/message";
import { Categories, Teams } from "./enums";
import DataType from "./interfaces/dataType";
import { team } from "./IpcMainMaker";

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
export type mergedFinalsTeams = Omit<final, "club" | "girl" | "team"> & {
  scores: score[];
};
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
  console.log(finals)
  let mergedFinalsTeams: mergedFinalsTeams[] = [];
  //Dont kill me for polish signs :((
  let teamsCount: { [K in keyof typeof Teams]: number } = {
    Młodzieżowa: getMaxCountOfCompetetorsIn({
      type: "Team",
      list: finals.map((x) => x.scores.teams),
      team: Teams.Młodzieżowa,
    }),
    Seniorów: getMaxCountOfCompetetorsIn({
      type: "Team",
      list: finals.map((x) => x.scores.teams),
      team: Teams.Seniorów,
    }),
    Kobiet: getMaxCountOfCompetetorsIn({
      type: "Team",
      list: finals.map((x) => x.scores.teams),
      team: Teams.Kobiet,
    }),
    Indywidualnie: 0,
  };

  for (let i = 0; i < finals.length; i++) {
    const final = finals[i];
    for (let j = 0; j < final.scores.teams.length; j++) {
      const team = final.scores.teams[j];
      let indexInList = TeamsIndexInList(mergedFinalsTeams, team);
      if (indexInList < 0)
        mergedFinalsTeams.push({
          ...team,
          scores: [
            {
              key: final.name,
              place: team.place,
              score3: team.score,
              score5: team.score,
              // score7: competetor.score7,
              // score9: competetor.score9,
            },
          ],
        });
      else {
        mergedFinalsTeams[indexInList].scores.push({
          key: final.name,
          place: team.place,
          score3: team.score,
          score5: team.score,
          // score7: competetor.score7,
          // score9: competetor.score9,
        });
      }
    }
  }

  for (let j = 0; j < mergedFinalsTeams.length; j++) {
    const team = mergedFinalsTeams[j];
    const currentComps = team.scores.map((x) => x.key);
    let allComps = finals.map((x) => x.name)
    let missingCompetitions = allComps.filter(x => !currentComps.includes(x));
    for (let i = 0; i < missingCompetitions.length; i++) {
      const element = missingCompetitions[i];
      team.scores.push({
        key: element,
        place:
          teamsCount[team.category as keyof typeof Teams],
        score3: 0,
        score5: 0,
      })
    }
  }

  console.log(mergedFinalsTeams);

  return mapToMergedFinals(mergedFinalsTeams);
};

export const generateIndividualMergedFinals = (
  finals: { name: string; scores: { individual: finalsWithScores[] } }[]
) => {
  let mergedFinals: mergedFinals[] = [];

  let categoryCounts: { [K in keyof typeof Categories]: number } = {
    Kadet: getMaxCountOfCompetetorsIn({
      type: "Individual",
      list: finals.map((x) => x.scores.individual),
      category: Categories.Kadet,
    }),
    Junior: getMaxCountOfCompetetorsIn({
      type: "Individual",
      list: finals.map((x) => x.scores.individual),
      category: Categories.Kadet,
    }),
    Juniorka: getMaxCountOfCompetetorsIn({
      type: "Individual",
      list: finals.map((x) => x.scores.individual),
      category: Categories.Kadet,
    }),
    Kobieta: getMaxCountOfCompetetorsIn({
      type: "Individual",
      list: finals.map((x) => x.scores.individual),
      category: Categories.Kadet,
    }),
    Senior: getMaxCountOfCompetetorsIn({
      type: "Individual",
      list: finals.map((x) => x.scores.individual),
      category: Categories.Kadet,
    }),
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
  return mergedFinals;
};

const getMaxCountOfCompetetorsIn = (
  params:
    | {
        type: "Individual";
        list: finalsWithScores[][];
        category: Categories;
      }
    | {
        type: "Team";
        list: team[][];
        team: Teams;
      }
) => {
  let max = 0;
  if (params.type == "Individual")
    max = Math.max(
      ...params.list.map(
        (x) => x.filter((x) => x.category == params.category).length
      )
    );
  if (params.type == "Team")
    max = Math.max(
      ...params.list.map(
        (x) => x.filter((x) => x.category == params.team).length
      )
    );
  return max + 1;
};

const TeamsIndexInList = (list: mergedFinalsTeams[], team: team) => {
  return list.findIndex(
    (x) =>
      compareWithTolerance(x.name, team.name, 4) && x.category == team.category
  );
};

const CompetetorsIndexInList = (list: mergedFinals[], competetor: final) => {
  return list.findIndex(
    (x) =>
      compareWithTolerance(x.name, competetor.name, 3) &&
      x.category == competetor.category
  );
};

const getMissingCompetitions = (
  listOfAllCompetitions: string[],
  listOfCompetetorsCompetitions: string[]
): string[] => {
  return listOfAllCompetitions.filter(
    (x) => !listOfCompetetorsCompetitions.includes(x)
  );
};

const mapToMergedFinals = (
  mergedFinalsTeams: mergedFinalsTeams[]
): mergedFinals[] => {
  return mergedFinalsTeams.map((x) => {
    return {
      category: x.category,
      club: x.category,
      girl: false,
      name: x.name,
      team: x.name,
      scores: x.scores,
    };
  });
};

function levenshteinDistance(s1: string, s2: string) {
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix = Array.from(Array(s1.length + 1), () =>
    Array(s2.length + 1).fill(0)
  );

  for (let i = 0; i <= s1.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[s1.length][s2.length];
}

export function compareWithTolerance(s1: string, s2: string, tolerance: number) {
  const distance = levenshteinDistance(s1.trim(), s2.trim());
  return distance <= tolerance;
}
