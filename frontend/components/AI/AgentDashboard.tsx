"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface AgentAction {
    id: number;
    agent: string;
    actionType: string;
    escrowId: number;
    success: boolean;
    timestamp: number;
    confidence?: number;
}

interface AgentStats {
    totalActions: number;
    successfulActions: number;
    successRate: number;
    active: boolean;
}

export function AgentDashboard() {
    const [milestoneActions, setMilestoneActions] = useState<AgentAction[]>([]);
    const [disputeActions, setDisputeActions] = useState<AgentAction[]>([]);
    const [milestoneStats, setMilestoneStats] = useState<AgentStats>({
        totalActions: 0,
        successfulActions: 0,
        successRate: 0,
        active: true,
    });
    const [disputeStats, setDisputeStats] = useState<AgentStats>({
        totalActions: 0,
        successfulActions: 0,
        successRate: 0,
        active: true,
    });

    // In production, fetch from blockchain or API
    useEffect(() => {
        // Simulated data for demo
        const mockMilestoneStats = {
            totalActions: 12,
            successfulActions: 11,
            successRate: 91.7,
            active: true,
        };

        const mockDisputeStats = {
            totalActions: 3,
            successfulActions: 3,
            successRate: 100,
            active: true,
        };

        setMilestoneStats(mockMilestoneStats);
        setDisputeStats(mockDisputeStats);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">AI Agent Dashboard</h2>
                <Badge variant="outline" className="ml-2">
                    Powered by x402
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Milestone Monitor Agent */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-green-500" />
                                Milestone Monitor AI
                            </CardTitle>
                            {milestoneStats.active && (
                                <Badge variant="outline" className="bg-green-50">
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        Active
                                    </div>
                                </Badge>
                            )}
                        </div>
                        <CardDescription>
                            Analyzes deliverables and triggers automatic payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Actions</p>
                                <p className="text-2xl font-bold">{milestoneStats.totalActions}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                <p className="text-2xl font-bold flex items-center gap-1">
                                    {milestoneStats.successRate.toFixed(1)}%
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Recent Actions</p>
                            <div className="space-y-2">
                                {[
                                    { id: 1, escrow: 5, result: "Approved", time: "2 min ago" },
                                    { id: 2, escrow: 3, result: "Approved", time: "15 min ago" },
                                    { id: 3, escrow: 8, result: "Approved", time: "1 hour ago" },
                                ].map((action) => (
                                    <div
                                        key={action.id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">
                                                Milestone #{action.escrow}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {action.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dispute Arbitrator Agent */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-blue-500" />
                                Dispute Arbitrator AI
                            </CardTitle>
                            {disputeStats.active && (
                                <Badge variant="outline" className="bg-blue-50">
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        Active
                                    </div>
                                </Badge>
                            )}
                        </div>
                        <CardDescription>
                            Resolves disputes using evidence analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Actions</p>
                                <p className="text-2xl font-bold">{disputeStats.totalActions}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                <p className="text-2xl font-bold flex items-center gap-1">
                                    {disputeStats.successRate.toFixed(1)}%
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Recent Actions</p>
                            <div className="space-y-2">
                                {[
                                    { id: 1, escrow: 2, result: "Resolved", time: "3 hours ago" },
                                    { id: 2, escrow: 7, result: "Resolved", time: "1 day ago" },
                                ].map((action) => (
                                    <div
                                        key={action.id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm">
                                                Dispute #{action.escrow}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {action.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">x402 Integration</p>
                                <p className="text-xs text-muted-foreground">Operational</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">AI Agents</p>
                                <p className="text-xs text-muted-foreground">2 Active</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Response Time</p>
                                <p className="text-xs text-muted-foreground">~2 minutes</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
