import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Student {
    No: number;
    AdmissionNo: string;
    Name: string;
    RollNo: string;
    Department: string;
    JoinedYear: string;
}

function exportToExcel(data: Student[], fileName: string) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add custom styling or formatting to the worksheet if needed
    // For example, setting column widths
    const columnWidths = [
        { wch: 10 }, // No
        { wch: 15 }, // AdmissionNo
        { wch: 20 }, // Name
        { wch: 15 }, // RollNo
        { wch: 20 }, // Department
        { wch: 15 }  // JoinedYear
    ];
    worksheet['!cols'] = columnWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attended Students');

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(excelBlob, fileName + '.xlsx');
}

export default exportToExcel;