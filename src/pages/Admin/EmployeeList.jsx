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
      loadEmployees()

    },[t])
  return (
    <div className="page">
      <h1 className="page-title">{t('employee.list.title')} </h1>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-text">{t("employees.list.loading")}</p>}

      {!loading && (
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("employees.fields.employeeCode")} </th>
              <th>{t("employees.fields.name")} </th>
              <th>{t("employees.fields.jobTitle")} </th>
              <th>{t("employees.fields.status")} </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>{
              const employee = row.employeeId || row
              return (
                <tr key={row._id}>
                  <td>{employee.employeeCode} </td>
                  <td>{employee.employeeCode} </td>
                  <td>{employee.employeeCode} </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

    </div>
  )
}

export default EmployeeList
