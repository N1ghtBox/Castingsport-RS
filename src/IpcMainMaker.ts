import { dialog, shell } from "electron";
import isDev from "electron-is-dev";
import { readFile, writeFile } from "jsonfile";
import { Collection, Db, Document } from "mongodb";
import xlsx from "node-xlsx";
import {
  Categories,
  ParseStringToCategory,
  ParseStringToTeam,
  Teams,
} from "./enums";
import DataType from "./interfaces/dataType";

const filePath = isDev ? "./data.json" : "./../data.json";

export const SetupIpcMain = (Ipc: Electron.IpcMain, Database: Db) => {
  CompetitionsEndpoints(Ipc);
  SummaryEndpoints(Ipc);
  DevEndpoints(Ipc);
  MiscellaneousEndpoints(Ipc);
  TeamsEndpoints(Ipc, Database.collection("Teams"));
};

const DevEndpoints = (Ipc: Electron.IpcMain) => {
  Ipc.handle("DEV_getData", async (_: any) => {
    let json: json = await readFile(filePath);

    let path = dialog.showSaveDialogSync({
      defaultPath: "data.json",
      filters: [{ name: "Plik JSON", extensions: ["json"] }],
    });
    await writeFile(`${path}`, json);
    return true;
  });

  Ipc.handle("DEV_importData", async (_: any) => {
    let path = dialog.showOpenDialogSync({
      defaultPath: "data.json",
      properties: ["openFile"],
      filters: [{ name: "", extensions: ["json"] }],
    });
    let json: json = await readFile(`${path[0]}`);
    await writeFile(filePath, json);
    return true;
  });

  Ipc.handle("DEV_getLicense", async (_: any) => {
    let json: json = await readFile(filePath);
    let license = json.license;
    if (!license)
      return {
        valid: false,
        errorMessage: "Nie znaleziono prawidlowej licencji",
      };
    let myDipher = decipher("Yjxs8W91HjG!NbJ&yhtN");
    return myDipher(license);
  });
};

const MiscellaneousEndpoints = (Ipc: Electron.IpcMain) => {
  Ipc.handle("openLinkedIn", async () => {
    await shell.openExternal(
      "https://www.linkedin.com/in/dawid-witczak-568591226/"
    );
    return;
  });

  Ipc.handle("importFromFile", async (_: any, competitionId: string) => {
    let path = dialog.showOpenDialogSync({
      filters: [{ name: "Excel", extensions: ["xlsx"] }],
      properties: ["openFile"],
    });

    if (path.length == 0) {
      console.warn("Did not choose any file");
      return;
    }

    let workSheetsFromFile = xlsx.parse(path[0])[0].data;

    let club = "";
    let competetors: DataType[] = [];

    let json: json = await readFile(filePath);

    let competition = json.competitions.find((x) => x.id == competitionId);

    if (competition == null) {
      return;
    }

    let lastKey = Math.max(
      ...competition.competetors.map((x) => parseInt(x.key.toString())),
      0
    );

    for (let i = 0; i < workSheetsFromFile.length; i++) {
      const row = workSheetsFromFile[i];
      if (i == 7) {
        club = row[2];
      } else if (i >= 17 && i <= 29 && row[1]) {
        let girl = row[4].toLowerCase() == "kadetka";

        let disciplines: { [key: number]: boolean } = {
          1: row[7] == "tak",
          2: row[7] == "tak",
          3: row[6] == "tak",
          4: row[6] == "tak",
          5: row[6] == "tak",
          6: row[8] == "tak",
          7: row[8] == "tak",
          8: row[9] == "tak",
          9: row[9] == "tak",
        };

        if(row[10].toLowerCase() == 'młodzieży'){
          row[10] = 'Młodzieżowa'
        }

        competetors.push({
          key: `${lastKey + competetors.length + 1}`,
          disqualified: false,
          name: row[1],
          startingNumber: ``,
          team: ParseStringToTeam(row[10]),
          club: club,
          disciplines: Array.from({ length: 9 }, (_: any, i: number) => {
            return {
              score: 0,
              number: i + 1,
              score2: 0,
              time: "",
              takesPart: disciplines[i + 1],
            };
          }),
          girl: girl,
          category: girl ? Categories.Kadet : ParseStringToCategory(row[4]),
        });
      }
    }

    competition.competetors = [...competition.competetors, ...competetors];

    await writeFile(filePath, json);
  });

  Ipc.handle(
    "checkLicense",
    async (): Promise<{ valid: boolean; errorMessage: string }> => {
      let json: json = await readFile(filePath);
      let license = json.license;
      if (!license)
        return {
          valid: false,
          errorMessage: "Nie znaleziono prawidlowej licencji",
        };
      let myDipher = decipher("Yjxs8W91HjG!NbJ&yhtN");
      let decodedLicense = myDipher(license);
      let splitLicense = decodedLicense.split(":");
      if (splitLicense[0] !== "Castingsport-RS")
        return {
          valid: false,
          errorMessage: "Nie znaleziono prawidlowej licencji",
        };
      let date = new Date(splitLicense[1]);
      if (date < new Date())
        return { valid: false, errorMessage: "Licencja wygasla" };
      return { valid: true, errorMessage: "" };
    }
  );

  Ipc.handle(
    "saveLicense",
    async (
      _: any,
      ...args: any[]
    ): Promise<{ valid: boolean; errorMessage: string }> => {
      let json: json = await readFile(filePath);
      let license = args[0];
      if (!license)
        return {
          valid: false,
          errorMessage: "Nie znaleziono prawidlowej licencji",
        };
      let myDipher = decipher("Yjxs8W91HjG!NbJ&yhtN");
      let decodedLicense = myDipher(license);
      let splitLicense = decodedLicense.split(":");
      if (splitLicense[0] !== "Castingsport-RS")
        return {
          valid: false,
          errorMessage: "Nie znaleziono prawidlowej licencji",
        };
      let date = new Date(splitLicense[1]);
      if (date < new Date())
        return { valid: false, errorMessage: "Licencja wygasla" };
      json.license = license;
      await writeFile(filePath, json);
      return { valid: true, errorMessage: "" };
    }
  );
  // #endregion
};

