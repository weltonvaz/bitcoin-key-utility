
import React, { useState, useCallback } from 'react';
import KeyInput from './components/KeyInput';
import KeyInfoTable from './components/KeyInfoTable';
import { KeyInfo } from './types';
import { generateRandomPrivateKeyHex, formatPrivateKey, deriveKeyData, isValidPrivateKeyHex } from './services/bitcoinService';
import { fetchAddressBalance } from './services/balanceService';
import { PRIVATE_KEY_HEX_LENGTH } from './constants';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [keyInfoList, setKeyInfoList] = useState<KeyInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setInputValue(rawValue);
    if (rawValue.trim() === '') {
        setInputError(null);
        return;
    }
    // Basic hex validation during typing
    if (!/^[0-9a-fA-F]*$/.test(rawValue)) {
        setInputError('Invalid character: Only hexadecimal (0-9, a-f, A-F) allowed.');
    } else if (rawValue.length > PRIVATE_KEY_HEX_LENGTH) {
        setInputError(`Input too long: Max ${PRIVATE_KEY_HEX_LENGTH} hex characters.`);
    } else {
        setInputError(null);
    }
  };

  const processKey = useCallback(async (keyToProcess: string) => {
    setIsLoading(true);
    setAppError(null);
    setInputError(null); 
    
    const formattedKey = formatPrivateKey(keyToProcess);

    if (!isValidPrivateKeyHex(formattedKey)) {
        setInputError(`Invalid private key. Ensure it's a valid ${PRIVATE_KEY_HEX_LENGTH}-character hex string within the SECP256k1 range.`);
        setKeyInfoList(null);
        setIsLoading(false);
        return;
    }
    
    // Update input field with the fully formatted key, especially if it was auto-generated or padded
    setInputValue(formattedKey);


    try {
      const derivedData = deriveKeyData(formattedKey);
      // Initialize with loading state for balances
      const initialKeyInfo = derivedData.map(item => ({
        ...item,
        loadingBalance: item.isAddress ? true : undefined,
        balance: item.isAddress ? 'Loading...' : undefined,
        errorBalance: null,
      }));
      setKeyInfoList(initialKeyInfo);

      // Fetch balances asynchronously
      const balancePromises = initialKeyInfo.map(async (item, index) => {
        if (item.isAddress && item.address) {
          try {
            const balance = await fetchAddressBalance(item.address);
            setKeyInfoList(prevList => {
              if (!prevList) return null;
              const newList = [...prevList];
              newList[index] = { ...newList[index], balance, loadingBalance: false };
              return newList;
            });
          } catch (balanceError) {
            console.error(`Balance fetch error for ${item.address}:`, balanceError);
            setKeyInfoList(prevList => {
              if (!prevList) return null;
              const newList = [...prevList];
              newList[index] = { 
                ...newList[index], 
                balance: 'Error', 
                loadingBalance: false, 
                errorBalance: (balanceError as Error).message || 'Failed to fetch'
              };
              return newList;
            });
          }
        }
      });
      await Promise.allSettled(balancePromises);

    } catch (error) {
      console.error("Error deriving key data:", error);
      setAppError((error as Error).message || "Failed to process private key.");
      setKeyInfoList(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateClick = useCallback(() => {
    const randomKey = generateRandomPrivateKeyHex();
    // setInputValue(randomKey); // The processKey will set the formatted version
    processKey(randomKey);
  }, [processKey]);

  const handleProcessClick = useCallback(() => {
    if (!inputValue.trim()) {
      setInputError("Private key input cannot be empty.");
      setKeyInfoList(null);
      return;
    }
    // Final validation check before processing
    const currentFormattedKey = formatPrivateKey(inputValue);
     if (!isValidPrivateKeyHex(currentFormattedKey)) {
        setInputError(`Invalid private key. Ensure it's a valid ${PRIVATE_KEY_HEX_LENGTH}-character hex string within the SECP256k1 range.`);
        setKeyInfoList(null);
        return;
    }
    setInputError(null); // Clear previous input errors if any
    processKey(inputValue);
  }, [inputValue, processKey]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-500">Bitcoin Key Utility</h1>
          <p className="text-slate-400 mt-2 text-lg">
            Generate and analyze Bitcoin private keys, addresses, and balances.
          </p>
        </header>

        <main>
          <KeyInput
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onGenerateClick={handleGenerateClick}
            onProcessClick={handleProcessClick}
            isLoading={isLoading}
            inputError={inputError}
          />

          {appError && (
            <div className="my-4 p-4 bg-red-800/50 border border-red-700 text-red-300 rounded-md shadow-lg text-center">
              <p className="font-semibold">Application Error:</p>
              <p>{appError}</p>
            </div>
          )}

          <KeyInfoTable keyInfoList={keyInfoList} />
        </main>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Bitcoin Key Utility. For educational and testing purposes only.</p>
          <p>Always handle private keys with extreme caution.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
