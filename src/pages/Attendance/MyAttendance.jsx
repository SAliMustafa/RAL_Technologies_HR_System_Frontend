import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"
import { getMyAttendance } from "../../services/attendanceService";


function formatDate(value){
    if(!value) return "-"
    return new Date(value).toLocaleDateString()
}

