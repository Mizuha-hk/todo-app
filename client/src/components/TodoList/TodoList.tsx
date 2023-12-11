import { DeleteTodos } from '../../features/todos';
import { useAppContext } from '../../providers/AppProvider';
import { useTodoItemContext } from '../../providers/TodoItemProvider';
import './TodoList.css';

function TodoList(){
    const resource = useAppContext();
    const {todos, dispatch} = useTodoItemContext();
    const isLoggedIn = resource?.clientPrincipal !== null;

    return (
        <div className='root'>
            {
                isLoggedIn ? (
                    <div>
                        <h1>あなたのタスク</h1>
                        <ul className='todo-list'>
                            {todos.map((todo, i) => (
                                <li key={i}>
                                <div className='over-view'>
                                    <div className='title item-border'>
                                        {todo.title}
                                    </div>
                                    <div className='description'>
                                        {todo.description}
                                    </div>
                                </div>
                                <button onClick={async () => {
                                    await DeleteTodos(todo);
                                    dispatch({type:'REMOVE_TODO',id:todo.id})   
                                    }} 
                                    className='button'>完了</button>
                            </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>
                        <p>ログインしてください</p>
                    </div>
                )
            }
        </div>
    )
}

export default TodoList