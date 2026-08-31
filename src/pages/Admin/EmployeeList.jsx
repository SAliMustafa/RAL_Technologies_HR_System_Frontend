import { useState, useEffect } from "react";
import { link } from "react-router";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { getAllEmployees } from "../../services/employeeService";
import "../../style/style.css"

import React from 'react'

function EmployeeList() {
    const { t } = useTranslation()
    const [rows, setRows] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      async function loadEmployees(){
        try{
          const data = await getAllEmployees()
          setRows(data)
        } catch(err){
          setError(err.response?.data?.error || t("employees.list.loadError"))
        } finally{
          setLoading(false)
        }
      }
    })
  return (
    <div>

    </div>
  )
}

export default EmployeeList
