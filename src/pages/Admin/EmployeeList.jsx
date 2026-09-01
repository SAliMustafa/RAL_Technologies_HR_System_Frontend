import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { getAllEmployees } from "../../services/employeeService";
import getEmployeeName from "../../utils/getEmployeeName"
import "../../style/style.css"
import React from 'react'

function EmployeeList() {
    const { t, i18n } = useTranslation()
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
                  <td>{getEmployeeName(employee, i18n.language)} </td>
                  <td>{employee.jobTitle} </td>
                  <td><span className={`status-badge ${employee.status.toLowerCase()}`}>{t(`employees.statusValues.${employee.status.toLowerCase()}`)}</span></td>
                  <td><Link className='table-link' to={`/employees/${row._id}`}>{t("employees.list.view")}</Link></td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td className="data-table-empty" colSpan="5">{t("employees.list.empty")}</td>
              </tr>
            )}

          </tbody>
        </table>
      )}

    </div>
  )
}

export default EmployeeList
