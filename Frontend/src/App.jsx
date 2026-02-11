import React from 'react'
import './index.css'
import Login from './pages/Login'


const App = () => {
  return (
    <div className='h-screen flex items-center justify-center bg-cover' style={{"backgroundImage": "url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
      <Login />
    </div>
  )
}

export default App
