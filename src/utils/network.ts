export const isWifiConnection = (): boolean => {
    const conn = (navigator as any).connection;
    if (conn) {
      return conn.effectiveType === 'wifi' || 
             conn.saveData === false ||
             ['wifi', 'ethernet', 'other'].includes(conn.type);
    }
    return true; // Assume WiFi if API unavailable
  };
  
  export const useNetworkStatus = () => {
    const [isWifi, setIsWifi] = useState(isWifiConnection());
  
    useEffect(() => {
      const handleChange = () => setIsWifi(isWifiConnection());
      const conn = (navigator as any).connection;
      
      if (conn) {
        conn.addEventListener('change', handleChange);
        return () => conn.removeEventListener('change', handleChange);
      }
    }, []);
  
    return isWifi;
  };