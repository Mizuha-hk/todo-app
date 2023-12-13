import { TodoItem } from "./api/TodoItem";
import { TodoItemRequest } from "./api/TodoItemRequest";

async function GetTodos(userId: string) {
    const result = await fetch('/api/todo/?userId=' + userId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
            }
        });
    const body = await result.json() as TodoItem[];

    return body;
}

async function PostTodos(todo: TodoItemRequest) {
    const result = await fetch('/api/todo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
    });
    const body = await result.json() as TodoItem;
    return body;
}

async function DeleteTodos(todo: TodoItem) {
        await fetch('/api/todo/?userId='+todo.userId+'&todoId='+todo.id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export { GetTodos };
export { PostTodos };
export { DeleteTodos };