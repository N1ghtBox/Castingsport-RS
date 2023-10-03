import {
  HomeOutlined,
  PrinterOutlined,
  SettingOutlined
} from "@ant-design/icons";
import {
  Breadcrumb,
  ConfigProvider,
  FloatButton,
  Select,
  Table,
  Tooltip
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { summary } from "../";
import { Categories } from "../enums";
import { KeysOfType } from "../HelperTypes";

const { ipcRenderer } = window.require("electron");

const { Column, ColumnGroup } = Table;

type final = {
  category: string;
  club: string;
  girl: boolean;
  name: string;
  team: string;
};

type score = {
  key: string;
  place: number;
  score3: number;
  score5: number;
  // score7: number;
  // score9: number;
};

type mergedFinals = final & { scores: score[] };
type finalsWithScores = final & score;

const Summary = () => {
  const summaryData = useLoaderData() as summary;
  const navigate = useNavigate();
  const [finals, setFinals] = useState<mergedFinals[]>([]);
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof Categories>("Kadet");

  useEffect(() => {
    if (!competitions) return;
    const columnGroups = document.querySelectorAll<HTMLDivElement>(
      ".summaryColumnGroup"
    );
    let width = (window.outerWidth - 5 * 100) / competitions.length;
    columnGroups.forEach((x) => (x.style.width = `${width}px`));
  }, [competitions]); 

  useEffect(() => {
    (async () => {
      const localFinals: { name: string; scores: finalsWithScores[] }[] =
        await ipcRenderer.invoke("getFinalsById", summaryData.compIds);
        setCompetitions(localFinals.map((x) => x.name));
        setFinals(mergeFinals(localFinals) || []);
    })();
  }, []);

  const mergeFinals = (
    finals: { name: string; scores: finalsWithScores[] }[]
  ) => {
    let mergedFinals: mergedFinals[] = [];
    let categoryCounts: { [K in keyof typeof Categories]: number } = {
      Kadet: getMaxCountOfCompetetorsIn(
        finals.map((x) => x.scores),
        Categories.Kadet
      ),
      Junior: getMaxCountOfCompetetorsIn(
        finals.map((x) => x.scores),
        Categories.Junior
      ),
      Juniorka: getMaxCountOfCompetetorsIn(
        finals.map((x) => x.scores),
        Categories.Juniorka
      ),
      Kobieta: getMaxCountOfCompetetorsIn(
        finals.map((x) => x.scores),
        Categories.Kobieta
      ),
      Senior: getMaxCountOfCompetetorsIn(
        finals.map((x) => x.scores),
        Categories.Senior
      ),
    };
    for (let i = 0; i < finals.length; i++) {
      const final = finals[i];
      for (let j = 0; j < final.scores.length; j++) {
        const competetor = final.scores[j];
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

  const getMissingCompetitions = (
    listOfAllCompetitions: string[],
    listOfCompetetorsCompetitions: string[]
  ): string[] => {
    return listOfAllCompetitions.filter(
      (x) => !listOfCompetetorsCompetitions.includes(x)
    );
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
        compareToStrings(secondName, existingSecondName)
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

  const handleCategoryChange = (category: keyof typeof Categories) => {
    setSelectedCategory(category);
  };

  const createCategories = () => {
    let categories = [
      ...Object.keys(Categories).map((key) => {
        return {
          label: key,
          value: key,
        };
      }),
    ];

    return categories;
  };

  const SumByProperty = useCallback((propety: KeysOfType<score, number>) => {
    return (scores: score[]) =>
      scores
        .map((x) => x[propety])
        .reduce((totalScore, score) => totalScore + score);
  }, []);

  const sortByScores = useCallback((a: mergedFinals, b: mergedFinals) => {
    let getTotalScore = SumByProperty(
      ScoreForCategory()
    );
    return getTotalScore(b.scores) - getTotalScore(a.scores);
  }, []);

  const sortByPlaces = useCallback((a: mergedFinals, b: mergedFinals) => {
    let getTotalScore = SumByProperty("place");
    return getTotalScore(a.scores) - getTotalScore(b.scores);
  }, []);

  const FindByCompetitionName = useCallback(
    (
      scores: score[],
      compName: string,
      property: KeysOfType<score, number>
    ) => {
      return scores.find((x) => x.key == compName)[property];
    },
    []
  );

  const PrintOrExportSummary = useCallback(
    (action: "printResults" | "exportToPdf") => {
      let localFinals = finals
        .filter((x) => x.category === selectedCategory)
        .sort(sortByScores)
        .sort(sortByPlaces)
        .map((x: mergedFinals, place: number) => {
          return { ...x, key: place + 1 , totalPlace:SumByProperty("place")(x.scores), totalScore:SumByProperty(ScoreForCategory())(x.scores) };
        });
      navigate(`/summaryPrint`, {
        state: { summaryData, finals: localFinals, action, competitions},
      });
    },
    [finals, competitions, summaryData]
  );

  const ScoreForCategory = () => {
    return selectedCategory === "Kadet" ? "score3" : "score5"
  }

  return (
    <>
      <Breadcrumb
        key={"breadcrumbsSummary"}
        style={{ marginLeft: 16 }}
        items={[
          {
            title: <HomeOutlined />,
            onClick: async () => {
              navigate("/summaries");
            },
          },
          {
            title: summaryData.name,
          },
        ]}
      />
      <div
        style={{
          display: "flex",
          height: "5vh",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <Select
          style={{ width: 120, marginLeft: 16 }}
          onChange={handleCategoryChange}
          value={selectedCategory}
          options={[...createCategories()]}
        />
      </div>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#d9363e",
          },
        }}
      >
        <FloatButton.Group
          trigger="click"
          type="primary"
          style={{ right: 24 }}
          className={"changeBg"}
          icon={<SettingOutlined />}
        >
          <Tooltip title="Wydrukuj">
            <FloatButton icon={<PrinterOutlined />} onClick={() => PrintOrExportSummary('printResults')} />
          </Tooltip>
        </FloatButton.Group>
      </ConfigProvider>
      <Table
        dataSource={finals
          .filter((x) => x.category === selectedCategory)
          .sort(sortByScores)
          .sort(sortByPlaces)
          .map((x: mergedFinals, place: number) => {
            return { ...x, key: place + 1 };
          })}
        key="table"
      >
        <Column title="Miejsce" dataIndex="key" key="place" align="center" />
        <Column
          title="Imię i nazwisko"
          dataIndex="name"
          key="name"
          align="center"
        />
        <Column title="Okręg/Klub" dataIndex="club" key="club" align="center" />
        {competitions.map((name, i) => (
          <ColumnGroup
            className={`summaryColumnGroup ${i % 2 == 0 ? 'summaryBackgroundChange' : ''}`}
            title={<span style={{ fontSize: "12px" }}>{name}</span>}
            align="center"
            key={name}
          >
            <Column
              title="Miejsce"
              key={"place"}
              align="center"
              className={`summaryColumn left ${i % 2 == 0 ? 'summaryBackgroundChange' : ''}`}
              render={(val: mergedFinals) => (
                <span style={{ fontWeight: 700 }}>
                  {FindByCompetitionName(val.scores, name, "place")}
                </span>
              )}
            />
            <Column
              title="Punkty"
              key={"score"}
              align="center"
              className={`summaryColumn right ${i % 2 == 0 ? 'summaryBackgroundChange' : ''}`}
              render={(val: mergedFinals) => (
                <span style={{ fontWeight: 700 }}>
                  {FindByCompetitionName(
                    val.scores,
                    name,
                    ScoreForCategory()
                  )}
                </span>
              )}
            />
          </ColumnGroup>
        ))}
        <Column
          title="Łączna ilość punktów"
          key="totalScore"
          align="center"
          render={(val: mergedFinals) =>
            SumByProperty(ScoreForCategory())(
              val.scores
            ).toFixed(2)
          }
        />
        <Column
          title="Ilość punktów"
          key="totalScore"
          align="center"
          render={(val: mergedFinals) => SumByProperty("place")(val.scores)}
        />
      </Table>
    </>
  );
};

export default Summary;
