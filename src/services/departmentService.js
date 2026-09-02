import api from './api'

async function getDepartments() {
  const response = await api.get('/departments')
  return response.data
}

async function createDepartment(data) {
  const response = await api.post('/departments', data)
  return response.data
}

async function updateDepartment(id, data) {
  const response = await api.put(`/departments/${id}`, data)
  return response.data
}

export {
  getDepartments,
  createDepartment,
  updateDepartment,
}