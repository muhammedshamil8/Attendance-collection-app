import React, { useState } from 'react';
import BarcodeReader from '@/components/BarcodeReader';

const Test: React.FC = () => {
  const [barcode, setBarcode] = useState<string>('No result');

  const handleDetected = (result: string) => {
    setBarcode(result);
  };

  return (
    <div>
      <h1>Barcode Scanner</h1>
     
    </div>
  );
};

export default Test;
