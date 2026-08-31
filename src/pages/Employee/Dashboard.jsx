import React from 'react'
import { useAuth } from "../../context/AuthContext"
import Navbar from '../../components/NavbarEmployee'
const Dashboard = () => {
    const {user} = useAuth()
  
  return (
    <>
    
    <Navbar/>
  <h1> Welcom Employee {user.username}</h1>  
    
    </>
) }

export default Dashboard