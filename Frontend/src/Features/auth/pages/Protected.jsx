import {useSelector} from "react-redux";
import {Navigate} from "react-router";
import {useAuth} from "../hook/useAuth.js";
import {useEffect} from "react";

function Protected({ children, role = "seller" }) {

    const { handleMe } = useAuth();
    useEffect(() => {
        handleMe();
    }, []);

    const user = useSelector((state) => state.auth.user);
    const initialized = useSelector((state) => state.auth.initialized);

    if(!initialized){
        return <div>Loading...</div>
    }

    if(user && user.role == role){
        return children;
    }else{
        return <Navigate to='/'/>;
    }

}

export default Protected;