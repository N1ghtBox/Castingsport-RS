import moment from "moment";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IResultFinals from "../interfaces/IResultFinals";
import {
  checkIfTakesPart,
  getDisciplineRangeForResults,
  getTotalScore,
} from "../utils";
const { ipcRenderer } = window.require("electron");
import "moment/locale/pl";

let disciplines = ["3-bój", "5-bój", "2-bój odległościowy", "2-bój multi"];

const ResultsFinals = (props: IProps) => {
  const { state } = useLocation();
  const [columns, setColumns] = useState([]);
  const [results, setResults] = useState<IResultFinals[]>([]);
  const [info, setInfo] = useState<any>();
  const navigate = useNavigate();

  useEffect(() => {
    setColumns(state.columns);
    let localResults: any[] = state.results;
    localResults = localResults.map((result: any) => {
      return {
        ...result,
        totalScore: getTotalScore(state.info.dNumber)(result),
      };
    });
    localResults.sort(
      (a: IResultFinals, b: IResultFinals) => b.totalScore - a.totalScore
    );
    localResults.filter((value) =>
      checkIfTakesPart(value, getDisciplineRangeForResults(state.info.dNumber))
    );
    setResults(localResults);
    setInfo(state.info);
    (async () => {
      ipcRenderer.invoke(
        state.action,
        `${disciplines[state.info.dNumber - 10]}_${state.info.category}.pdf`
      );
    })();
  }, [state]);

  useEffect(() => {
    document.addEventListener("keydown", (ev) => {
      if (ev.code === "Escape")
        navigate("/scores", {
          state: { id: state.info.id, key: state.info.tabKey },
        });
    });
    ipcRenderer.addListener("success", () => {
      navigate("/scores", {
        state: { id: state.info.id, key: state.info.tabKey },
      });
    });
    return () => {
      document.removeEventListener("keydown", () => {});
      ipcRenderer.removeAllListeners("success");
    };
  }, []);

  const returnResult = (result: IResultFinals, index: number) => {
    return (
      <tr key={result.key}>
        <td style={{ fontWeight: "900", paddingBlock: "10px" }}>{index + 1}</td>
        <td style={{ width: "5%" }}>{result.startingNumber}</td>
        <td style={{ width: "15%" }}>{result.name}</td>
        <td style={{ width: "20%" }}>{result.club}</td>
        {Object.values(result.disciplines)
          .slice(...getDisciplineRangeForResults(info.dNumber))
          .map((dis) => {
            return (
              <td key={dis.number} style={{ whiteSpace: "pre" }}>
                {`${
                  [5, 7, 9].includes(dis.number)
                    ? Math.round(dis.score * 1500) / 1000
                    : dis.score
                }${dis.score2 > 0 ? `\t${dis.score2}` : ""}`}
              </td>
            );
          })}
        <td style={{ fontWeight: "400", fontSize: "13px" }}>
          {`${result.totalScore.toFixed(3)}`}
        </td>
      </tr>
    );
  };

  const getName = () => {
    if (!info) return "";
    if (info.dNumber === 10) return `Konkurencje 3-5`;
    if (info.dNumber === 11) return `Konkurencje 1-5`;
    if (info.dNumber === 12) return `Konkurencje 6-7`;
    if (info.dNumber === 13) return `Konkurencje 8-9`;
    return "";
  };

  return (
    <div id="page" style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ height: "100px" }}>
          <img
            style={{ maxHeight: "100%" }}
            src={info ? info.logo : ""}
            alt=""
          ></img>
        </span>
        <span style={{ marginRight: "5%" }}>
          <h3
            style={{
              paddingBottom: "15px",
              borderBottom: "4px solid black",
              marginBottom: "5px",
              textAlign: "center",
            }}
          >
            {info ? info.name : ""}
          </h3>
          <h6 style={{ marginTop: 0, textAlign: "center" }}>
            {info ? info.date : ""}
          </h6>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            backgroundColor: "aqua",
            height: "fit-content",
            padding: "10px 50px",
            marginLeft: "15%",
            fontSize: "larger",
            fontWeight: "800",
          }}
        >
          {info ? info.category : ""}
        </div>
        <span style={{ marginRight: "5%" }}>
          <h3
            style={{
              paddingBottom: "15px",
              borderBottom: "4px solid black",
              paddingInline: "40px",
              marginBottom: "5px",
            }}
          >
            {getName()}
          </h3>
          <h6 style={{ marginTop: 0, textAlign: "center" }}>
            {info ? disciplines[info.dNumber - 10] : ""}
          </h6>
        </span>
      </div>
      <div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px",
            borderBottom: "2px solid black",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid black" }}>
              <th style={{ width: "5%" }}>Zajęte miejsce</th>
              {columns.map((name) => (
                <th key={name}>{name.replace("D","K")}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {info
              ? results.map((result: IResultFinals, index: number) =>
                  returnResult(result, index)
                )
              : null}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
            marginInline: "15px",
          }}
        >
          <span style={{ fontSize: "14px" }}>
            Sędzia główny
            <br />
            <br />
            {state.info.mainJudge}
          </span>
          <span style={{ fontSize: "14px" }}>
            {moment().format("Do MMMM YYYY, HH:mm")}
          </span>
          <span style={{ fontSize: "14px" }}>
            Sędzia sekretarz
            <br />
            <br />
            {state.info.secretaryJudge}
          </span>
        </div>
      </div>
    </div>
  );
};
interface IProps {}
export default ResultsFinals;
