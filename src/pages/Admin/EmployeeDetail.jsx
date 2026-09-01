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
  return (
    <div>
      
    </div>
  )
}

export default EmployeeDetail
