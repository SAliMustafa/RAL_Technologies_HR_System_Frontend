import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { getAllEmployees } from "../../services/employeeService";
import getEmployeeName from "../../utils/getEmployeeName"
import "../../style/style.css"
import React from 'react'

function EmployeeList() {
    const statusFilters = ["all", "active", "on_leave", "suspended", "left"]
    const { t, i18n } = useTranslation()
    const [rows, setRows] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const filteredRows = rows.filter((row) => {
    const employee = row.employeeId || row
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter
    const term = search.trim().toLowerCase()
    const matchesSearch =
      !term ||
      employee.name_en?.toLowerCase().includes(term) ||
      employee.name_ar?.toLowerCase().includes(term) ||
      employee.employee_code?.toLowerCase().includes(term)
    return matchesStatus && matchesSearch
  })
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
      <div className="list-header">
      <h1 className="page-title">{t('employee.list.title')} </h1>
      <Link to="/employees/create" className="btn btn-primary">
        Create Employee
      </Link>
      </div>
      <div className="list-toolbar">
        <input
          type="text"
          className="list-search"
          placeholder="Search by name or employee code"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="list-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          {statusFilters.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All statuses" : option}
            </option>
          ))}
        </select>
      </div>

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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) =>{
              const employee = row.employeeId || row
              return (
                <tr key={row._id}>
                  <td>{employee.employee_code} </td>
                  <td>{getEmployeeName(employee, i18n.language)} </td>
                  <td>{employee.job_title} </td>
                  <td><span className={`status-badge status-${employee.status.toLowerCase()}`}>{employee.status}</span></td>
                  <td><Link className='table-link' to={`/employees/${row._id}`}>Update</Link></td>
                </tr>
              )
            })}
            {filteredRows.length === 0 && (
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
