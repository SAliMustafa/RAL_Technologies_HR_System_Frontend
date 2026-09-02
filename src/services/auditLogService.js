import api from "./api";


export async function getAllAuditLogs() {
  const response = await api.get(
    "/audit-logs"
  );

  return response.data;
}


export async function getAuditLogById(
  auditLogId
) {
  const response = await api.get(
    `/audit-logs/${auditLogId}`
  );

  return response.data;
}


export async function getAuditLogsByRecord(
  tableName,
  recordId
) {
  const response = await api.get(
    `/audit-logs/record/${tableName}/${recordId}`
  );

  return response.data;
}

