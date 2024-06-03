import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "./ui/button";

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
  const tableHeaders =
    filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  return (
    <div className="w-full">
      <Button
        onClick={handlePrint}
        className="runded-md w-full !bg-emerald-600 font-semibold !text-white"
      >
        Export to PDF
      </Button>
      <div ref={componentRef} className="printable-table">
        <h2 className="my-4 text-center text-lg font-semibold">{heading}</h2>
        <table className="m-2 min-w-full divide-y divide-gray-200 rounded-xl">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex} className="whitespace-nowrap px-6 py-4">
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
