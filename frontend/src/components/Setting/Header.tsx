import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import { useUser } from "../../lib/context/UserContext";
import LoadingPage from "../../pages/etc/LoadingPage";
import { useEffect } from "react";
import { UserInfo } from "../../lib/type/UserHidden";

export default function Header({currentUser} : {currentUser : UserInfo}){
    

    return (
    <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row gap-4">
            <div>
                <Avatar src = {currentUser.imageURL}/>
            </div>
            <div className="text-center">
                <div><span className="font-bold h-full">{currentUser.displayName}</span></div>
            </div>
        </div>
        <div>
            <Link to = {'/profile'}>
                <button className="primary-button">Profile</button>
            </Link>
        </div>
    </div>);
}