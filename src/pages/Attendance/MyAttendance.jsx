import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"
import { getMyAttendance } from "../../services/attendanceService";


function formatDate(value){
    if(!value) return "-"
    return new Date(value).toLocaleDateString()
}

function formatTime(value){
    if(!value) return "-"
    return new Date(value).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})
}