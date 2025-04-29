import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { PredictionResult, TrainingResult } from "@/services/predictionService";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";

const ITEMS_PER_PAGE = 5;
const CLASS_LABELS = {
    1: "Normal Cognition",
    2: "Cognitively Impaired, but not MCI",
    3: "Either amnestic or non-amnestic MCI",
    4: "Dementia",
};


// Props for dialog component
interface PredictionResultDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    results: PredictionResult[] | null;
    modelMetrics?: {
        f1Score: number;
        accuracy: number;
        precision: number;
        recall: number;
    }
}

const getAlzheimerClassLabel = (code: number): string => {
    switch (code) {
        case 1:
            return "Normal Cognition";
        case 2:
            return "Cognitively Impaired, but not MCI";
        case 3:
            return "Either amnestic or non-amnestic MCI";
        case 4:
            return "Dementia";
        default:
            return "Unknown";
    }
};

const chartConfig = {
  class1: {
    label: "Normal Cognition",
    color: "#0088FE",
  },
  class2: {
    label: "Cognitively Impaired, but not MCI",
    color: "#00C49F",
  },
  class3: {
    label: "Either amnestic or non-amnestic MCI",
    color: "#FFBB28",
  },
  class4: {
    label: "Dementia",
    color: "#FF8042",
  }
};


const PredictionResultDialog: React.FC<PredictionResultDialogProps> = ({ isOpen, onOpenChange, results, modelMetrics }) => {

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate distribution of Alzheimer's classes
    const classDistribution = useMemo(() => {
        if (!results || results.length === 0) return [];
        
        const distribution = [0, 0, 0, 0]; // For classes 1, 2, 3, 4
        
        results.forEach(patient => {
            const classIndex = patient.NACCUDSD - 1;
            if (classIndex >= 0 && classIndex < 4) {
                distribution[classIndex]++;
            }
        });
        
        return [
            { name: CLASS_LABELS[1], value: distribution[0] },
            { name: CLASS_LABELS[2], value: distribution[1] },
            { name: CLASS_LABELS[3], value: distribution[2] },
            { name: CLASS_LABELS[4], value: distribution[3] }
        ];
    }, [results]);

    if (!results) {
        {/* No Results */ }
        return (
            <Dialog>
                <DialogContent className="sm:max-w-[800px]" hidden={results != null}>
                    <DialogHeader>
                        <DialogDescription>No Results Generated</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }

    // Calculate pagination
    const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    const formatPercentage = (value: number): string => {
        return `${(value * 100).toFixed(2)}%`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {/* Results generated */}
            <DialogContent className="sm:max-w-[130vh] max-h-[90vh]">
                
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-xl">Alzheimer's Prediction Results</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="results" className="mt-4">
                    <TabsList>
                        <TabsTrigger value="results">Results</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>
                    
                    <ScrollArea className="max-h-[70vh]">
                        <TabsContent value="results" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Patient Predictions</CardTitle>
                                    <CardDescription>
                                        Predicted Alzheimer's disease status for each patient in the dataset.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Patient ID</TableHead>
                                                <TableHead>NACCUDSD Class</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedResults.map((result) => (
                                                <TableRow key={result.NACCID}>
                                                    <TableCell className="font-medium">{result.NACCID}</TableCell>
                                                    <TableCell>{getAlzheimerClassLabel(result.NACCUDSD)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <div className="ml-auto flex items-center pt-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                        <p className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analysis" className="space-y-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle>Model Performance</CardTitle>
                                    <CardDescription>
                                        Metrics for the prediction model
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
    

}

export default PredictionResultDialog;
