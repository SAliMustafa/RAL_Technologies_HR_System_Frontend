import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"
import { getMyAttendance } from "../../services/attendanceService";


function formatDate(value) {
    if (!value) return "-"
    return new Date(value).toLocaleDateString()
}

function formatTime(value) {
    if (!value) return "-"
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}


function MyAttendance() {
    const { t } = useTranslation()
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchAttendance() {
            try {
                const data = await getMyAttendance()
                setAttendance(data)
            } catch (err) {
                setError(t('attendance.error'))
            } finally {
                setLoading(false)
            }
        }

        fetchAttendance()
    }, [t])

    if (loading) return <p>{t('attendance.loading')}</p>
    if (error) return <p>{error}</p>


    return (
        <div>
            <h1>{t('attendance.title')}</h1>

            {attendance.length === 0 ? (
                <p>{t('attendance.empty')}</p>
            ) : <table>
                <thead>
                    <tr>
                        <th>{t('attendance.date')}</th>
                        <th>{t('attendance.status')}</th>
                        <th>{t('attendance.inTime')}</th>
                        <th>{t('attendance.outTime')}</th>
                        <th>{t('attendance.flags')}</th>
                    </tr>
                </thead>

                <tbody>
                    {attendance.map((record) => (
                        <tr key={record._id}>
                            <td>{formatDate(record.date)}</td>
                            <td>{t('attendance.statusValue.${record.status}')}</td>
                            <td>{formatTime(record.in_time)}</td>
                            <td>{formatTime(record.out_time)}</td>
                            <td>
                                {record.is_late_entry && <span>{t('attendance.lateEntry')} </span>}
                                {record.is_early_exit && <span>{t('attendance.earlyExit')} </span>}
                                {record.is_incomplete && <span>{t('attendance.incomplete')} </span>}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>}
        </div>
    )
}

export default MyAttendance