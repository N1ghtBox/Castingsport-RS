import { AES } from "crypto-js";
import {
    createHashRouter,
    createRoutesFromElements,
    redirect,
    Route,
  } from "react-router-dom";
import Layout from "./components/Layout";
import Results from "./scenes/results";
import ResultsFinals from "./scenes/resultsFinals";
import ResultsFinalsTeam from "./scenes/resultsFinalsTeam";
import Start from "./scenes/start";
const { ipcRenderer } = window.require("electron");

const checkLicense = async () => {
  let valid: {valid:true} | { valid: false; errorMessage:string} = await ipcRenderer.invoke('checkLicense')
  if(!valid.valid) return redirect(`/?open=true&error=${(valid as { valid: false; errorMessage:string}).errorMessage}`)
  return null
}
  
  // You can do this:
  const router = createHashRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Start/>}/>
        <Route path="/scores" element={<Layout/>} loader={async ()=> {return await checkLicense()}}/>
        <Route path="/results" element={<Results/>} loader={async ()=> {return await checkLicense()}}/>
        <Route path="/resultsFinals" element={<ResultsFinals/>} loader={async ()=> {return await checkLicense()}}/>
        <Route path="/resultsFinalsTeam" element={<ResultsFinalsTeam/>} loader={async ()=> {return await checkLicense()}}/>
      </>
    )
  );

export default router;