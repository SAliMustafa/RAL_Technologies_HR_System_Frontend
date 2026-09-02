import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { getAllEmployees } from "../../services/employeeService";
import getEmployeeName from "../../utils/getEmployeeName"
import "../../style/style.css"
import "./EmployeeManagement.css"
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
    <main className="employee-list-page">
      <div className="employee-page-header">
      <div><p className="employee-page-eyebrow">EMPLOYEE MANAGEMENT</p><h1>{t("employees.list.title")}</h1><p>View and manage employee records across the organization.</p></div>
      <Link to="/employees/create" className="employee-primary-button">
        Create Employee
      </Link>
      </div>
      <section className="employee-list-card">
      <div className="employee-list-toolbar">
        <div><h2>Employees</h2>{!loading && !error && <span>{filteredRows.length} {filteredRows.length === 1 ? "employee" : "employees"}</span>}</div>
        <div className="employee-list-filters">
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
      </div>

      {error && <div className="employee-page-error" role="alert">{error}</div>}
      {loading && <div className="employee-list-state"><span className="employee-spinner" />{t("employees.list.loading")}</div>}

      {!loading && (
        <div className="employee-table-wrap"><table className="employee-table">
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
                  <td><Link className="employee-table-link" to={`/employees/${row._id}`}>View / edit</Link></td>
                </tr>
              )
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td className="employee-table-empty" colSpan="5">{t("employees.list.empty")}</td>
              </tr>
            )}

          </tbody>
        </table></div>
      )}
      </section>
    </main>
  )
}

export default EmployeeList
