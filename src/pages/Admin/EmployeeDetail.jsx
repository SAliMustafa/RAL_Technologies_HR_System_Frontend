import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {getEmployeeById, updateEmployee, updateEmployeeStatus} from "../../services/employeeService";
import getEmployeeName from "../../utils/getEmployeeName"
import "../../style/style.css"

import React from 'react'
const statusOptions = ["active", "on_leave", "suspended", "left"];
const genderOptions = ["male", "female"];
const employmentTypeOptions = ["full_time", "part_time", "fixed_term"];
const roleOptions = ["employee", "manager", "hr_admin"];

function toDateInputValue(value){
    return value ? value.slice(0,10) : ''
}

function EmployeeDetail() {

    const { t } = useTranslation()
    const {userId} = useParams()
    const navigate = useNavigate()

    const [form, setForm] = useState(null)
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(()=>{
      async function loadEmployee(){
        try{
          const data = await getEmployeeById(userId)
          const employee = data.employeeId || {}
          setForm({
          username: data.username || "",
          role: data.role || "employee",
          employee_code: employee.employee_code || "",
          name_en: employee.name_en || "",
          name_ar: employee.name_ar || "",
          cpr_number: employee.cpr_number || "",
          date_of_birth: toDateInputValue(employee.date_of_birth),
          gender: employee.gender || "",
          nationality: employee.nationality || "",
          is_bahraini: employee.is_bahraini ? "yes" : "no",
          department_id: employee.department_id || "",
          reports_to: employee.reports_to || "",
          job_title: employee.job_title || "",
          date_of_joining: toDateInputValue(employee.date_of_joining),
          probation_end_date: toDateInputValue(employee.probation_end_date),
          probation_extended_with_consent:
          employee.probation_extended_with_consent || false,
          employment_type: employee.employment_type || "",
          iban: employee.iban || "",
          bank_name: employee.bank_name || "",
          mobile: employee.mobile || "",
          email_personal: employee.email_personal || "",
          email_work: employee.email_work || "",
        })
          setStatus(employee.status || "")
        } catch(err){
          setError(err.response?.data?.error || t("employees.detail.loadError"))
        } finally{
          setLoading(false)
        }
    }

    loadEmployee()
},[userId, t])
function handleChange(event){
  const { name, value,type,checked } = event.target;
  setForm({...form, [name]: type === "checkbox" ? checked : value });
}
async function handleSubmit(event){
  event.preventDefault();
  setError("");
  setSaving(true);
  try{
    await updateEmployee(userId, {
      ...form, 
      is_bahraini: form.is_bahraini === "yes" ? true : false,
      department_id: form.department_id || null,
      reports_to: form.reports_to || null,
      probation_end_date: form.probation_end_date || null,
      email_personal: form.email_personal || null,
      email_work: form.email_work || null
    })
    navigate("/employees")
  } catch(err){
    setError(err.response?.data?.error || t("employees.detail.saveError"))
  }finally{
    setSaving(false)
  }
    }
    async function handleStatusChange(event){
      const newStatus = event.target.value;
      setError("");
      try{
        await updateEmployeeStatus(userId, newStatus)
        setStatus(newStatus)
      }
    catch(err){
      setError(err.response?.data?.error || t("employees.detail.statusUpdateError"))
    }
  }
if (loading) {
  return <p className="loading-text">{t("employees.detail.loading")}</p>;
}
if(!form) {
  return <p className="error-message">{error || t("error")}</p>;
}
return (
  <div className="page">
    <h1 className="page-title">{t("employees.detail.title")}</h1>

    {error && <p className="error-message">{error}</p>}

    <div className="form-field"> 
    <label htmlFor="status">{t("employees.fields.status")}</label>
    <select id="status" value={status} onChange={handleStatusChange}>
      {statusOptions.map((option) => (
        <option key={option} value={option}>
          {t(`employees.statusValues.${option}`)}
        </option>
      ))}
    </select>
  </div>

  <form onSubmit={handleSubmit}>
    <div className="form-section">
      <p className="form-section-title">{t("employees.detail.account")}</p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="username">{t("employees.fields.username")}</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username || ""}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="role">{t("employees.fields.role")}</label>
          <select id="role" name="role" value={form.role || ""} onChange={handleChange}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {t(`employees.roleValues.${option}`)}
              </option>
            ))}
          </select>
          </div>
      </div>
