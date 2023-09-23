import { Button } from "antd";
import { useEffect, useState } from "react";

const { ipcRenderer } = window.require("electron");


const DevMenu = () => {
    const [license, setLicense] = useState('')

    useEffect(()=>{
      const fetch = async () => {
        return await ipcRenderer.invoke('DEV_getLicense')
      }
      fetch()
        .then(lic => setLicense(lic))
    },[])

    const downloadData = async () => {
        await ipcRenderer.invoke('DEV_getData')
    }    
    
    const importData = async () => {
      await ipcRenderer.invoke('DEV_importData')
  }

  return (
    <div style={{width:'90vh', marginInline:'5vw', display:'flex', flexDirection:'column', gap:'30px'}}>
        Developer Menu
        <span>Licencja: {license}</span>
        <span style={{display:'flex', gap:'30px'}}>
          <Button
              style={{width:'fit-content'}}
              onClick={() => downloadData()}>
                  Download data
          </Button>
          <Button
              style={{width:'fit-content'}}
              onClick={() => importData()}>
                  Import data
          </Button>
        </span>
    </div>
  )
}

export default DevMenu 