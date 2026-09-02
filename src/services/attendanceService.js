import api from './api'


function unwrap(data){
    if(Array.isArray(data)) return data
    if(Array.isArray(data?.attendance)) return data.attendance
    if(Array.isArray(data?.data)) return data.data
      console.error("Unexpected attendance response shape:", data)
  return []
}

// async function getMyAttendance(params = {}){
//     const response = await api.get('/attendance', {params})
//     return unwrap (response.data)
// }

async function getAllAttendance(params = {}) {
  const response = await api.get('/attendance', { params })
  return unwrap(response.data)
}

async function createAttendanceRecord(data) {
  const response = await api.post('/attendance', data)
  return response.data
}

async function updateAttendanceRecord(id, data) {
    const response = await api.put(`/attendance/${id}`, data)
    return response.data
}


async function getTodayAttendance() {
    const response = await api.get("/attendance/my-attendance/today");
    return response.data;
}

async function getMyAttendance() {
    const response = await api.get("/attendance/my-attendance");
    return response.data;
}

async function getAllTodayAttendance() {
  const response = await api.get('/attendance/today')
  return unwrap(response.data)
}

async function getEmployeeAttendanceHistory(userId) {
  const response = await api.get(`/attendance/employee/${userId}`)
  return unwrap(response.data)
}

async function lockAttendanceRecord(id) {
  const response = await api.put(`/attendance/${id}/lock`)
  return response.data
}


export {
  getMyAttendance,
  getAllAttendance,
  createAttendanceRecord,
  updateAttendanceRecord,
  getTodayAttendance,
  getAllTodayAttendance,
  getEmployeeAttendanceHistory,
  lockAttendanceRecord
}