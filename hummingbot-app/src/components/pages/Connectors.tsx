import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/AppContext";
import { HummingbotAPI, ConnectorBalance, ConnectorStatus } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { Plug, RefreshCw, Eye, EyeOff, Check, X } from "lucide-react";

export function Connectors() {
  const { isConnected, connectors, refreshConnectors, selectedConnector, setSelectedConnector } = useApp();
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [savingCredentials, setSavingCredentials] = useState(false);

  const fetchConnectorStatus = async (connectorName: string) => {
    setLoading(true);
    try {
      const status = await HummingbotAPI.Connectors.getStatus(connectorName);
      setConnectorStatus(status);
    } catch (error) {
      console.error("Failed to fetch connector status:", error);
      setConnectorStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConnector) {
      fetchConnectorStatus(selectedConnector);
    }
  }, [selectedConnector]);

  const handleSaveCredentials = async () => {
    if (!selectedConnector) return;
    setSavingCredentials(true);
    try {
      await HummingbotAPI.Connectors.setCredentials(selectedConnector, credentials);
      await refreshConnectors();
      setCredentials({});
      setShowCredentials(false);
    } catch (error) {
      console.error("Failed to save credentials:", error);
    } finally {
      setSavingCredentials(false);
    }
  };

  // Filter to show only CLOB connectors (Binance, Hyperliquid, etc.)
  const clobConnectors = connectors.filter(
    (c) => c.trading_type === "SPOT" || c.trading_type === "perpetual" || c.connector_type === "exchange"
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Plug className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Not Connected</h2>
        <p className="text-muted-foreground">Connect to Hummingbot to manage connectors</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Connectors</h1>
          <p className="text-muted-foreground">Manage your exchange connections</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refreshConnectors()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connector List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Connectors</CardTitle>
            <CardDescription>Select a connector to view details or configure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clobConnectors.map((connector) => (
                <button
                  key={connector.name}
                  onClick={() => setSelectedConnector(connector.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selectedConnector === connector.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${connector.is_configured ? "bg-green-500" : "bg-gray-400"}`} />
                    <div className="text-left">
                      <div className="font-medium">{connector.display_name}</div>
                      <div className="text-sm text-muted-foreground">{connector.trading_type}</div>
                    </div>
                  </div>
                  {connector.is_configured ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connector Details */}
        <div className="space-y-6">
          {selectedConnector ? (
            <>
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedConnector}</CardTitle>
                  <CardDescription>
                    {loading ? "Loading..." : connectorStatus?.is_connected ? "Connected" : "Not Connected"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {connectorStatus && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Trading Pairs</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {connectorStatus.trading_pairs.length > 0 ? (
                            connectorStatus.trading_pairs.slice(0, 10).map((pair) => (
                              <span
                                key={pair}
                                className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs"
                              >
                                {pair}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No active trading pairs</span>
                          )}
                          {connectorStatus.trading_pairs.length > 10 && (
                            <span className="text-xs text-muted-foreground">
                              +{connectorStatus.trading_pairs.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Balances Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Balances</CardTitle>
                  <CardDescription>Your current balances on {selectedConnector}</CardDescription>
                </CardHeader>
                <CardContent>
                  {connectorStatus?.balances && connectorStatus.balances.length > 0 ? (
                    <div className="space-y-2">
                      {connectorStatus.balances.map((balance: ConnectorBalance) => (
                        <div
                          key={balance.asset}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="font-medium">{balance.asset}</span>
                          <div className="text-right">
                            <div className="font-mono">{formatNumber(balance.total, 8)}</div>
                            <div className="text-xs text-muted-foreground">
                              Available: {formatNumber(balance.available, 8)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No balances available</p>
                  )}
                </CardContent>
              </Card>

              {/* Credentials Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Credentials</CardTitle>
                  <CardDescription>Configure API credentials for {selectedConnector}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key</Label>
                      <div className="relative">
                        <Input
                          id="api_key"
                          type={showCredentials ? "text" : "password"}
                          placeholder="Enter API key"
                          value={credentials.api_key || ""}
                          onChange={(e) =>
                            setCredentials({ ...credentials, api_key: e.target.value })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowCredentials(!showCredentials)}
                        >
                          {showCredentials ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api_secret">API Secret</Label>
                      <Input
                        id="api_secret"
                        type={showCredentials ? "text" : "password"}
                        placeholder="Enter API secret"
                        value={credentials.api_secret || ""}
                        onChange={(e) =>
                          setCredentials({ ...credentials, api_secret: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      onClick={handleSaveCredentials}
                      disabled={savingCredentials || !credentials.api_key || !credentials.api_secret}
                      className="w-full"
                    >
                      {savingCredentials ? "Saving..." : "Save Credentials"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plug className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a connector to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
