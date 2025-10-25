import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ThemeTokens {
  light?: Record<string, string | number>;
}

interface ThemeContextValue {
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ isReady: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    document.documentElement.classList.remove("dark");

    const applyTokens = async () => {
      try {
        const response = await fetch("/theme-tokens.json");

        if (!response.ok) {
          throw new Error("Unable to load theme tokens");
        }

        const tokens = (await response.json()) as ThemeTokens;
        const palette = tokens.light ?? {};
        const root = document.documentElement;

        Object.entries(palette).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, String(value));
        });
      } catch (error) {
        console.warn("Theme token load failed", error);
      } finally {
        if (!cancelled) {
          window.requestAnimationFrame(() => setIsReady(true));
        }
      }
    };

    applyTokens();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ isReady }), [isReady]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeStatus(): ThemeContextValue {
  return useContext(ThemeContext);
}
