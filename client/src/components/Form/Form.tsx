import React from "react";
import { useAppContext } from "../../providers/AppProvider";
import { useTodoItemContext } from "../../providers/TodoItemProvider";
import { PostTodos } from "../../features/todos";
import './Form.css';


function Form() {
    const resource = useAppContext();
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const {dispatch} = useTodoItemContext();

    async function onSubmited(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        var response = await PostTodos({title, description, userId: resource?.clientPrincipal.userId ?? ""});
        dispatch({type: "ADD_TODO", todo: response});
    }

    const isLoggedIn = resource?.clientPrincipal !== null;
    return(
        <div className="form">
        {
            isLoggedIn ? (
            <div>
                <h1>タスクを追加</h1>
                <form onSubmit={onSubmited}>
                    <h2>タイトル</h2>
                    <input
                        className="title"
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        type="text" />
                    <h2>説明</h2>
                    <input
                        className="description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        type="text" />
                    <button className="submit" type="submit">追加</button>
                </form>
            </div>
            ) : (
                <div>
                </div>
            )
        }
        </div>
    )
}

export default Form