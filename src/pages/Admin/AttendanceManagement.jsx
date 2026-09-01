import { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router"
import { useAuth } from "../../context/AuthContext"
import {
  getAllAttendance,
  getAllTodayAttendance,
  updateAttendanceRecord,
  lockAttendanceRecord,
} from "../../services/attendanceService"
import "./AttendanceManagement.css"


const STATUS_OPTIONS = ["present", "absent", "half_day", "on_leave", "holiday", "weekly_off"]


function errorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.error || fallback;
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-GB");
}

function formatTime(value) {
  if (!value) return "--"
  return new Date(value).toLocaleTimeString("en-BH", { hour: "2-digit", minute: "2-digit" })
}

function formatStatus(status) {
  const names = {
    present: "Present", absent: "Absent", half_day: "Half Day",
    on_leave: "On Leave", holiday: "Holiday", weekly_off: "Weekly Off",
  }
  return names[status] || status || "--"
}

function employeeLabel(employee) {
  if (!employee || typeof employee === "string") return employee || "--";
  return `${employee.name_en || "--"} (${employee.employee_code || "--"})`;
}

function AttendanceManagement() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showTodayOnly, setShowTodayOnly] = useState(false)
  const [filters, setFilters] = useState({ status: "", employee_id: "", date: "" })

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (showTodayOnly) {
        setAttendance(await getAllTodayAttendance());
      } else {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== "")
        )
        setAttendance(await getAllAttendance(cleanFilters))
      }
    } catch (requestError) {
      setError(errorMessage(requestError, "Unable to load attendance."))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTodayOnly])

  useEffect(() => {
    const request = window.setTimeout(loadAttendance, 0)
    return () => window.clearTimeout(request)
  }, [loadAttendance]);

  if (user?.role !== "hr_admin") return <Navigate to="/" replace />;
}