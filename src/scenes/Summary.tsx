import {
  FilePdfOutlined,
  HomeOutlined,
  PrinterOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  ConfigProvider,
  FloatButton,
  Select,
  Table,
  Tooltip,
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { summary, team } from "../IpcMainMaker";
import { Categories, Teams } from "../enums";
import { KeysOfType } from "../HelperTypes";
import {
  finalsWithScores,
  generateIndividualMergedFinals,
  generateTeamsMergedFinals,
  mergedFinals,
  score,
} from "../utils";

const { ipcRenderer } = window.require("electron");

const { Column, ColumnGroup } = Table;

const Summary = () => {
  const summaryData = useLoaderData() as summary;
  const navigate = useNavigate();
  const [finals, setFinals] = useState<mergedFinals[]>([]);
  const [type, setType] = useState<"Individual" | "Teams">("Individual");
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof Categories>("Kadet");
  const [selectedCategoryTeams, setSelectedCategoryTeams] =
    useState<keyof typeof Teams>("Młodzieżowa");
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
      const localFinals: {
        name: string;
        scores: { individual: finalsWithScores[]; teams: team[] };
      }[] = await ipcRenderer.invoke("getFinalsById", summaryData.compIds);
      setRawData(localFinals);
      setCompetitions(localFinals.map((x) => x.name));
      setFinals(mergeFinals(localFinals) || []);
    })();
  }, []);

  useEffect(() => {
    setFinals(mergeFinals(rawData) || []);
  }, [type]);

  const mergeFinals = (
    finals: {
      name: string;
      scores: { individual: finalsWithScores[]; teams: team[] };
    }[]
  ) => {
    return IsShowingIndividual()
      ? generateIndividualMergedFinals(finals)
      : generateTeamsMergedFinals(finals);
  };

  const handleCategoryChange = (
    category: keyof typeof Categories | keyof typeof Teams
  ) => {
    if (Object.keys(Categories).includes(category))
      setSelectedCategory(category as keyof typeof Categories);
    else setSelectedCategoryTeams(category as keyof typeof Teams);
  };

  const createCategories = () => {
    if (IsShowingIndividual())
      return [
        ...Object.keys(Categories).map((key) => {
          return {
            label: key,
            value: key,
          };
        }),
      ];
    return [
      ...Object.keys(Teams)
        .filter((key) => key !== Teams.Indywidualnie)
        .map((key) => {
          return {
            label: key,
            value: key,
          };
        }),
    ];
  };

  const SumByProperty = useCallback((propety: KeysOfType<score, number>) => {
    return (scores: score[]) =>
      scores
        .map((x) => x[propety])
        .reduce((totalScore, score) => totalScore + score);
  }, []);

  const sortByScores = useCallback((a: mergedFinals, b: mergedFinals) => {
    let getTotalScore = SumByProperty(ScoreForCategory());
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
    [finals, type]
  );

  const PrintOrExportSummary = useCallback(
    (action: "printResults" | "exportToPdf") => {
      let localFinals = finals
        .filter(filterByCategory)
        .sort(sortByScores)
        .sort(sortByPlaces)
        .map((x: mergedFinals, place: number) => {
          return {
            ...x,
            key: place + 1,
            totalPlace: SumByProperty("place")(x.scores),
            totalScore: SumByProperty(ScoreForCategory())(x.scores),
          };
        });
      navigate(`/summaryPrint`, {
        state: { summaryData, finals: localFinals, action, competitions },
      });
    },
    [finals, competitions, summaryData]
  );

  const filterByCategory = useCallback(
    (comp: mergedFinals) => {
      if (type === "Teams") return comp.category == selectedCategoryTeams;
      return comp.category === selectedCategory;
    },
    [selectedCategory, selectedCategoryTeams, type]
  );

  const ScoreForCategory = () => {
    if (type === "Teams") return "score5";
    return selectedCategory === "Kadet" ? "score3" : "score5";
  };

  const IsShowingIndividual = () => {
    return type == "Individual";
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
          value={
            IsShowingIndividual() ? selectedCategory : selectedCategoryTeams
          }
          options={[...createCategories()]}
        />
        <Select
          style={{ width: 120, marginLeft: 16 }}
          onChange={(value: any) => {
            // props.setType(value);
            setType(value);
          }}
          value={type}
          options={[
            {
              label: "Indywidualnie",
              value: "Individual",
            },
            {
              label: "Drużyny",
              value: "Teams",
            },
          ]}
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
          <Tooltip title="Wyeksportuj do PDF">
            <FloatButton
              icon={<FilePdfOutlined />}
              onClick={() => PrintOrExportSummary("exportToPdf")}
            />
          </Tooltip>
          <Tooltip title="Wydrukuj">
            <FloatButton
              icon={<PrinterOutlined />}
              onClick={() => PrintOrExportSummary("printResults")}
            />
          </Tooltip>
        </FloatButton.Group>
      </ConfigProvider>
      <Table
        dataSource={finals
          .filter(filterByCategory)
          .sort(sortByScores)
          .sort(sortByPlaces)
          .map((x: mergedFinals, place: number) => {
            return { ...x, key: place + 1 };
          })}
        key="table"
      >
        <Column title="Miejsce" dataIndex="key" key="place" align="center" />
        {IsShowingIndividual() ? (
          <Column
            title={"Imię i nazwisko"}
            dataIndex="name"
            key="name"
            align="center"
          />
        ) : null}
        <Column
          title={IsShowingIndividual() ? "Okręg/Klub" : "Drużyna"}
          dataIndex={IsShowingIndividual() ? "club" : "name"}
          key="club"
          align="center"
        />
        {competitions.map((name, i) => (
          <ColumnGroup
            className={`summaryColumnGroup ${
              i % 2 == 0 ? "summaryBackgroundChange" : ""
            }`}
            title={<span style={{ fontSize: "12px" }}>{name}</span>}
            align="center"
            key={name}
          >
            <Column
              title="Miejsce"
              key={"place"}
              align="center"
              className={`summaryColumn left ${
                i % 2 == 0 ? "summaryBackgroundChange" : ""
              }`}
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
              className={`summaryColumn right ${
                i % 2 == 0 ? "summaryBackgroundChange" : ""
              }`}
              render={(val: mergedFinals) => (
                <span style={{ fontWeight: 700 }}>
                  {FindByCompetitionName(val.scores, name, ScoreForCategory())}
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
            SumByProperty(ScoreForCategory())(val.scores).toFixed(2)
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