</div>
<div className="form-section">
    <p className="form-section-title">{t("employees.detail.personal")}</p>
    <div className="form-grid">
      <div className="form-field">
        <label htmlFor="employee_code">{t("employees.fields.employeeCode")}</label>
        <input
          type="text"
          id="employee_code"
          name="employee_code"
          value={form.employee_code || ""}
          onChange={handleChange}
        />
      </div>
      <div className='form-field'>
        <label htmlFor="name_en">{t("employees.fields.nameEn")}</label>
          <input
            type="text"
            id="name_en"
            name="name_en"
            value={form.name_en}
            onChange={handleChange}
              />
      </div>
      <div className="form-field">
        <label htmlFor="name_ar">{t("employees.fields.nameAr")}</label>
          <input
            type="text"
            id="name_ar"
            name="name_ar"
            value={form.name_ar}
            onChange={handleChange}
              />
      </div>
            <div className="form-field">
              <label htmlFor="cpr_number">{t("employees.fields.cprNumber")}</label>
              <input
                type="text"
                id="cpr_number"
                name="cpr_number"
                value={form.cpr_number}
                onChange={handleChange}
                pattern="\d{9}"
                title="9 digits"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="date_of_birth">{t("employees.fields.dateOfBirth")}</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="gender">{t("employees.fields.gender")}</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange} required>
                <option value="" disabled>
                  {t("employees.detail.select")}
                </option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="nationality">{t("employees.fields.nationality")}</label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="is_bahraini">{t("employees.fields.isBahraini")}</label>
              <select
                id="is_bahraini"
                name="is_bahraini"
                value={form.is_bahraini}
                onChange={handleChange}
                required
              >
                <option value="yes">{t("employees.detail.yes")}</option>
                <option value="no">{t("employees.detail.no")}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="form-section">
          <p className="form-section-title">{t("employees.detail.employment")}</p>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="department_id">{t("employees.fields.departmentId")}</label>
              <input
                type="text"
                id="department_id"
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="reports_to">{t("employees.fields.reportsTo")}</label>
              <input
                type="text"
                id="reports_to"
                name="reports_to"
                value={form.reports_to}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="job_title">{t("employees.fields.jobTitle")}</label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
              />
            </div>
            <div className='form-field'>
              <label htmlFor="date_of_joining">{t("employees.fields.dateOfJoining")}</label>
              <input
                type="date"
                id="date_of_joining"
                name="date_of_joining"
                value={form.date_of_joining}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="probation_end_date">{t("employees.fields.probationEndDate")}</label>
              <input
                type="date"
                id="probation_end_date"
                name="probation_end_date"
                value={form.probation_end_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="employment_type">{t("employees.fields.employmentType")}</label>
              <select
                id="employment_type"
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  {t("employees.detail.select")}
                </option>
                {employmentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <label className="form-checkbox">
              <input
              type="checkbox"
              name="probation_extended_with_consent"
              checked={form.probation_extended_with_consent}
              onChange={handleChange}
              />
              {t("employees.fields.probationExtended")}
            </label>
          </div>
        </div>
        <div className="form-section">
          <p className="form-section-title">{t("employees.detail.banking")}</p>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="iban">{t("employees.fields.iban")}</label>
              <input
                type="text"
                id="iban"
                name="iban"
                value={form.iban}
                onChange={handleChange}
                pattern="BH\d{2}[A-Z]{4}[A-Z0-9]{14}"
                title="Bahrain IBAN"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="bank_name">{t("employees.fields.bankName")}</label>
              <input
                type="text"
                id="bank_name"
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="form-section">
          <p className="form-section-title">{t("employees.detail.contact")}</p>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="mobile">{t("employees.fields.mobile")}</label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                pattern="3\d{7}"
                title="8 digits, starting with 3"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email_personal">{t("employees.fields.emailPersonal")}</label>
              <input
                type="email"
                id="email_personal"
                name="email_personal"
                value={form.email_personal}
                onChange={handleChange}
                required
              />
            </div>
             <div className="form-field">
              <label htmlFor="email_work">{t("employees.fields.emailWork")}</label>
              <input
                type="email"
                id="email_work"
                name="email_work"
                value={form.email_work}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? t("employees.detail.saving") : t("employees.detail.save")}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/employees")}>
            {t("employees.detail.cancel")}
          </button>
        </div>
        </form> 
        </div>   
)
}
export default EmployeeDetail
