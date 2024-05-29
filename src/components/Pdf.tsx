import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from './ui/button';

interface PrintTableProps {
    data: any[];
    heading: string;
}

const PrintTable: React.FC<PrintTableProps> = ({ data, heading }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    // Filter out the "action" column
    const filteredData = data.map(({ action, ...rest }) => rest);
    const tableHeaders = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

    return (
        <div className='w-full'>
            <Button onClick={handlePrint} className='w-full !text-white runded-md !bg-emerald-600 font-semibold'>Export to PDF</Button>
            <div ref={componentRef} className="printable-table">
                <h2 className='text-center text-lg font-semibold my-4'>{heading}</h2>
                <table className="min-w-full divide-y divide-gray-200 rounded-xl m-2">
                    <thead className="bg-gray-50">
                        <tr>
                            {tableHeaders.map((header, index) => (
                                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{String(value)}</div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PrintTable;
