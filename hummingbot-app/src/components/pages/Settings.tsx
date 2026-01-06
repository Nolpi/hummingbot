import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/AppContext";
import { Settings as SettingsIcon, Moon, Sun, Server, Check } from "lucide-react";

export function Settings() {
  const { apiUrl, setApiUrl, darkMode, setDarkMode, isConnected, checkConnection } = useApp();
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setApiUrl(tempApiUrl);
    const connected = await checkConnection();
    setTestResult(connected ? "success" : "error");
    setTesting(false);
  };

  const handleSaveApiUrl = () => {
    setApiUrl(tempApiUrl);
    checkConnection();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your Hummingbot app</p>
      </div>

      {/* API Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>API Connection</span>
          </CardTitle>
          <CardDescription>Configure the connection to your Hummingbot instance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api_url">API URL</Label>
            <div className="flex space-x-2">
              <Input
                id="api_url"
                placeholder="http://localhost:8000/api/v1"
                value={tempApiUrl}
                onChange={(e) => setTempApiUrl(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
                {testing ? "Testing..." : "Test"}
              </Button>
              <Button onClick={handleSaveApiUrl}>Save</Button>
            </div>
            {testResult && (
              <p className={`text-sm ${testResult === "success" ? "text-green-500" : "text-red-500"}`}>
                {testResult === "success" ? "Connection successful!" : "Connection failed. Check the URL and try again."}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div>
              <p className="font-medium">Connection Status</p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Connected to Hummingbot" : "Not connected"}
              </p>
            </div>
            <div className={`flex items-center space-x-2 ${isConnected ? "text-green-500" : "text-red-500"}`}>
              {isConnected ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span>Disconnected</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>Customize the look and feel of the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                {darkMode ? "Using dark theme" : "Using light theme"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setDarkMode(!darkMode)}
              className="space-x-2"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Version</span>
              <span>0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Framework</span>
              <span>Tauri + React</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Hummingbot App is a desktop/web application for controlling Hummingbot trading bots.
            It connects to the embedded FastAPI server running within the Hummingbot process.
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://hummingbot.org" target="_blank" rel="noopener noreferrer">
                Documentation
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/hummingbot/hummingbot" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
