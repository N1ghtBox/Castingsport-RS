import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
  } from "react-router-dom";
import Layout from "./components/Layout";
import Results from "./scenes/results";
import Start from "./scenes/start";
  
  // You can do this:
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/main_window" element={<Start/>} />
        <Route path="/scores" element={<Layout/>} />
        <Route path="/results" element={<Results/>} />
      </>
    )
  );

export default router;