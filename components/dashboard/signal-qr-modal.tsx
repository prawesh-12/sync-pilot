"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function SignalQrModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [requestNonce, setRequestNonce] = useState(0);

    const qrImageUrl = useMemo(() => {
        return `/api/signal/qr?nonce=${requestNonce}`;
    }, [requestNonce]);

    function openModal() {
        setRequestNonce((previous) => previous + 1);
        setIsOpen(true);
    }

    return (
        <>
            <Button type="button" variant="outline" className="mt-3" onClick={openModal}>
                Generate Signal QR
            </Button>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-[#0b0b12] p-4 shadow-2xl">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold text-white">Scan Signal QR</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Close
                            </Button>
                        </div>

                        <p className="mb-3 text-xs text-muted-foreground">
                            Open Signal on your phone, then scan this code from Linked Devices.
                        </p>

                        <div className="flex h-90 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white p-4">
                            <Image
                                src={qrImageUrl}
                                alt="Signal QR code"
                                className="h-72 w-72 object-contain"
                                width={288}
                                height={288}
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
