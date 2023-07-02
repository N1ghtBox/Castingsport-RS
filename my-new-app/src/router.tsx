import {
    createHashRouter,
    createRoutesFromElements,
    Route,
  } from "react-router-dom";
import Layout from "./components/Layout";
import Results from "./scenes/results";
import ResultsFinals from "./scenes/resultsFinals";
import ResultsFinalsTeam from "./scenes/resultsFinalsTeam";
import Start from "./scenes/start";
  
  // You can do this:
  const router = createHashRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Start/>} />
        <Route path="/scores" element={<Layout/>} />
        <Route path="/results" element={<Results/>} />
        <Route path="/resultsFinals" element={<ResultsFinals/>} />
        <Route path="/resultsFinalsTeam" element={<ResultsFinalsTeam/>} />
      </>
    )
  );

export default router;