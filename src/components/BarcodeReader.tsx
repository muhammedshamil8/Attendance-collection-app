import React, { useState, useEffect } from 'react';
import Quagga from '@ericblade/quagga2';
import { Button } from './ui/button';

interface BarcodeReaderProps {
  onDetected: (result: string) => void;
}

const BarcodeReader: React.FC<BarcodeReaderProps> = ({ onDetected }) => {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const initializeQuagga = () => {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: 640,
            height: 480,
            facingMode: 'environment',
          },
          area: {
            top: '0%',
            right: '0%',
            left: '0%',
            bottom: '0%',
          },
        },
        decoder: {
          readers: ['code_128_reader', 'ean_reader', 'ean_8_reader'],
        },
      }, (err) => {
        if (err) {
          console.error('Initialization error:', err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        console.log('Barcode detected and processed:', code);
        if (code !== null) {
          onDetected(code);
          setScanning(false); // stop scanning when a code is detected
        }
      });
    };

    if (scanning) {
      initializeQuagga();
    }

    return () => {
      Quagga.stop();
    };
  }, [scanning, onDetected]);

  const handleScan = () => {
    setScanning(true);
  };

  const handleStop = () => {
    setScanning(false);
    Quagga.stop();
  };

  return (
    <div className='border p-2 py-4  rounded-md flex items-center justify-center flex-col'>
     
      <div id="interactive" className="viewport min-h-[210px] md:min-h-[300px] w-full bg-black max-h-[210px] md:max-h-[300px] rounded-lg overflow-hidden m-2 max-w-[280px] md:max-w-[400px]" />
      <div className='flex items-center gap-4 justify-center mt-4'>
      <Button onClick={handleScan}>Scan</Button>
      <Button onClick={handleStop}>Stop</Button>
      </div>
    </div>
  );
};

export default BarcodeReader;