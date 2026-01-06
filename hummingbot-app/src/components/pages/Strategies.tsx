import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";
import { HummingbotAPI, StrategyInfo, ControllerConfig } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { PlayCircle, StopCircle, RefreshCw, Settings, Plus } from "lucide-react";

export function Strategies() {
  const { isConnected, strategyStatus, refreshStrategyStatus } = useApp();
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [controllers, setControllers] = useState<ControllerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const [strategiesData, controllersData] = await Promise.all([
        HummingbotAPI.Strategies.list(),
        HummingbotAPI.Controllers.list(),
      ]);
      setStrategies(strategiesData);
      setControllers(controllersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isConnected]);

  const handleStartStrategy = async (scriptName: string) => {
    setActionLoading(true);
    try {
      await HummingbotAPI.Strategies.start(scriptName);
      await refreshStrategyStatus();
    } catch (error) {
      console.error("Failed to start strategy:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopStrategy = async () => {
    setActionLoading(true);
    try {
      await HummingbotAPI.Strategies.stop();
      await refreshStrategyStatus();
    } catch (error) {
      console.error("Failed to stop strategy:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <PlayCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Not Connected</h2>
        <p className="text-muted-foreground">Connect to Hummingbot to manage strategies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategies</h1>
          <p className="text-muted-foreground">Manage your trading strategies</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Current Strategy Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Strategy</CardTitle>
          <CardDescription>Status of the currently running strategy</CardDescription>
        </CardHeader>
        <CardContent>
          {strategyStatus?.is_running ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-lg font-semibold">{strategyStatus.strategy_name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Type: {strategyStatus.strategy_type} | Runtime: {formatDuration(strategyStatus.runtime_seconds || 0)}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleStopStrategy}
                  disabled={actionLoading}
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Strategy
                </Button>
              </div>
              {strategyStatus.status_text && (
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto whitespace-pre-wrap">
                  {strategyStatus.status_text}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <StopCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No strategy is currently running</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Scripts */}
      <Card>
        <CardHeader>
          <CardTitle>Available Scripts</CardTitle>
          <CardDescription>Script strategies that can be started</CardDescription>
        </CardHeader>
        <CardContent>
          {strategies.filter((s) => s.strategy_type === "script").length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No scripts available</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {strategies
                .filter((s) => s.strategy_type === "script")
                .map((strategy) => (
                  <Card key={strategy.name} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{strategy.display_name}</CardTitle>
                      <CardDescription className="text-xs">{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleStartStrategy(strategy.name)}
                        disabled={actionLoading || strategyStatus?.is_running}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controllers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Controllers (V2)</CardTitle>
            <CardDescription>Controller-based strategies</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Controller
          </Button>
        </CardHeader>
        <CardContent>
          {controllers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No controllers configured</p>
          ) : (
            <div className="space-y-2">
              {controllers.map((controller) => (
                <div
                  key={controller.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${controller.manual_kill_switch ? "bg-red-500" : "bg-green-500"}`} />
                      <span className="font-medium">{controller.id}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {controller.controller_name} | {controller.connector_name} | {controller.trading_pair}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