const CompetitionsEndpoints = (Ipc: Electron.IpcMain) => {
  Ipc.handle("getCompetitions", async () => {
    let json: json = await readFile(filePath);
    return json.competitions.map((comp) => {
      return {
        ...comp,
        year: parseInt(comp.date.replace(" r.", "").split(" ").at(-1)),
      };
    });
  });

  Ipc.handle("importList", async (_: any, ...args: any[]) => {
    let path = dialog.showOpenDialogSync({
      filters: [{ name: "Plik JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    let data = await readFile(path[0]);
    return JSON.stringify(data.data);
  });

  Ipc.handle("saveCompetiton", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    let compIndex = json.competitions.findIndex((x) => x.id == args[0].id);
    let oldComp = json.competitions[compIndex];
    json.competitions[compIndex] = {
      ...oldComp,
      competetors: args[1]
        ? args[0].competetors.filter((x: any) => x.startingNumber)
        : args[0].competetors,
    };
    await writeFile(filePath, json);
    return true;
  });

  Ipc.handle("getById", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    let compIndex = json.competitions.findIndex((x) => x.id == args[0]);
    return json.competitions[compIndex];
  });

  Ipc.handle("createNewComp", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    let generatedId = uuidv4();
    json.competitions.push({
      id: generatedId,
      ...args[0],
      summaryGenerated: false,
      competetors: [],
      finals: [],
    });
    await writeFile(filePath, json);
    return generatedId;
  });

  Ipc.handle("deleteComp", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    let compIndex = json.competitions.findIndex((x) => x.id == args[0]);

    json.competitions.splice(compIndex, 1);

    await writeFile(filePath, json);
    return json;
  });

  Ipc.handle("editComp", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    let compIndex = json.competitions.findIndex((x) => x.id == args[0].id);
    let compToEdit = json.competitions[compIndex];
    compToEdit = {
      ...compToEdit,
      mainJudge: args[0].mainJudge,
      secretaryJudge: args[0].secretaryJudge,
      logo: args[0].logo,
      name: args[0].name,
      date: args[0].date,
    };

    json.competitions.splice(compIndex, 1, compToEdit);

    await writeFile(filePath, json);
    return json.competitions;
  });
};

