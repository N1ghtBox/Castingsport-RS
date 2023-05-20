import { useNavigate, useNavigation } from "react-router-dom";
import UploadCSV from "../components/UploadCSV";

const Start = (props: IProps) => {
    const navigate = useNavigate()
    
    const setDataFromFile = (data: string[]) => {
        navigate('/scores', {state:data})
    }

    return(
        <div style={{height:'100vh', width:'100vw', display:'flex', justifyContent:'center', alignItems:'center',flexDirection:'column', gap:'50px'}}>
            <UploadCSV
                setDataFromFile={setDataFromFile}
                />
        </div>
    )
}
interface IProps{

}
export default Start;
