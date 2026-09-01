import api from "./api";

async function getLeaveAllocations(params = {}) {
  const response = await api.get("/leave-allocation", { params });
  return response.data;
}

async function getLeaveAllocationById(id) {
  const response = await api.get(`/leave-allocation/${id}`);
  return response.data;
}

async function createLeaveAllocation(data) {
  const response = await api.post("/leave-allocation", data);
  return response.data;
}

async function updateLeaveAllocation(id, data) {
  const response = await api.put(`/leave-allocation/${id}`, data);
  return response.data;
}

async function deleteLeaveAllocation(id) {
  const response = await api.delete(`/leave-allocation/${id}`);
  return response.data;
}

export {
  getLeaveAllocations,
  getLeaveAllocationById,
  createLeaveAllocation,
  updateLeaveAllocation,
  deleteLeaveAllocation,
};
