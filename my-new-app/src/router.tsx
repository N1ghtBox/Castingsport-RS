import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
  } from "react-router-dom";
import Layout from "./components/Layout";
import Menu from "./scenes/menu";
  
  // You can do this:
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/main_window" element={<Layout children={<Menu />} />} />
        <Route path="/login" element={<Layout children={<Menu />}/>} />
      </>
    )
  );

export default router;