import moment from "moment";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IResultFinalsTeam from "../interfaces/IResultFinalsTeam";
import { getTotalScore, mapToTeams } from "../utils";
const { ipcRenderer } = window.require("electron");
import "moment/locale/pl";

let disciplines = ["3-bój", "5-bój", "2-bój odległościowy", "2-bój multi"];

const ResultsFinals = (props: IProps) => {
  const { state } = useLocation();
  const [results, setResults] = useState<IResultFinalsTeam[]>([]);
  const [info, setInfo] = useState<any>();
  const navigate = useNavigate();

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

  useEffect(() => {
    let localResults: any[] = [];
    state.results.forEach((result: any) =>
      mapToTeams(
        result,
        localResults,
        getTotalScore(state.info.dNumber),
        state.info.type
      )
    );
    localResults.sort(
      (a: IResultFinalsTeam, b: IResultFinalsTeam) => b.total - a.total
    );
    setResults(localResults);
    setInfo(state.info);
    (async () => {
      ipcRenderer.invoke(state.action, `Drużyna_${state.info.type}.pdf`);
    })();
  }, [state]);

  const returnResult = (result: IResultFinalsTeam, index: number) => {
    return (
      <tr key={result.key}>
        <td
          style={{
            fontWeight: "900",
            paddingBlock: "10px",
            border: "2px solid black",
          }}
        >
          {index + 1}
        </td>
        <td
          style={{ width: "25%", border: "2px solid black", whiteSpace: "pre" }}
        >
          {result.teamName}
        </td>
        <td
          style={{ width: "25%", border: "2px solid black", whiteSpace: "pre" }}
        >
          {result.team}
        </td>
        <td
          style={{ width: "20%", border: "2px solid black", whiteSpace: "pre" }}
        >
          {result.scores}
        </td>
        <td
          style={{
            fontWeight: "400",
            fontSize: "13px",
            border: "2px solid black",
            width: "10%",
          }}
        >
          {`${result.total.toFixed(3)}`}
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
          {info ? `Drużyna - ${state.info.type}` : ""}
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
              <th style={{ width: "5%", border: "2px solid black" }}>
                Zajęte miejsce
              </th>
              <th style={{ border: "2px solid black" }}>Nazwa</th>
              <th style={{ border: "2px solid black" }}>Skład</th>
              <th style={{ border: "2px solid black" }}>Wyniki</th>
              <th style={{ border: "2px solid black" }}>Razem</th>
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {info
              ? results.map((result: IResultFinalsTeam, index: number) =>
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
