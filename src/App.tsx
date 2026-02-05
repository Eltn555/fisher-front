import { HashRouter, Routes, Route } from 'react-router-dom'
import Form from './components/Form'
import UserManagement from './components/UserManagement'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/userManagement" element={<UserManagement />} />
      </Routes>
    </HashRouter>
  )
}

export default App
