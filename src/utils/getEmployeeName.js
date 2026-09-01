function getEmployeeName(employee, language) {
  if (!employee) return ''
  const nameField = language === 'en' ? 'name_en' : 'name_ar'
  return employee[nameField] || ''
}

export default getEmployeeName