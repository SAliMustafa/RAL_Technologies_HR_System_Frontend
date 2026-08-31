import api from './api'


async function getMyAttendance(params = {}){
    const response = await api.get('/attendance', {params})
    return response.data
}

export {getMyAttendance}