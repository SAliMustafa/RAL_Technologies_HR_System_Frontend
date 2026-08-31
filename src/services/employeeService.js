import api from './api'


async function getMyProfile() {

    const response = await api.get("/Employees/me/profile")
    return response.data
    
}











export {
 getMyProfile
};

