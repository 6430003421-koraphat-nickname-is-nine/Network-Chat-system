import { Link, useNavigate } from "react-router-dom";
import UserPanel from "../../components/Profile/UserPanel";
import { useUser } from "../../lib/context/UserContext";
import { useEffect, useState } from "react";
import { UserInfo } from "../../lib/type/UserHidden";
import FormPanel from "../../components/Profile/FormPanel";
import LoadingPage from "../etc/LoadingPage";
import useAuthRedirect from "../../lib/authRedirect";


const initUser : UserInfo = {
    id: "Fallback",
    displayName : "Fallback",
    firstName : "Fallback",
    lastName : "Fallback",
    phoneNumber : "Fallback",
    email : "Fallback@Fallback.com",
    birthdate : new Date(),
    gender : "Other",
    role : "Customer",
    imageURL : "https://utfs.io/f/4a65c7f9-7bb1-4498-99bb-4148be482108-t9vzc5.png",
    isVerified : true,
};

export default function ProfilePage(){

    const {currentUser,isLoading,fetchUser} = useUser();
    const navigate = useNavigate();
    const [isEdit,setEdit] = useState(false);
    useAuthRedirect();
   
    
    if(!currentUser) return <LoadingPage />

    
    return (
    <div className="page">
        <div className="flex flex-col w-full">
            {(!isEdit) && <UserPanel currentUser = {currentUser}/>}
            {/* {(isEdit) && <FormPanel currentUser = {currentUser} fetchUser = {fetchUser} setEdit={setEdit}/>} */}
            {/* {(!isEdit) && <button className="danger-button" onClick = {() => {setEdit(true); console.log(currentUser)}}>Edit Profile</button>} */}
            
            {/* {(isEdit) && <button className="danger-button" onClick = {() => {setEdit(false);}}>Cancel Change</button>} */}
            {/* <Link to ="setting/profile">
                <button className="primary-button w-full">
                    Setting
                </button>
            </Link> */}
        </div>
    </div>);
} /**/