const SummaryEndpoints = (Ipc: Electron.IpcMain) => {
  Ipc.handle("getCompetitionsWithFinals", async () => {
    let json: json = await readFile(filePath);
    return json.competitions.filter((x) => x.finalId);
  });

  Ipc.handle("getSummaries", async () => {
    let json: json = await readFile(filePath);
    return json.summaries;
  });

  Ipc.handle("getSummary", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    return json.summaries.find((x) => x.id === args[0]);
  });

  Ipc.handle("getFinalsById", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    return args[0].map((id: string) => {
      let comp = json.finals.find((x) => x.id === id);
      return { scores: comp.scores, name: comp.name };
    });
  });

  Ipc.handle("addSummary", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    let newSummary = {
      ...args[0],
      id: uuidv4(),
    };
    if (!json.summaries) json.summaries = [];
    json.summaries = [...json.summaries, newSummary];
    await writeFile(filePath, json);
    return newSummary;
  });

  Ipc.handle("deleteSummary", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    json.summaries = json.summaries.filter((x) => x.id != args[0]);
    await writeFile(filePath, json);
    return json.summaries;
  });

  Ipc.handle("generateFinalResults", async (_: any, ...args: any[]) => {
    let json: json = await readFile(filePath);
    let id = args[0];
    let comp = json.competitions.find((x) => x.id == id);
    if (!comp) return false;

    let [IndividualScores, TeamsScores] = await Promise.all([
      generateIndividualScores(comp),
      generateTeamsScores(comp),
    ]);
    if (comp.finalId)
      json.finals.splice(
        json.finals.findIndex((x) => x.id == comp.finalId),
        1,
        {
          id: comp.finalId,
          scores: { individual: IndividualScores, teams: TeamsScores },
          name: comp.name,
        }
      );
    else {
      let finalId = uuidv4();
      json.finals.push({
        id: finalId,
        scores: { individual: IndividualScores, teams: TeamsScores },
        name: comp.name,
      });
      comp.finalId = finalId;
    }
    comp.summaryGenerated = true;
    await writeFile(filePath, json);

    return json.competitions;
  });
};

const TeamsEndpoints = (
  Ipc: Electron.IpcMain,
  TeamsCollection: Collection<Document>
) => {
  Ipc.handle("getTeams", async () => {
    let teams = await TeamsCollection.find({}).toArray();
    return teams;
  });

  Ipc.handle("createNewTeam", async (_: any, ...args: any[]) => {
    await TeamsCollection.insertOne(args[0]);
    return await TeamsCollection.find({}).toArray();
  });
};

const generateIndividualScores = async (comp: comp) => {
  const getScore = (competetor: any, range: [number, number]) => {
    let score = 0;
    for (let i = range[0] - 1; i < range[1]; i++) {
      let element: any = Object.values(competetor.disciplines).find(
        (x: any) => x.number == i + 1
      );
      score +=
        typeof element.score == "string"
          ? parseFloat(element.score) * ([5, 7, 9].includes(i + 1) ? 1.5 : 1)
          : element.score * ([5, 7, 9].includes(i + 1) ? 1.5 : 1);
      score += element.score2
        ? typeof element.score2 == "string"
          ? parseFloat(element.score2)
          : element.score2
        : 0;
    }
    return Math.round(score * 1000) / 1000;
  };

  let IndividualScores = comp.competetors.map((x) => {
    return {
      name: x.name,
      club: x.club,
      category: x.category,
      team: x.team,
      girl: x.girl,
      score3: getScore(x, [3, 5]),
      score5: getScore(x, [1, 5]),
      score7: getScore(x, [1, 7]),
      score9: getScore(x, [1, 9]),
      shouldInclude:
        x.disciplines[0].takesPart && x.category == Categories.Kadet,
    };
  });

  let groupedByCategory: any = {
    Kadet: [],
    Junior: [],
    Juniorka: [],
    Kobieta: [],
    Senior: [],
  };
  for (let i = 0; i < IndividualScores.length; i++) {
    const element = IndividualScores[i];
    groupedByCategory[element.category].push(element);
    if (
      element.category === "Kadet" &&
      (element.score3 < element.score5 || element.shouldInclude)
    ) {
      if (element.girl)
        groupedByCategory["Juniorka"].push({
          ...element,
          category: "Juniorka",
        });
      else groupedByCategory["Junior"].push({ ...element, category: "Junior" });
    }
  }

  IndividualScores = [];

  Object.keys(groupedByCategory).forEach((key) => {
    if (key === "Kadet")
      groupedByCategory[key].sort((a: any, b: any) => b.score3 - a.score3);
    else groupedByCategory[key].sort((a: any, b: any) => b.score5 - a.score5);
    IndividualScores = [
      ...IndividualScores,
      ...(groupedByCategory[key] as any[]).map((x: any, index: number) => {
        return { ...x, place: index + 1 };
      }),
    ];
  });

  return IndividualScores;
};

