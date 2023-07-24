import { Select, Table } from "antd";
import { useEffect, useState } from "react";
import {
  checkIfTakesPart,
  getCategoriesForDiscipline,
  mapToTeams,
} from "../utils";
import { Categories, Teams } from "../enums";
import DataType from "../interfaces/dataType";

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

export const teamResultsColumns: ColumnTypes = [
  {
    title: "Drużyna",
    dataIndex: "teamName",
    align: "center",
  },
  {
    title: "Drużyna",
    dataIndex: "team",
    align: "center",
  },
  {
    title: "Wyniki",
    dataIndex: "scores",
    align: "center",
  },
  {
    title: "Total",
    dataIndex: "total",
    align: "center",
    sorter: (a: any, b: any) => {
      return a.total - b.total;
    },
    render: (value) => {
      return `${value ? value.toFixed(3) : ""}`;
    },
    defaultSortOrder: "descend",
    sortOrder: "descend",
  },
];

type team = {
  team: string;
  scores: string;
  total: number;
  teamName: string;
  key: React.Key;
};

const ResultsTable = (props: IProps) => {
  const [results, setResults] = useState<any[]>(props.dataSource);

  const changeType = (key: "Indywidualnie" | "Drużyny") => {
    if (key === "Indywidualnie") {
      let localDatasource = [...props.dataSource];
      if (props.selectedCategory === "Junior") {
        setResults(
          localDatasource.filter((value) => {
            if (value.category === Categories.Junior) return true;
            if (value.girl) return false;
            return checkIfTakesPart(value, props.disciplineRange);
          })
        );
      } else if (props.selectedCategory === "Juniorka") {
        setResults(
          localDatasource.filter((value) => {
            if (value.category === Categories.Juniorka) return true;
            if (!value.girl) return false;
            return checkIfTakesPart(value, props.disciplineRange);
          })
        );
      } else {
        setResults(
          localDatasource.filter((value) => {
            return checkIfTakesPart(value, props.disciplineRange);
          })
        );
      }
    } else {
      let competetorsGroupByTeam: team[] = [];
      props.dataSource.forEach((value) =>
        mapToTeams(
          value,
          competetorsGroupByTeam,
          props.getScores,
          props.selectedTeamType
        )
      );
      setResults([...competetorsGroupByTeam]);
    }
  };
  useEffect(() => {
    changeType(props.type);
  }, [props.getScores, props.dataSource]);

  const createCateogries = () => {
    let categories = [
      ...Object.keys(Categories)
        .slice(...getCategoriesForDiscipline(props.finalKey))
        .map((key) => {
          return {
            label: key,
            value: key,
          };
        }),
    ];

    if (!categories.find((value) => value.label === props.selectedCategory)) {
      props.handleCategoryChange(categories[0].value);
    }
    return categories;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          height: "5vh",
          alignItems: "center",
          gap: "30px",
        }}
      >
        {props.type !== "Drużyny" ? (
          <Select
            style={{ width: 120, marginLeft: 16 }}
            onChange={props.handleCategoryChange}
            value={props.selectedCategory}
            options={createCateogries()}
          />
        ) : (
          <Select
            style={{ width: 120, marginLeft: 16 }}
            onChange={props.handleTeamTypeChange}
            value={props.selectedTeamType}
            options={Object.keys(Teams)
              .slice(1)
              .map((key) => {
                return {
                  label: key,
                  value: key,
                };
              })}
          />
        )}

        <Select
          style={{ width: 120, marginLeft: 16 }}
          onChange={(value: any) => {
            props.setType(value);
            changeType(value);
          }}
          value={props.type}
          options={[
            {
              label: "Indywidualnie",
              value: "Indywidualnie",
            },
            {
              label: "Drużyny",
              value: "Drużyny",
            },
          ]}
        />
      </div>
      <Table
        rowClassName={() => "border"}
        bordered
        showSorterTooltip={false}
        pagination={{ pageSize: props.type === "Drużyny" ? 10 : 16 }}
        style={{ whiteSpace: "pre" }}
        dataSource={results}
        columns={
          props.type === "Drużyny"
            ? teamResultsColumns
            : (props.columns as ColumnTypes)
        }
      />
    </div>
  );
};

interface IProps {
  dataSource: DataType[];
  columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];
  handleCategoryChange: (key: string) => void;
  selectedCategory: string;
  selectedTeamType: string;
  handleTeamTypeChange: (key: string) => void;
  getScores: (value: DataType) => number;
  type: "Indywidualnie" | "Drużyny";
  setType: (value: "Indywidualnie" | "Drużyny") => void;
  disciplineRange: [number, number];
  finalKey: number;
}

export default ResultsTable;
