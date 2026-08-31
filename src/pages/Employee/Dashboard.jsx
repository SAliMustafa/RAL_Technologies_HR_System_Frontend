import React from 'react'
import { useAuth } from "../../context/AuthContext"
const Dashboard = () => {
    const {user} = useAuth()
  
  return (
     <h1> Welcom Employee {user.username}</h1>  )
}

export default Dashboard