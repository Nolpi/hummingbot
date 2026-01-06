import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { HummingbotAPI, SystemHealth, AvailableConnector, StrategyStatus } from "./api";

interface AppState {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // System state
  systemHealth: SystemHealth | null;

  // Connectors
  connectors: AvailableConnector[];
  selectedConnector: string | null;

  // Strategy
  strategyStatus: StrategyStatus | null;

  // Settings
  apiUrl: string;
  darkMode: boolean;
}

interface AppContextValue extends AppState {
  // Actions
  setApiUrl: (url: string) => void;
  setDarkMode: (enabled: boolean) => void;
  setSelectedConnector: (connector: string | null) => void;
  refreshConnectors: () => Promise<void>;
  refreshStrategyStatus: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

const defaultState: AppState = {
  isConnected: false,
  connectionError: null,
  systemHealth: null,
  connectors: [],
  selectedConnector: null,
  strategyStatus: null,
  apiUrl: "http://localhost:8000/api/v1",
  darkMode: true,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Load saved settings from localStorage
    const savedUrl = localStorage.getItem("hummingbot_api_url");
    const savedDarkMode = localStorage.getItem("hummingbot_dark_mode");
    return {
      ...defaultState,
      apiUrl: savedUrl || defaultState.apiUrl,
      darkMode: savedDarkMode !== "false",
    };
  });

  // Apply dark mode to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.darkMode]);

  // Set API URL
  useEffect(() => {
    HummingbotAPI.setBaseUrl(state.apiUrl);
  }, [state.apiUrl]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const health = await HummingbotAPI.System.health();
      setState((prev) => ({
        ...prev,
        isConnected: true,
        connectionError: null,
        systemHealth: health,
      }));
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: error instanceof Error ? error.message : "Connection failed",
        systemHealth: null,
      }));
      return false;
    }
  }, []);

  const refreshConnectors = useCallback(async () => {
    try {
      const connectors = await HummingbotAPI.Connectors.list();
      setState((prev) => ({ ...prev, connectors }));
    } catch (error) {
      console.error("Failed to fetch connectors:", error);
    }
  }, []);

  const refreshStrategyStatus = useCallback(async () => {
    try {
      const status = await HummingbotAPI.Strategies.getStatus();
      setState((prev) => ({ ...prev, strategyStatus: status }));
    } catch (error) {
      console.error("Failed to fetch strategy status:", error);
    }
  }, []);

  const setApiUrl = useCallback((url: string) => {
    localStorage.setItem("hummingbot_api_url", url);
    setState((prev) => ({ ...prev, apiUrl: url }));
  }, []);

  const setDarkMode = useCallback((enabled: boolean) => {
    localStorage.setItem("hummingbot_dark_mode", enabled.toString());
    setState((prev) => ({ ...prev, darkMode: enabled }));
  }, []);

  const setSelectedConnector = useCallback((connector: string | null) => {
    setState((prev) => ({ ...prev, selectedConnector: connector }));
  }, []);

  // Initial connection check and polling
  useEffect(() => {
    checkConnection();

    const interval = setInterval(() => {
      if (state.isConnected) {
        refreshStrategyStatus();
      } else {
        checkConnection();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkConnection, refreshStrategyStatus, state.isConnected]);

  // Fetch connectors when connected
  useEffect(() => {
    if (state.isConnected) {
      refreshConnectors();
      refreshStrategyStatus();
    }
  }, [state.isConnected, refreshConnectors, refreshStrategyStatus]);

  const value: AppContextValue = {
    ...state,
    setApiUrl,
    setDarkMode,
    setSelectedConnector,
    refreshConnectors,
    refreshStrategyStatus,
    checkConnection,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
