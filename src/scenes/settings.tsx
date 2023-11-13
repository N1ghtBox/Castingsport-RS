import { useState } from "react";
import DevMenu from "../components/DevMenu";
import useKeyboardShortcut from "use-keyboard-shortcut";
import MenuTop from "../components/MenuTop";

const { ipcRenderer } = window.require("electron");

const Settings = (props: IProps) => {
  const [dev, setDev] = useState<{ enabled: boolean; element: JSX.Element }>({
    enabled: false,
    element: <></>,
  });
  const {} = useKeyboardShortcut(
    ["Control", "Shift", "D"],
    () => {
      if (dev.enabled) setDev({ enabled: false, element: <></> });
      else setDev({ enabled: true, element: <DevMenu /> });
    },
    {
      overrideSystem: false,
      ignoreInputFields: false,
      repeatOnHold: false,
    }
  );

  return (
    <>
      <MenuTop activeTab="settings" />
      <div
        style={{
          height: "90vh",
          paddingTop: "10vh",
          width: "100vw",
        }}
      >
        {dev.element}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            textAlign: "center",
            paddingBlock: "15px",
          }}
        >
          Copyright 2023 &copy;{" "}
          <a
            className={"linkedIn-link"}
            onClick={async () => await ipcRenderer.invoke("openLinkedIn")}
          >
            Dawid Witczak
          </a>
        </div>
      </div>
    </>
  );
};
interface IProps {}
export default Settings;
