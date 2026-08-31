import api from './api'


async function getMyProfile() {

    const response = await api.get("/Employees/me/profile")
    return response.data

}

async function getMyDocuments() {
    const response = await api.get("/documents/my-documents");

    return response.data;
}


async function uploadDocument(formData) {
    const response = await api.post(
        "/documents",
        formData
    );

    return response.data;
}

async function getDocumentById(documentId) {
    const response = await api.get(
        `/documents/${documentId}`
    );

    return response.data;
}
async function getExpiryAlerts() {
    const response = await api.get("/documents/status/expiring");
    return response.data;
}
async function checkIn() {
    const response = await api.post("/checkIn/check-in");
    return response.data;
}
async function checkOut() {
    const response = await api.post("/checkIn/check-out");
    return response.data;
}

async function getTodayAttendance() {
    const response = await api.get("/attendance/my-attendance/today");
    return response.data;
}

export {
    getMyProfile,
    getMyDocuments,
    uploadDocument,
    getDocumentById,
    getExpiryAlerts,
    checkIn, checkOut,
    getTodayAttendance
};

