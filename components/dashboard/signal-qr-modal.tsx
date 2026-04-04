"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function SignalQrModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [qrLoadError, setQrLoadError] = useState<string | null>(null);
    const [qrObjectUrl, setQrObjectUrl] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const activeObjectUrlRef = useRef<string | null>(null);
    const requestIdRef = useRef(0);

    function clearObjectUrl() {
        if (activeObjectUrlRef.current) {
            URL.revokeObjectURL(activeObjectUrlRef.current);
            activeObjectUrlRef.current = null;
        }
    }

    async function loadQrCode() {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsQrLoading(true);
        setQrLoadError(null);
        setQrObjectUrl(null);

        try {
            const response = await fetch("/api/signal/qr", {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error("Unable to load QR. Please try again.");
            }

            const qrBlob = await response.blob();

            if (requestId !== requestIdRef.current) {
                return;
            }

            clearObjectUrl();
            const objectUrl = URL.createObjectURL(qrBlob);
            activeObjectUrlRef.current = objectUrl;
            setQrObjectUrl(objectUrl);
        } catch (error) {
            if (controller.signal.aborted) {
                return;
            }

            setQrLoadError(
                error instanceof Error
                    ? error.message
                    : "Unable to load QR. Please try again.",
            );
        } finally {
            if (requestId === requestIdRef.current) {
                setIsQrLoading(false);
            }
        }
    }

    function openModal() {
        setIsOpen(true);
        void loadQrCode();
    }

    function closeModal() {
        setIsOpen(false);
        abortControllerRef.current?.abort();
        setIsQrLoading(false);
        setQrLoadError(null);
        setQrObjectUrl(null);
        clearObjectUrl();
    }

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            clearObjectUrl();
        };
    }, []);

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
                                onClick={closeModal}
                            >
                                Close
                            </Button>
                        </div>

                        <p className="mb-3 text-xs text-muted-foreground">
                            Open Signal on your phone, then scan this code from Linked Devices.
                        </p>

                        <div className="relative flex h-90 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white p-4">
                            {isQrLoading ? (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/90">
                                    <Spinner className="size-6 text-[#0b0b12]" />
                                    <p className="text-xs font-medium text-[#0b0b12]">Loading QR code...</p>
                                </div>
                            ) : null}

                            {qrLoadError ? (
                                <p className="px-4 text-center text-sm font-medium text-red-600">
                                    {qrLoadError}
                                </p>
                            ) : null}

                            {qrObjectUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={qrObjectUrl}
                                    alt="Signal QR code"
                                    className={`h-72 w-72 object-contain transition-opacity ${isQrLoading || qrLoadError ? "opacity-0" : "opacity-100"
                                        }`}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