const generateTeamsScores = async (comp: comp): Promise<any[]> => {
  const getScore = (competetor: any, range: [number, number]) => {
    let score = 0;
    for (let i = range[0] - 1; i < range[1]; i++) {
      let element: any = Object.values(competetor.disciplines).find(
        (x: any) => x.number == i + 1
      );
      score +=
        typeof element.score == "string"
          ? parseFloat(element.score) * ([5, 7, 9].includes(i + 1) ? 1.5 : 1)
          : element.score * ([5, 7, 9].includes(i + 1) ? 1.5 : 1);
      score += element.score2
        ? typeof element.score2 == "string"
          ? parseFloat(element.score2)
          : element.score2
        : 0;
    }
    return Math.round(score * 1000) / 1000;
  };

  let IndividualScores = comp.competetors.map((x) => {
    return {
      name: x.name,
      club: x.club,
      category: x.category,
      team: x.team,
      girl: x.girl,
      score3: getScore(x, [3, 5]),
      score5: getScore(x, [1, 5]),
      score7: getScore(x, [1, 7]),
      score9: getScore(x, [1, 9]),
      shouldInclude:
        x.disciplines[0].takesPart && x.category == Categories.Kadet,
    };
  });

  let groupedByTeam = {
    Teen: [] as team[],
    Man: [] as team[],
    Woman: [] as team[],
  };

  const mapToTeamCategory = (
    team: string
  ): keyof typeof groupedByTeam | undefined => {
    if (team == Teams.Młodzieżowa) return "Teen";
    if (team == Teams.Kobiet) return "Woman";
    if (team == Teams.Seniorów) return "Man";
    return undefined;
  };

  IndividualScores.forEach((competetor) => {
    let category = mapToTeamCategory(competetor.team);
    if (!category) return;
    const teamCategoryArray = groupedByTeam[category];
    if (teamCategoryArray.find((x) => x.name == competetor.club)) {
      let indexOfExistingTeam = teamCategoryArray.findIndex(
        (x) => x.name == competetor.club
      );
      teamCategoryArray[indexOfExistingTeam].score += parseFloat(
        competetor.score5.toFixed(3)
      );
      teamCategoryArray[indexOfExistingTeam].team.push(competetor);
    } else {
      teamCategoryArray.push({
        name: competetor.club,
        score: parseFloat(competetor.score5.toFixed(3)),
        place: 0,
        category: competetor.team,
        team: [{ ...competetor }],
      });
    }
  });

  Object.keys(groupedByTeam).forEach((category: keyof typeof groupedByTeam) => {
    groupedByTeam[category] = groupedByTeam[category]
      .sort((a, b) => b.score - a.score)
      .map((team, i) => {
        return {
          ...team,
          score: parseFloat(team.score.toFixed(3)),
          place: i + 1,
        };
      });
  });

  return [...groupedByTeam.Man, ...groupedByTeam.Teen, ...groupedByTeam.Woman];
};

const decipher = (salt: string) => {
  const textToChars = (text: string) =>
    text.split("").map((c: string) => c.charCodeAt(0));
  const applySaltToChar = (code: any) =>
    textToChars(salt).reduce((a: number, b: number) => a ^ b, code);
  return (encoded: string) =>
    encoded
      .match(/.{1,2}/g)
      .map((hex: string) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
};

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type comp = {
  date: string;
  summaryGenerated: boolean;
  id: string;
  finalId: string;
  name: string;
  logo: string;
  mainJudge: string;
  secretaryJudge: string;
  competetors: DataType[];
};

export type summary = {
  id: string;
  name: string;
  compIds: string[];
};

export type team = {
  name: string;
  team: any[];
  category: string;
  score: number;
  place: number;
};

type json = {
  license: string;
  competitions: comp[];
  finals: {
    id: string;
    name: string;
    scores: { teams: any[]; individual: any[] };
  }[];
  summaries: summary[];
};
