import api from './api'




async function checkIn() {
    const response = await api.post("/checkIn/check-in");
    return response.data;
}
async function checkOut() {
    const response = await api.post("/checkIn/check-out");
    return response.data;
}


export {

    checkIn, checkOut,

};
