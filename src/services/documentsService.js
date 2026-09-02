import api from './api'

async function getMyDocuments() {
    const response = await api.get("/documents/my-documents");

    return response.data;
}

async function uploadDocumentByEmployee(formData) {
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
async function getAllDocuments() {
    const response = await api.get("/documents");

    return response.data;
}

async function deleteDocument(documentId) {
    const response = await api.put(`/documents/delete/${documentId}`);
    return response.data;

}

export async function updateDocumentByHrAdmin(documentId, formData) {
    const response = await api.put(
        `/documents/hr/${documentId}`,
        formData
    );

    return response.data;
}

async function uploadDocumentByHrAdmin(employeeId, formData) {
    const response = await api.post(
        `/documents/employee/${employeeId}`,
        formData
    );

    return response.data;
}


 async function reviewDocument(
  documentId,
  data
) {
  const response = await api.put(
    `/documents/${documentId}/review`,
    data
  );

  return response.data;
}
export {
    getMyDocuments,
    uploadDocumentByEmployee,
    getDocumentById,
    getExpiryAlerts,
    getAllDocuments,
    deleteDocument,
    uploadDocumentByHrAdmin,
    reviewDocument
}