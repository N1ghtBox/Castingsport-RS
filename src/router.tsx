import {
  createHashRouter,
  createRoutesFromElements,
  redirect,
  Route,
} from "react-router-dom";
import Layout from "./components//Layout";
import Start from "./scenes/competitionsList";
import SummariesList from "./scenes/summaryList";
import Results from "./scenes/results";
import ResultsFinals from "./scenes/resultsFinals";
import ResultsFinalsTeam from "./scenes/resultsFinalsTeam";
import Settings from "./scenes/settings";
import Summary from "./scenes/Summary";
const { ipcRenderer } = window.require("electron");

const checkLicense = async () => {
  const valid: { valid: true } | { valid: false; errorMessage: string } =
    await ipcRenderer.invoke("checkLicense");
  if (!valid.valid)
    return redirect(
      `/competitions?open=true&error=${
        (valid as { valid: false; errorMessage: string }).errorMessage
      }`
    );
  return null;
};

// You can do this:
const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        loader={() => {
          return redirect("/competitions");
        }}
      />
      <Route path="/competitions" element={<Start />} />
      <Route
        path="/summaries"
        element={<SummariesList />}
        loader={async () => {
          return await checkLicense();
        }}
      />
      <Route
        path="/summaries/:id"
        element={<Summary />}
        loader={async ({params}) => {
          const redirect = await checkLicense()
          if(redirect) return redirect
          let summary = await ipcRenderer.invoke('getSummary',params.id)
          return summary;
        }}
      />
      <Route
        path="/settings"
        element={<Settings />}
        loader={async () => {
          return await checkLicense();
        }}
      />
      <Route
        path="/scores"
        element={<Layout />}
        loader={async () => {
          return await checkLicense();
        }}
      />
      <Route
        path="/results"
        element={<Results />}
        loader={async () => {
          return await checkLicense();
        }}
      />
      <Route
        path="/resultsFinals"
        element={<ResultsFinals />}
        loader={async () => {
          return await checkLicense();
        }}
      />
      <Route
        path="/resultsFinalsTeam"
        element={<ResultsFinalsTeam />}
        loader={async () => {
          return await checkLicense();
        }}
      />
    </>
  )
);

export default router;
