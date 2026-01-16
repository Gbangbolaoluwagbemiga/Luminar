"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Loader2, AlertCircle, Zap } from "lucide-react";

interface X402PaymentStatusProps {
    escrowId: number;
    status?: "pending" | "approved" | "executing" | "completed" | "failed";
    instructionId?: string;
    timestamp?: number;
}

export function X402PaymentStatus({
    escrowId,
    status = "pending",
    instructionId,
    timestamp
}: X402PaymentStatusProps) {

    const getStatusIcon = () => {
        switch (status) {
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "approved":
                return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
            case "executing":
                return <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />;
            case "completed":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "failed":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-50">Awaiting AI Approval</Badge>;
            case "approved":
                return <Badge variant="outline" className="bg-blue-50">Approved - Queued</Badge>;
            case "executing":
                return <Badge variant="outline" className="bg-purple-50">Executing Payment</Badge>;
            case "completed":
                return <Badge variant="outline" className="bg-green-50">Payment Complete</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getDescription = () => {
        switch (status) {
            case "pending":
                return "AI Milestone Monitor is analyzing the deliverable...";
            case "approved":
                return "Payment instruction approved. Waiting for execution.";
            case "executing":
                return "x402 payment is being processed on-chain...";
            case "completed":
                return "Payment successfully transferred via x402 rails.";
            case "failed":
                return "Payment execution failed. Please contact support.";
            default:
                return "";
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        x402 Payment Status
                    </CardTitle>
                    {getStatusBadge()}
                </div>
                <CardDescription>
                    Automated payment processing via Cronos x402
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon()}</div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                            {getDescription()}
                        </p>
                        {instructionId && (
                            <p className="text-xs text-muted-foreground">
                                Instruction ID: {instructionId}
                            </p>
                        )}
                        {timestamp && (
                            <p className="text-xs text-muted-foreground">
                                {new Date(timestamp * 1000).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Payment Flow Steps */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Payment Flow:</p>
                    <div className="space-y-1">
                        {[
                            { step: "Deliverable Submitted", done: true },
                            { step: "AI Analysis", done: status !== "pending" },
                            { step: "Payment Approval", done: ["approved", "executing", "completed"].includes(status) },
                            { step: "x402 Execution", done: ["executing", "completed"].includes(status) },
                            { step: "Transfer Complete", done: status === "completed" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                                {item.done ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : (
                                    <div className="h-3 w-3 rounded-full border-2 border-gray-300" />
                                )}
                                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                                    {item.step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {status === "executing" && (
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-xs text-purple-900">
                            ⚡ x402 is processing your payment on Cronos EVM. This usually takes 1-2 minutes.
                        </p>
                    </div>
                )}

                {status === "completed" && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-xs text-green-900">
                            ✅ Payment successfully completed! Funds have been transferred to the freelancer.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
