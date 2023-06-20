import { mergeStyleSets } from "@fluentui/merge-styles";
import { Input, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompetitionCard from "../components/CompetitionCard";
import UploadPicture from "../components/UploadPic";
import { getMessageProps } from "../utils";

const {ipcRenderer} = window.require('electron')

const classNames = mergeStyleSets({
    removeWidth:{
        'span':{
            width:'auto !important',
        }
    }
})

const Start = (props: IProps) => {
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage();
    const [listOfCompetition, setListOfCompetiton] = useState([])
    const [isModalOpen, setModalOpen] = useState(false)
    const [newCompName, setNewCompName] = useState('')
    const [logo, setLogo] = useState<string>('')

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
        if(!newCompName){
            messageApi.open(getMessageProps('error','Nie podano nazwy', 2))
            return
        }

        if(!logo){
            messageApi.open(getMessageProps('error','Nie podano logo', 2))
            return
        }
        try{
            messageApi.open(getMessageProps('loading','Tworzenie zawodów...', 2))
            let comp = await ipcRenderer.invoke('createNewComp', {logo, newCompName})
            navigate('/scores', {state:comp})
        }catch (ex){
            console.log(ex)
            if(ex.toString().includes('413')){
                messageApi.open(getMessageProps('error','Zbyt duży plik', 4))
                return
            }
            messageApi.open(getMessageProps('error','Nie udało się utworzyć zawodów', 2))
        }
        }

    return(
        <div style={{height:'100vh', width:'100vw', display:'flex', justifyContent:'center', alignItems:'center', gap:'50px'}}>
            <Modal 
                centered
                title="Utwórz nowe zawody" 
                open={isModalOpen} 
                onOk={onOk} 
                okText={'Utwórz'}
                cancelText={'Anuluj'}
                okButtonProps={{style:{background:'#d9363e'}}}
                onCancel={onCancel}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'50px'}} className={classNames.removeWidth}>
                        <Input 
                            style={{height:'40px'}}
                            placeholder="Wprowadź nazwę" 
                            value={newCompName}
                            onChange={e => setNewCompName(e.target.value)}/>
                        <UploadPicture
                            uploadPicture={pic => setLogo(pic)}
                            />
                    </div>

            </Modal>
            {contextHolder}
            {listOfCompetition.map( value => (
                <CompetitionCard
                    key={value.id}
                    competition={value}
                    onClick={()=> openCompetition(value.id)}
                    />
            ))}
                <CompetitionCard
                    addNewCard
                    onClick={()=>setModalOpen(true)}
                    />
        </div>
    )
}
interface IProps{

}
export default Start;
