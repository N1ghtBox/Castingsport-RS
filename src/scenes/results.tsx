import { Button, Checkbox, Input, InputNumber, Modal } from "antd";
import moment from "moment";
import "moment/locale/pl";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IResult from "../interfaces/IResult";
const { ipcRenderer } = window.require("electron");

let disciplines = [
  "Mucha cel",
  "Mucha odległość",
  "Spinning sprawnościowy 7,5g Arenberg",
  "Spinning cel 7,5g",
  "Odległość spinningowa jednoręczna 7,5g.",
  "Odległość muchowa oburęczna.",
  "Odległość spinningowa oburęczna 18g",
  "Multi-cel 18g jednorącz",
  "Multi-odległość 18g oburęczna",
  "3-bój",
  "5-bój",
  "2-bój odległościowy",
  "2-bój multi",
];

const Results = (props: IProps) => {
  moment.locale("pl");
  const { state } = useLocation();
  const [columns, setColumns] = useState([]);
  const [peopleInFinals, setFinals] = useState(0);
  const [open, setOpen] = useState(true);
  const [print, setStartPrint] = useState(false);
  const [results, setResults] = useState<IResult[]>([]);
  const [showFinals, setShowFinals] = useState(false);
  const [showFinalsModal, setShowFinalsModal] = useState(false);
  const [printWithFinals, setPrint] = useState(false);
  const [finalsResults, setFinalsResults] = useState<
    {
      key: React.Key;
      name: string;
      startingNumber: string;
      club: string;
      score: number;
      time?: string;
      scoreFinal?: number;
      timeFinal?: string;
    }[]
  >([]);
  const [info, setInfo] = useState<any>();
  const navigate = useNavigate();
  useEffect(() => {
    setColumns(state.columns);
    setResults(
      state.results.sort(sortByTime).sort((a: any, b: any) => {
        if (!a.score2 && !b.score2)
          return parseFloat(b.score) - parseFloat(a.score);
        return (
          parseFloat(b.score) +
          parseFloat(b.score2) -
          (parseFloat(a.score) + parseFloat(a.score2))
        );
      })
    );
    setInfo(state.info);
  }, [state]);

  useEffect(() => {
    if (printWithFinals || print)
      (async () => {
        await ipcRenderer.invoke(
          state.action,
          `Konkurencja-${state.info.dNumber}_${state.info.category}.pdf`
        );
      })();
  }, [print, printWithFinals]);

  const GenerateFinalInputRow = (comp: IResult) => {
    let index = finalsResults.findIndex((x) => x.key == comp.key);
    if (index < 0) return <span key={comp.key}></span>;
    let element = finalsResults[index];

    return (
      <div
        key={comp.key}
        style={{
          width: "100%",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <h3 style={{ width: "30%" }}>{comp.name}</h3>
        <InputNumber
          max={100}
          placeholder="Wynik"
          value={element.scoreFinal}
          onChange={(val) => {
            let localFinals = [...finalsResults];
            localFinals.splice(index, 1, { ...element, scoreFinal: val });
            setFinalsResults([...localFinals]);
          }}
          style={{ height: "40px" }}
        />
        {[1, 3, 4, 8].includes(state.info.dNumber) ? (
          <Input
            placeholder="_.__.__"
            value={element.timeFinal}
            onChange={(val) => {
              let localFinals = [...finalsResults];
              localFinals.splice(index, 1, {
                ...element,
                timeFinal: val.target.value,
              });
              setFinalsResults([...localFinals]);
            }}
            style={{ height: "40px", maxWidth: "100px" }}
          />
        ) : null}
      </div>
    );
  };

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

  const sortByTime = (a: IResult, b: IResult) => {
    let time = moment(b.time, "m.ss.SS");
    let difference = moment(a.time, "m.ss.SS").diff(time);
    return difference;
  };

  const sortByTimeFinal = (a: any, b: any) => {
    if (!a.timeFinal) return 0;
    let time = moment(b.timeFinal, "m.ss.SS");
    let difference = moment(a.timeFinal, "m.ss.SS").diff(time);
    return difference;
  };

  const renderResultOfDiscipline = (result: IResult, index: number) => {
    return (
      <tr
        key={result.key}
        style={{
          borderBottom:
            peopleInFinals > 0 && index + 1 == peopleInFinals
              ? "2px solid black"
              : "",
        }}
      >
        <td style={{ fontWeight: "900", paddingBlock: "10px" }}>
          {index + 1}
        </td>
        <td>{result.startingNumber}</td>
        <td>{result.name}</td>
        <td>{result.club}</td>
        <td>{result.score}</td>
        <td>{result.time ? result.time : result.score2 ? result.score2 : (result.score * 1.5).toFixed(3)}</td>
        {printWithFinals ? <td style={{fontWeight:700}}>{(result as any).scoreFinal}</td> : null}
        {printWithFinals && [1, 3, 4, 8].includes(state.info.dNumber) ? (
          <td style={{fontWeight:700}}>{(result as any).timeFinal}</td>
        ) : null}
      </tr>
    );
  };

  return (
    <div id="page" style={{ display: "flex", flexDirection: "column" }}>
      <Modal
        centered
        title="Ilość osób w finale"
        footer={[
          <Button
            key="cancleButton"
            danger
            onClick={() =>
              navigate("/scores", {
                state: { id: state.info.id, key: state.info.tabKey },
              })
            }
          >
            Cofnij
          </Button>,
          <Button
            key="brakButton"
            danger
            onClick={() => {
              setFinals(0);
              setOpen(false);
              setStartPrint(true);
            }}
          >
            Brak
          </Button>,
          <Button
            key="okButton"
            type="primary"
            danger
            onClick={() => {
              setOpen(false);
              if(showFinals){
                setShowFinalsModal(showFinals);
                setFinalsResults(
                  results.slice(0, peopleInFinals).map((comp) => {
                    return {
                      key: comp.key,
                      name: comp.name,
                      startingNumber: comp.startingNumber,
                      club: comp.club,
                      score: comp.score,
                      time: comp.time,
                      timeFinal: "",
                      scoreFinal: undefined,
                    };
                  })
                );

              }else{
                setStartPrint(true)
              }
            }}
          >
            Ok
          </Button>,
        ]}
        closable={false}
        width={300}
        open={open}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <InputNumber
            style={{ height: "40px", marginBottom: "15px" }}
            placeholder="Wprowadź ilość"
            value={peopleInFinals}
            onChange={(e) => setFinals(e)}
          />
          <Checkbox
            checked={showFinals}
            onChange={(e) => setShowFinals(e.target.checked)}
          >
            Wyniki
          </Checkbox>
        </div>
      </Modal>
      <Modal
        centered
        title="Wyniki finałów"
        footer={[
          <Button
            key="cancleButton"
            danger
            onClick={() => {
              setShowFinalsModal(false);
              setOpen(true);
            }}
          >
            Cofnij
          </Button>,
          <Button
            key="okButton"
            type="primary"
            danger
            onClick={() => {
              setOpen(false);
              setShowFinalsModal(false);
              setPrint(true);
            }}
          >
            Ok
          </Button>,
        ]}
        closable={false}
        width={600}
        open={showFinalsModal}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {finalsResults.map((x: any) => GenerateFinalInputRow(x))}
        </div>
      </Modal>
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
            {`Konkurencja ${state.info.dNumber}${printWithFinals ? ` - Finał` : ''}`}
          </h3>
          <h6 style={{ marginTop: 0, textAlign: "center" }}>
            {info ? disciplines[info.dNumber - 1] : ""}
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
          <thead style={{ borderBottom: "2px solid black !important" }}>
            <tr>
              <th>Zajęte miejsce</th>
              {columns.map((name) => (
                <th key={name}>{name}</th>
              ))}
              {printWithFinals ? (
                <th style={{ fontWeight: 900 }}>Wynik</th>
              ) : null}
              {printWithFinals && [1, 3, 4, 8].includes(state.info.dNumber) ? (
                <th style={{ fontWeight: 900 }}>Czas</th>
              ) : null}
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {printWithFinals
              ? [
                  ...finalsResults
                    .sort(sortByTimeFinal)
                    .sort((a, b) => b.scoreFinal - a.scoreFinal),
                  ...results.slice(peopleInFinals),
                ].map((result: any, index: number) =>
                  renderResultOfDiscipline(result, index)
                )
              : results.map((result: IResult, index: number) =>
                  renderResultOfDiscipline(result, index)
                )}
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
export default Results;
