import { Input, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMessageProps } from "../utils";

const {ipcRenderer} = window.require('electron')

const Start = (props: IProps) => {
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage();
    const [listOfCompetition, setListOfCompetiton] = useState([])
    const [isModalOpen, setModalOpen] = useState(false)
    const [newCompName, setNewCompName] = useState('')

    useEffect(()=>{
        (async () => {
            messageApi.open(getMessageProps('loading','Ładowanie projektów...', 3))
            try{
                let comp = await ipcRenderer.invoke('getCompetitions')
                setListOfCompetiton(comp)
                messageApi.destroy()
                messageApi.open(getMessageProps('success','Załadowano projekty', 0.5))
            }catch{
                messageApi.destroy()
                messageApi.open(getMessageProps('error','Błąd podczas ładowania projektów', 1))
            }
        })()
    },[])

    const openCompetition = async (id:string) => {
        let comp = await ipcRenderer.invoke('getById', id)
        navigate('/scores', {state:comp})
    }

    const onCancel = () => {
        setModalOpen(false)
        setNewCompName('')
    }

    const onOk = async () => {
        let comp = await ipcRenderer.invoke('createNewComp', {newCompName})
        navigate('/scores', {state:comp})
    }

    return(
        <div style={{height:'100vh', width:'100vw', display:'flex', justifyContent:'center', alignItems:'center', gap:'50px'}}>
            <Modal 
                centered
                title="Utwórz nowe zawody" 
                open={isModalOpen} 
                onOk={onOk} 
                onCancel={onCancel}>
                    <Input 
                        placeholder="Wprowadź nazwę" 
                        value={newCompName}
                        onChange={e => setNewCompName(e.target.value)}/>
            </Modal>
            {contextHolder}
            {listOfCompetition.map( value => (
                <div style={{width:'100px', height:'100px', background:'blue'}} key={value.id} onClick={() => openCompetition(value.id)}>
                    {value.name}
                </div>
            ))}
            <div 
                style={{width:'100px', height:'100px', background:'red'}} 
                onClick={() => setModalOpen(true)}>

            </div>
        </div>
    )
}
interface IProps{

}
export default Start;
