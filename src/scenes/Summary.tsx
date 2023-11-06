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
import { summary, team } from "../";
import { Categories } from "../enums";
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
    return type == "Individual" ? generateIndividualMergedFinals(finals) : generateTeamsMergedFinals(finals);
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
    []
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
      return comp.category === selectedCategory;
    },
    [selectedCategory]
  );

  const ScoreForCategory = () => {
    return selectedCategory === "Kadet" ? "score3" : "score5";
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
        <Column
          title={type == "Individual" ? "Imię i nazwisko" : "Skład"}
          dataIndex="name"
          key="name"
          align="center"
        />
        <Column title={type == "Individual" ? "Okręg/Klub" : "Drużyna"} dataIndex="club" key="club" align="center" />
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
          title="Łączna ilość punktów"
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
