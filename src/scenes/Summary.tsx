import { Breadcrumb, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { summary } from "../";
import { HomeOutlined } from "@ant-design/icons";
import { Categories } from "../enums";
import { x } from "pdfkit";

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
            if(competetor.scores.length == i + 1) return
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
    let [firstName, secondName] = competetor.name.trim().split(" ") as [string, string];
    return list.findIndex((x) => {
      let [existingFirstName, existingSecondName] = x.name.split(" ") as [string, string];
      return (
        compareToStrings(firstName, existingFirstName) &&
        compareToStrings(secondName, existingSecondName)
      );
    });
  };

  const compareToStrings = (a:string, b:string): boolean => {
    let missMatchedCharacters = 0
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if(a[i] != b[i]) missMatchedCharacters += 1
    }
    return missMatchedCharacters <= 1
  }

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

  const sortByScores = (a: mergedFinals, b: mergedFinals) => {
    return (
      b.scores
        .map((x) => x.score5)
        .reduce((totalScore, score) => totalScore + score) -
      a.scores
        .map((x) => x.score5)
        .reduce((totalScore, score) => totalScore + score)
    );
  };

  const sortByPlaces = (a: mergedFinals, b: mergedFinals) => {
    return (
      a.scores
        .map((x) => x.place)
        .reduce((totalScore, score) => totalScore + score) -
      b.scores
        .map((x) => x.place)
        .reduce((totalScore, score) => totalScore + score)
    );
  };

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
        <Column
          title="Imię i nazwisko"
          dataIndex="name"
          key="name"
          align="center"
        />
        <Column title="Okręg/Klub" dataIndex="club" key="club" align="center" />
        {competitions.map(name => (
          <ColumnGroup
            className={'summaryColumnGroup'}
            title={<span style={{ fontSize: "12px" }}>{name}</span>}
            align="center"
            key={name}
          >
            <Column
              title="Miejsce"
              key={"place"}
              align="center"
              className={`summaryColumn left`}
              render={(val: mergedFinals) => (
                <span style={{ fontWeight: 700 }}>
                  {val.scores.find(x => x.key == name).place}
                </span>
              )}
            />
            <Column
              title="Wynik"
              key={"score"}
              align="center"
              className={`summaryColumn right`}
              render={(val: mergedFinals) => (
                <span style={{ fontWeight: 700 }}>
                  {val.scores.find((x) => x.key == name).score5}
                </span>
              )}
            />
          </ColumnGroup>
        ))}
        <Column
          title="Łączny wynik"
          key="totalScore"
          align="center"
          render={(val: mergedFinals) =>
            val.scores
              .map((x) => x.score5)
              .reduce((totalScore, score) => totalScore + score)
              .toFixed(2)
          }
        />
        <Column title="Miejsce" dataIndex="key" key="club" align="center" />
      </Table>
    </>
  );
};

export default Summary;
