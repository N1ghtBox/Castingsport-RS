import { Fragment, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Categories } from "../enums";
import { summary } from "../IpcMainMaker";

const { ipcRenderer } = window.require("electron");

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

type mergedFinals = final & { scores: score[], key :number, totalPlace:number, totalScore: number};
type state = {
  state: {
    summaryData: summary;
    finals: mergedFinals[];
    action: "printResults" | "exportToPdf";
    competitions: string[];
  };
};

const SummaryPrint = () => {
  const { state }: state = useLocation();
  const navigate = useNavigate();

  useEffect(()=>{
    document.addEventListener("keydown", (ev) => {
      if (ev.code === "Escape")
        navigate(`/summaries/${state.summaryData.id}`);
    });
    ipcRenderer.addListener("success", () => {
      navigate(`/summaries/${state.summaryData.id}`);
    });
    (async () => {
      ipcRenderer.invoke(
        state.action,
        `${state.summaryData.name.replace(' ','_')}_${state.finals[0].category}.pdf`
      );
    })();
    return () => {
      document.removeEventListener("keydown", () => {});
      ipcRenderer.removeAllListeners("success");
    };
  },[state])

  const CreateRow = useCallback((final: mergedFinals) => {
    return (
      <tr key={final.key}>
        <td>{final.key}</td>
        <td>{final.name}</td>
        <td>{final.club}</td>
        <td className="important">{final.totalPlace}</td>
        <td className="important">{final.totalScore.toFixed(2)}</td>
        {
          state.competitions.map((name, i) => {
            let scores = final.scores.find(x => x.key == name)
            return (
              <Fragment key={`${i}-tbody`}>
                <td className={i % 2 == 0 ? 'oddColumn' : ''}>{scores.place}</td>
                <td className={i % 2 == 0 ? 'oddColumn' : ''}>{final.category === Categories.Kadet ? scores.score3 : scores.score5}</td>
              </Fragment>
            )
          })
        }
      </tr>
    )
  },[state.competitions])

  return (
    <div style={{ width: "100vw", minHeight: "100vh" }}>
      <span id="title">{state.summaryData.name} - Klasyfikacja generalna <br/> {state.finals[0].category == 'Kadet' ? '3-boju' : '5-boju'} w kategorii {state.finals[0].category}</span>
      <table className="table">
        <thead>
          <tr>
            <th colSpan={3} id="empty"></th>
            <th colSpan={2} className="important">Łącznie</th>
            {state.competitions &&
              state.competitions.map((name) => <th colSpan={2} key={name}>{name}</th>)}
          </tr>
          <tr>
            <td style={{ width: "50px" }}>Zajęte Miejsce</td>
            <td>Imię i Nazwisko</td>
            <td>Okręg/Klub PZW</td>
            <td className="important">Punkty za miejsc</td>
            <td className="important">Punkty w zawodach</td>
            {state.competitions &&
              state.competitions.map((_, i) => (
                <Fragment key={`${i}-thead`}>
                  <td key={`${i}-place`}>Zajęte miejsc</td>
                  <td key={`${i}-score`}>Punkty</td>
                </Fragment>
              ))}
          </tr>
        </thead>
        <tbody>
          {state.finals.map(CreateRow)}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryPrint;


