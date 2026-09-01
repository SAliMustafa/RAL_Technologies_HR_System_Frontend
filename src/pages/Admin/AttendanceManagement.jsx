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