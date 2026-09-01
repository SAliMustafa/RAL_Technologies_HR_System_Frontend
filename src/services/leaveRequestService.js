import api from "./api";

async function getLeaveRequests(params = {}) {
  const response = await api.get("/leave-request", { params });
  return response.data;
}

async function getLeaveRequestById(id) {
  const response = await api.get(`/leave-request/${id}`);
  return response.data;
}

async function createLeaveRequest(formData) {
  const response = await api.post("/leave-request", formData);
  return response.data;
}

async function updateLeaveRequest(id, formData) {
  const response = await api.put(`/leave-request/${id}`, formData);
  return response.data;
}

async function submitLeaveRequest(id) {
  const response = await api.put(`/leave-request/${id}/submit`);
  return response.data;
}

async function approveLeaveRequest(id) {
  const response = await api.put(`/leave-request/${id}/approve`);
  return response.data;
}

async function rejectLeaveRequest(id, decisionNote) {
  const response = await api.put(`/leave-request/${id}/reject`, {
    decision_note: decisionNote,
  });
  return response.data;
}

async function cancelLeaveRequest(id, decisionNote = "") {
  const response = await api.put(`/leave-request/${id}/cancel`, {
    decision_note: decisionNote,
  });
  return response.data;
}

async function deleteLeaveRequest(id) {
  const response = await api.delete(`/leave-request/${id}`);
  return response.data;
}

async function downloadLeaveRequestDocument(id) {
  const response = await api.get(`/leave-request/${id}/document`, {
    responseType: "blob",
  });

  return {
    blob: response.data,
    contentDisposition: response.headers["content-disposition"],
    contentType: response.headers["content-type"],
  };
}

export {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  deleteLeaveRequest,
  downloadLeaveRequestDocument,
};
