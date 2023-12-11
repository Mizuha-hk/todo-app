import { TodoItem } from "./TodoItem";

type TodoAction =
    { type: 'ADD_TODO', todo: TodoItem } |
    { type: 'REMOVE_TODO', id: string } |
    { type: 'UPDATE_TODO', todo: TodoItem } |
    { type: 'GET_TODOS', todos: TodoItem[]};

export type { TodoAction };