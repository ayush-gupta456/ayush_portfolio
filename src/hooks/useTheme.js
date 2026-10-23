import { useEffect, useState } from "react";
export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => { try { return localStorage.getItem("theme") !== "light"; } catch { return true; } });
  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); document.documentElement.style.colorScheme = isDark ? "dark" : "light"; try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch { /* Theme still works without persistent storage. */ } }, [isDark]);
  return { isDark, toggleTheme: () => setIsDark(value => !value) };
};
