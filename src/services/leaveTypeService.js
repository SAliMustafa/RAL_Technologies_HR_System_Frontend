import api from "./api";

async function getLeaveTypes(includeInactive = false) {
  const response = await api.get("/leave", {
    params: includeInactive ? { includeInactive: true } : {},
  });
  return Array.isArray(response.data.leaveType) ? response.data.leaveType : [];
}

async function createLeaveType(data) {
  const response = await api.post("/leave", data);
  return response.data;
}

async function updateLeaveType(id, data) {
  const response = await api.put(`/leave/${id}`, data);
  return response.data;
}

async function deactivateLeaveType(id) {
  const response = await api.delete(`/leave/${id}`);
  return response.data;
}

async function activateLeaveType(id) {
  const response = await api.patch(`/leave/${id}`);
  return response.data;
}

export {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deactivateLeaveType,
  activateLeaveType,
};
