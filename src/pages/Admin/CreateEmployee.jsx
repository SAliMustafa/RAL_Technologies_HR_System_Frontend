import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router'
import {createEmployee, getDepartment} from '../../services/employeeService'

const genderOptions = ["male", "female"];
const employmentTypeOptions = ["full_time", "part_time", "fixed_term"];
const roleOptions = ["employee", "manager", "hr_admin"];

import React from 'react'
const createuser ={
    username: "",
    password: "",
    role: "employee",
    employee_code: "",
    name_en: "",
    name_ar: "",
    cpr_number: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    is_bahraini: "",
    department_id: "",
    reports_to: "",
    job_title: "",
    date_of_joining: "",
    probation_end_date: "",
    probation_extended_with_consent: false,
    employment_type: "",
    iban: "",
    bank_name: "",
    mobile: "",
    email_personal: "",
    email_work: "",
}
function CreateEmployee() {
    const navigate = useNavigate()
    const [form, setForm] = useState(createuser)
    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

    function handleChange(event){
  const { name, value,type,checked } = event.target;
  setForm({...form, [name]: type === "checkbox" ? checked : value });
}
async function handleSubmit(event){
  event.preventDefault();
  setError("");
  setSaving(true);
  try{
      await createEmployee({
        ...form, 
        is_bahraini: form.is_bahraini === "yes" ? true : false,
        department_id: form.department_id || undefined,
        reports_to: form.reports_to || undefined,
        probation_end_date: form.probation_end_date || undefined,
        email_personal: form.email_personal || undefined,
        email_work: form.email_work || undefined
      })
      navigate("/employees")
    }  catch(err){
        setError(err.response?.data?.error || "Failed to create employee")
    } finally{
        setSaving(false)
    }
}
  return (
    <div className="page">
    <h1 className="page-title">Create Employee</h1>

    {error && <p className="error-message">{error}</p>}


  <form onSubmit={handleSubmit}>
    <div className="form-section">
      <p className="form-section-title">Account</p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              required
            />
        </div>
        <div className="form-field">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role || ""} onChange={handleChange}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          </div>
      </div>
</div>
<div className="form-section">
    <p className="form-section-title">Personal Information</p>
    <div className="form-grid">
      <div className="form-field">
        <label htmlFor="employee_code">Employee Code</label>
        <input
          type="text"
          id="employee_code"
          name="employee_code"
          value={form.employee_code || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className='form-field'>
        <label htmlFor="name_en">Name (English)</label>
          <input
            type="text"
            id="name_en"
            name="name_en"
            value={form.name_en}
            onChange={handleChange}
            required
              />
      </div>
      <div className="form-field">
        <label htmlFor="name_ar">Name (Arabic)</label>
          <input
            type="text"
            id="name_ar"
            name="name_ar"
            value={form.name_ar}
            onChange={handleChange}
            required
              />
      </div>
            <div className="form-field">
              <label htmlFor="cpr_number">CPR Number</label>
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
              <label htmlFor="date_of_birth">Date of Birth</label>
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
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange} required>
                <option value="" disabled>
                  Select Gender
                </option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="nationality">Nationality</label>
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
              <label htmlFor="is_bahraini">Is Bahraini</label>
              <select
                id="is_bahraini"
                name="is_bahraini"
                value={form.is_bahraini}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>
        <div className="form-section">
          <p className="form-section-title">Employment Details</p>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="department_id">Department ID</label>
              <input
                type="text"
                id="department_id"
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="reports_to">Reports To</label>
              <input
                type="text"
                id="reports_to"
                name="reports_to"
                value={form.reports_to}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="job_title">Job Title</label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
              />
            </div>
            <div className='form-field'>
              <label htmlFor="date_of_joining">Date of Joining</label>
              <input
                type="date"
                id="date_of_joining"
                name="date_of_joining"
                value={form.date_of_joining}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="probation_end_date">Probation End Date</label>
              <input
                type="date"
                id="probation_end_date"
                name="probation_end_date"
                value={form.probation_end_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="employment_type">Employment Type</label>
              <select
                id="employment_type"
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Employment Type
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
                Probation Extended with Consent 
            </label>
          </div>
        </div>
        <div className="form-section">
          <p className="form-section-title">Iban</p>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="iban">IBAN</label>
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
              <label htmlFor="bank_name">Bank Name</label>
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
          <p className="form-section-title">Contact Information</p>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="mobile">Mobile</label>
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
              <label htmlFor="email_personal">Personal Email</label>
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
              <label htmlFor="email_work">Work Email</label>
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
            {saving ? "Creating..." : "Create Employee"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/employees")}>
            Cancel
          </button>
        </div>
        </form> 
        </div>   
)
}

export default CreateEmployee
