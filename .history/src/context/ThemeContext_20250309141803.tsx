
 // src/context/ThemeContext.tsx
 import { createContext, useContext } from 'react';
 

 type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
 };
 

 export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
 });
 

 export const useTheme = () => useContext(ThemeContext);
