import './Header.css'
import { useAppContext } from "../../providers/AppProvider"

function Header(){
    const resource = useAppContext();

    const isLoggedIn = resource?.clientPrincipal !== null;

    return(
        <header>
        <h2>Todo-App</h2>
        <div>
            {isLoggedIn ? (
                <a href="/logout">ログアウト</a>
            ) : (
                <a href="/login">ログイン</a>
            )}
        </div>
        </header>
    )
}

export default Header