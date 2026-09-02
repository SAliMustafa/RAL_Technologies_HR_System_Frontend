import api from './api'

async function getHolidays(params = {}) {
  const response = await api.get('/holidays', { params })
  return response.data
}

async function createHoliday(data) {
  const response = await api.post('/holidays', data)
  return response.data
}

async function updateHoliday(id, data) {
  const response = await api.put(`/holidays/${id}`, data)
  return response.data
}

async function deleteHoliday(id) {
  const response = await api.delete(`/holidays/${id}`)
  return response.data
}

export {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
}