function generateNextEmployeeCode(rows) {
    let maxCode = 0
    rows.forEach((row) => {
        const employee = row.employeeId || row
        const match = employee.employee_code?.match(/^EMP-(\d+)$/)
        if (match) {
            const code = parseInt(match[1], 10)
            if (code > maxCode) {
                maxCode = code
            }
        }
    })
    return `EMP-${String(maxCode + 1).padStart(4, '0')}`
}
export default generateNextEmployeeCode