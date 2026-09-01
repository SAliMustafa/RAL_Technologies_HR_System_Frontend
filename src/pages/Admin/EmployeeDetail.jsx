import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import {getEmployeeById, updateEmployee, updateEmployeeStatus} from "../../services/employeeService";
import {getEmployeeName} from "../../utils/getEmployeeName"
import "../../style/style.css"

import React from 'react'
const statusOptions = ["active", "on_leave", "suspended", "left"];
const genderOptions = ["male", "female"];
const employmentTypeOptions = ["full_time", "part_time", "fixed_term"];
const roleOptions = ["employee", "manager", "hr_admin"];

function toDateInputvalue(value){
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
  setForm({setForm, [name]: type === "checkbox" ? checked : value });
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
    } catch(err){
      setError(err.response?.data?.error || t("employees.detail.statusUpdateError"))
    }
  }
if (loading) {
  return <p className="loading-text">{t("employees.detail.loading")}</p>;
}
if(!form) {
  return <p className="error-message">{error || t("error")}</p>;
}
return
export default EmployeeDetail
