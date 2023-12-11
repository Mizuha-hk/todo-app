//import './App.css'
import AppProvider from './providers/AppProvider'
import Header from './components/Header/Header'
import TodoList from './components/TodoList/TodoList'
import Form from './components/Form/Form'
import TodoItemProvider from './providers/TodoItemProvider'

function App() {

  return (
    <>
      <AppProvider>
        <Header/>
        <TodoItemProvider>
          <TodoList/>
          <Form/>
        </TodoItemProvider>
      </AppProvider>
    </>
  )
}

export default App
