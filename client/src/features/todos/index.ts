import { TodoItem } from "./api/TodoItem";

async function GetTodos(userId: string) {
    // const result = await fetch('/api/todos/?userId=' + userId, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json'
    //         }
    //     });
    // const body = await result.json() as TodoItem[];

    const body = [
        {
            id: "7ff198b0-8bbe-4d6c-a7b0-ab4a527d5389",
            userId: userId,
            title: "Test1",
            description: "Test"
        },
        {
            id: "1ad0f127-4f79-46e2-9e16-1eb707a371fb",
            userId: userId,
            title: "Test2",
            description: "Test",
        },
        {
            id: "586ce27f-bd18-4cf6-b7ff-3c3f410748c2",
            userId: userId,
            title: "<script>alert('xss');</script>",
            description: "Test",
        }
    ] as TodoItem[];
    return body;
}

async function PostTodos(todo: TodoItemRequest) {
    // const result = await fetch('/api/todos', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(todo)
    // });
    // const body = await result.json() as TodoItem;
    // return body;

    const body = {
        id: "f3b892e3-9ccd-408a-99a4-cc86dea37463",
        userId: todo.userId,
        title: todo.title,
        description: todo.description
    } as TodoItem;

    return body;
}

async function DeleteTodos(todo: TodoItem) {
    // const result = await fetch('/api/todos/?id=' + todo.id, {
    //     method: 'DELETE',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // });
    // const body = await result.json() as TodoItem;
    // return body;
}

export { GetTodos };
export { PostTodos };
export { DeleteTodos };