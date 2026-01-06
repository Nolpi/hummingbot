import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/AppContext";
import { HummingbotAPI } from "@/lib/api";
import { RefreshCw, FileText, Download, Trash2 } from "lucide-react";

export function Logs() {
  const { isConnected } = useApp();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState(100);
  const [level, setLevel] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const logsData = await HummingbotAPI.System.getLogs(lines, level || undefined);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [isConnected, lines, level]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, lines, level]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogLevelColor = (log: string): string => {
    if (log.includes("ERROR")) return "text-red-500";
    if (log.includes("WARNING")) return "text-yellow-500";
    if (log.includes("INFO")) return "text-blue-500";
    if (log.includes("DEBUG")) return "text-gray-500";
    return "text-foreground";
  };

  const handleDownload = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hummingbot-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Not Connected</h2>
        <p className="text-muted-foreground">Connect to Hummingbot to view logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs</h1>
          <p className="text-muted-foreground">View bot activity and debug information</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLogs([])}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lines</label>
              <Input
                type="number"
                value={lines}
                onChange={(e) => setLines(parseInt(e.target.value) || 100)}
                className="w-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="">All</option>
                <option value="DEBUG">DEBUG</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="ERROR">ERROR</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="autoRefresh" className="text-sm">Auto-refresh (3s)</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>Log Output</CardTitle>
          <CardDescription>
            Showing last {logs.length} log entries
            {autoRefresh && " (auto-refreshing)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 h-[60vh] overflow-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No logs available</p>
            ) : (
              <>
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`py-0.5 hover:bg-muted-foreground/10 ${getLogLevelColor(log)}`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
