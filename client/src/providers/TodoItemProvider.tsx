import React, { Dispatch, createContext, useEffect, useReducer } from "react";
import { TodoItem } from "../features/todos/api/TodoItem";
import { GetTodos } from "../features/todos";
import { TodoAction } from "../features/todos/api/TodoAction";
import { useAppContext } from "./AppProvider";

type TodoItemProviderProps = {
    children: React.ReactNode;
};

const TodoItemContext = createContext<{
    todos: TodoItem[];
    dispatch: Dispatch<TodoAction>;
} | undefined>(undefined);


const initialtodos: TodoItem[] = [];

const reducer = (todos: TodoItem[], action: TodoAction) => {
    switch (action.type) {
        case "ADD_TODO":{
            if(action.todo.title === ""){
                return todos;
            }      
            return [...todos, action.todo]
        }
        case "REMOVE_TODO":{
            return todos.filter(todo => todo.id !== action.id);
        }
        case "UPDATE_TODO": {
            const newTodos = todos.map((todo:TodoItem) => {
                if (todo.id === action.todo.id) {
                    return action.todo;
                }
                return todo;
            });
            return {...todos, todos: newTodos};
        }
        case "GET_TODOS":
            return action.todos;
        default:
            return todos;
        }
    }
    
        
const TodoItemProvider : React.FC<TodoItemProviderProps> = ({children}) =>{
    const resource = useAppContext();
    const [todos, dispatch] = useReducer(reducer, initialtodos);
    const isLoggedIn = resource?.clientPrincipal !== null;

    useEffect(() =>
    {
        if(!isLoggedIn){
            return;
        }
        GetTodos(resource?.clientPrincipal.userId ?? "").then((response) => {
            dispatch({type: "GET_TODOS", todos: response})
        });
    }, []);

    if(todos === null){
        return <div>Loading...</div>
    }

    return(
        <TodoItemContext.Provider value={{todos, dispatch}}>
            {children}
        </TodoItemContext.Provider>
    )
};

export function useTodoItemContext(){
    const context = React.useContext(TodoItemContext);
    if(context === undefined){
        throw new Error("useTodoItemContext must be used within a TodoItemProvider");
    }
    return context;
}


export default TodoItemProvider;