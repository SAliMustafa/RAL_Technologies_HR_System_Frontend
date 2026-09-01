import api from './api'

/// this for employees
async function checkIn() {
    const response = await api.post("/checkIn/check-in");
    return response.data;
}
async function checkOut() {
    const response = await api.post("/checkIn/check-out");
    return response.data;
}
async function getMyCheckins() {
    const response = await api.get("/checkIn/my-checkins");
    return response.data;
}







export {

    checkIn, 
    checkOut,
    getMyCheckins

};
