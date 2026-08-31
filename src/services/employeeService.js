import api from './api'

async function getAllEmployees () {
    const response = await api.get('/employees')
    return response.data
}

async function getEmployeeById(employeeId){
    const response = await api.get(`/employees/${employeeId}`)
    return response.data
}

async function updateEmployee(employeeId, formData){
    const response = await api.put(`/employees/${employeeId}`, formData)
    return response.data
}
async function updateEmployeeStatus(employeeId, status) {
    const response = await api.patch(`/employees/${employeeId}/status`, {status})
    return response.data
}
async function getMyProfile() {
    const response = await api.get(`/employees/me/profile`)
    return response.data
}