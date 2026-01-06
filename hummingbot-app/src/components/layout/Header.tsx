import { Activity, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";

export function Header() {
  const { isConnected, darkMode, setDarkMode, strategyStatus } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold">Hummingbot</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Strategy Status */}
          {strategyStatus?.is_running && (
            <div className="flex items-center space-x-2 rounded-md bg-success/10 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="text-sm text-success">
                {strategyStatus.strategy_name || "Strategy Running"}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" asChild>
            <a href="/settings">
              <Settings className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
