import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SignalQrModal } from "@/components/dashboard/signal-qr-modal";

export type SignalIntegrationCardProps = {
    signalDeviceName: string;
    isSignalConnected: boolean;
    isSignalServiceConfigured: boolean;
    senderNumber: string;
    recipientNumber: string;
    saveAction: (formData: FormData) => Promise<void>;
    disconnectAction: () => Promise<void>;
};

export function SignalIntegrationCard({
    signalDeviceName,
    isSignalConnected,
    isSignalServiceConfigured,
    senderNumber,
    recipientNumber,
    saveAction,
    disconnectAction,
}: SignalIntegrationCardProps) {
    return (
        <Card className="border-[#A089E6]/30 bg-[#A089E6]/3">
            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="space-y-2">
                    <CardTitle className="text-base">Signal Integration</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Device name: {signalDeviceName}
                    </p>
                </div>

                {isSignalConnected ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default">Connected</Badge>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Not connected</Badge>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {isSignalServiceConfigured ? (
                    <SignalQrModal />
                ) : (
                    <p className="text-xs text-red-300">
                        SIGNAL_CLI_REST_URL is missing. Add it to your environment first.
                    </p>
                )}

                <form action={saveAction} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label
                                htmlFor="senderNumber"
                                className="text-xs text-muted-foreground"
                            >
                                Sender Number
                            </label>
                            <Input
                                id="senderNumber"
                                name="senderNumber"
                                placeholder="+910000000000"
                                defaultValue={senderNumber}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="recipientNumber"
                                className="text-xs text-muted-foreground"
                            >
                                Recipient Number
                            </label>
                            <Input
                                id="recipientNumber"
                                name="recipientNumber"
                                placeholder="+910000000000"
                                defaultValue={recipientNumber}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button type="submit" className="w-full sm:w-auto">Save Signal Numbers</Button>
                    </div>
                </form>

                {isSignalConnected ? (
                    <form action={disconnectAction} className="w-full sm:w-auto">
                        <Button type="submit" variant="destructive" className="w-full sm:w-auto">
                            Disconnect Signal
                        </Button>
                    </form>
                ) : null}
            </CardContent>
        </Card>
    );
}
