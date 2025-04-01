// src/context/ExchangeRateContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface ExchangeRateContextType {
  exchangeRate: number | null;
}

const ExchangeRateContext = createContext<ExchangeRateContextType>({ exchangeRate: null });

export const ExchangeRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const usdToSrd = data.rates.SRD || 36.35; // Fallback to 36.35 if API fails
        setExchangeRate(usdToSrd + 0.4); // Add 40 cents markup
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setExchangeRate(36.35 + 0.4); // Fallback to 36.35 + 0.4 if API fails
      }
    };

    fetchExchangeRate();
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ exchangeRate }}>
      {children}
    </ExchangeRateContext.Provider>
  );
};

export const useExchangeRate = () => useContext(ExchangeRateContext);