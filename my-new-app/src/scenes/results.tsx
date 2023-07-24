import { Button, Checkbox, Input, InputNumber, Modal } from "antd";
import moment from "moment";
import "moment/locale/pl";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IResult from "../interfaces/IResult";
import { MaskedInput } from "antd-mask-input";
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

  //   useEffect(() => {
  //     if (!open)
  //       (async () => {
  //         await ipcRenderer.invoke(
  //           state.action,
  //           `Konkurencja-${state.info.dNumber}_${state.info.category}.pdf`
  //         );
  //       })();
  //   }, [open]);
  useEffect(() => {
    console.log(finalsResults);
  }, []);

  const GenerateFinalInputRow = (comp: IResult) => {
    let index = finalsResults.findIndex(x=>x.key == comp.key)
    const addValue = (
      comp: IResult,
      value: any,
      key: "scoreFinal" | "timeFinal"
    ) => {
      let index = finalsResults.findIndex((x) => x.key == comp.key);
      let localfinals = [...finalsResults];
      if (index >= 0) {
        (localfinals[index][key] as any) = value;
        setFinalsResults(localfinals);
      } else {
        localfinals.push({
          key: comp.key,
          name: comp.name,
          startingNumber: comp.startingNumber,
          club: comp.club,
          [key]: value,
        });
        setFinalsResults(localfinals);
      }
    };

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
          placeholder="Wynik"
          value={index >= 0 ? finalsResults[index].scoreFinal : 0}
          onChange={(val) => addValue(comp, val, "scoreFinal")}
          style={{ height: "40px" }}
        />
        {[1, 3, 4, 8].includes(state.info.dNumber) ? (
          <MaskedInput
            placeholder="Czas"
            value={index >= 0 ? finalsResults[index].timeFinal : ''}
            onChange={(val) => addValue(comp, val, "timeFinal")}
            style={{ height: "40px", maxWidth: "100px" }}
            mask={"0.00.00"}
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
          {results.findIndex((x) => x.key == result.key) + 1}
        </td>
        <td>{result.startingNumber}</td>
        <td>{result.name}</td>
        <td>{result.club}</td>
        <td>{result.score}</td>
        <td>{result.time ? result.time : result.score2}</td>
        {printWithFinals ? <td>{(result as any).scoreFinal}</td> : null}
        {printWithFinals && [1, 3, 4, 8].includes(state.info.dNumber) ? (
          <td>{(result as any).timeFinal}</td>
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
              setShowFinalsModal(showFinals);
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
            disabled={peopleInFinals !== finalsResults.length}
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
          {results
            .slice(0, peopleInFinals)
            .map((x) => GenerateFinalInputRow(x))}
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
            {`Konkurencja ${state.info.dNumber}`}
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
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {printWithFinals
              ? [...results.slice(peopleInFinals),...finalsResults].map((result: any, index: number) =>
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
