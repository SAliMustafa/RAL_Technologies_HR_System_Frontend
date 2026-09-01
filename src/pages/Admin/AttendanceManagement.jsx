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


