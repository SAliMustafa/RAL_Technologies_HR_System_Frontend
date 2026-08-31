import api from './api'


function unwrap(data){
    if(Array.isArray(data)) return data
    if(Array.isArray(data.?attendance)) return data.attendance
    if(Array.isArray(data?.data)) return data.data
      console.error("Unexpected attendance response shape:", data)
  return []
}

async function getMyAttendance(params = {}){
    const response = await api.get('/attendance', {params})
    return unwrap (response.data)
}

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


export {
  getMyAttendance,
  getAllAttendance,
  createAttendanceRecord,
  updateAttendanceRecord
}