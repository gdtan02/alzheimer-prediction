import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis, Cell } from "recharts"
import { PredictionResult } from "@/services/predictionService";
import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { VisualizationResult } from "@/types/visualization";

const ITEMS_PER_PAGE = 50;
const CLASS_LABELS = {
    1: "Normal Cognition",
    2: "Cognitively Impaired, but not MCI",
    3: "Either amnestic or non-amnestic MCI",
    4: "Dementia",
};

const CLASS_COLORS = {
    1: ["#3b82fE", "#60a5fa", "#93c5fd", "#bfdbfe"], // Blue
    2: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"], // Green
    3: ["#eab308", "#facc15", "#fde047", "#fef08a"], // Yellow
    4: ["#ef4444", "#f87171", "#fca5a5", "#fecaca"], // Orange
};

const AGE_GROUPS = [
    { label: "Below 60", min: 0, max: 59 },
    { label: "60-69", min: 60, max: 69 },
    { label: "70-79", min: 70, max: 79 },
    { label: "80 or above", min: 80, max: Infinity },
];


// Props for dialog component
interface PredictionResultDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    results: PredictionResult[] | null;
    visualizations: VisualizationResult[] | null;
}
// Chart data interfaces
interface BarChartDataItem {
    category: string;
    count: number;
    fill?: string;
}

interface NaccuDsdDetailedBreakdown {
    classLabel: string;
    naccudsdValue: number;
    sexDistribution: BarChartDataItem[];
    ageGroupDistribution: BarChartDataItem[];
}

const chartConfig = {
    class1: {
      label: "Normal Cognition",
      color: "#3b82fE",
    },
    class2: {
      label: "Cognitively Impaired, but not MCI",
      color: "#10b981",
    },
    class3: {
      label: "Either amnestic or non-amnestic MCI",
      color: "#eab308",
    },
    class4: {
      label: "Dementia",
      color: "#ef4444",
    }
  };

// Helper function to get alzheimer class label and color
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

const getAlzheimerClassColor = (code: number): string => {
    return CLASS_COLORS[code as keyof typeof CLASS_COLORS][0] || "#CCCCCC";
};


const PredictionResultDialog: React.FC<PredictionResultDialogProps> = ({ isOpen, onOpenChange, results, visualizations }) => {

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
        
        const total = distribution.reduce((sum, count) => sum + count, 0);
        
        return [
            { name: CLASS_LABELS[1], value: distribution[0], percentage: (distribution[0] / total) * 100, fill: CLASS_COLORS[1][0] },
            { name: CLASS_LABELS[2], value: distribution[1], percentage: (distribution[1] / total) * 100, fill: CLASS_COLORS[2][0] },
            { name: CLASS_LABELS[3], value: distribution[2], percentage: (distribution[2] / total) * 100, fill: CLASS_COLORS[3][0] },
            { name: CLASS_LABELS[4], value: distribution[3], percentage: (distribution[3] / total) * 100, fill: CLASS_COLORS[4][0] }
        ];
    }, [results]);

    // Calculate demographic breakdowns by class
    const demographicBreakdowns = useMemo(() => {
        if (!results || results.length === 0) return [];
        
        // Create an array to store breakdown objects for each NACCUDSD class
        const breakdowns: NaccuDsdDetailedBreakdown[] = [];
        
        // For each class (1-4), create a breakdown
        for (let classValue = 1; classValue <= 4; classValue++) {
            // Filter patients by this class
            const patientsInClass = results.filter(p => p.NACCUDSD === classValue);
            
            if (patientsInClass.length === 0) continue;
            
            // Sex distribution
            const maleCount = patientsInClass.filter(p => p.SEX === 1).length;
            const femaleCount = patientsInClass.filter(p => p.SEX === 2).length;

            const classColor = CLASS_COLORS[classValue as keyof typeof CLASS_COLORS]
            
            const sexDistribution = [
                { category: "Male", count: maleCount, fill: classColor[0] },
                { category: "Female", count: femaleCount, fill: classColor[1] }
            ];
            
            // Age group distribution
            const ageGroups = AGE_GROUPS.map((group, index) => {
                const count = patientsInClass.filter(
                    p => p.AGE !== undefined && p.AGE >= group.min && p.AGE <= group.max
                ).length;
                
                return {
                    category: group.label,
                    count,
                    fill: classColor[index % classColor.length]
                };
            });
            
            breakdowns.push({
                classLabel: getAlzheimerClassLabel(classValue),
                naccudsdValue: classValue,
                sexDistribution,
                ageGroupDistribution: ageGroups
            });
        }
        
        return breakdowns;
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
                        {/* Results */}
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
                        {/* Analysis */}
                        <TabsContent value="analysis" className="space-y-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle>Overall Distribution</CardTitle>
                                    <CardDescription>
                                        Distribution of Alzheimer's disease classes across all patients
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full flex justify-center items-center">
                                        {/* Pie chart */}
                                        <ChartContainer className="w-full max-w-lg min-w-[600px]" config={chartConfig}>
                                            {/* <ResponsiveContainer width="100%" height="100%"> */}
                                            <PieChart>
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent hideLabel />}
                                                />
                                                <Pie
                                                    data={classDistribution}
                                                    labelLine={true}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                >
                                                    {classDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Legend />
                                            </PieChart>
                                            {/* </ResponsiveContainer> */}
                                        </ChartContainer>


                                    </div>
                                </CardContent>
                            </Card>

                            {/* Demographic Breakdowns for each class */}
                            {demographicBreakdowns.map((breakdown) => (
                                <Card key={breakdown.naccudsdValue}>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-4 h-4 rounded-full" 
                                                style={{ backgroundColor: getAlzheimerClassColor(breakdown.naccudsdValue) }}
                                            ></div>
                                            <CardTitle>{breakdown.classLabel} - Demographic Breakdown</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Sex Distribution */}
                                            <div>
                                                <h4 className="font-semibold mb-4">Sex Distribution</h4>
                                                <div className="h-64">
                                                    <ChartContainer config={chartConfig}>
                                                        <BarChart data={breakdown.sexDistribution}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="category" tickMargin={10} />
                                                            <YAxis tickLine={true} />
                                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed"/>} />
                                                            <Bar dataKey="count" radius={4}>
                                                                {breakdown.sexDistribution.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ChartContainer>
                                                </div>
                                            </div>

                                            {/* Age Group Distribution */}
                                            <div>
                                                <h4 className="font-semibold mb-4">Age Group Distribution</h4>
                                                <div className="h-64">
                                                    <ChartContainer config={chartConfig}>
                                                        <BarChart data={breakdown.ageGroupDistribution}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="category" tickMargin={10} />
                                                            <YAxis tickLine={true} />
                                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed"/>} />
                                                            <Bar dataKey="count" radius={4} />
                                                        </BarChart>
                                                    </ChartContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Visualizations */}
                            {visualizations && visualizations.length > 0 && (
                                <div className="space-y-6 pt-6">
                                <h3 className="text-xl font-semibold text-center mb-4">Data Visualizations</h3> 
                                {visualizations.map((viz) => (
                                    <Card key={viz.name}>
                                        <CardHeader>
                                            <CardTitle className="text-center">{viz.label}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center">
                                            {viz.error ? (
                                                <p className="text-red-500">
                                                    Could not load visualization: {viz.error}
                                                </p>
                                            ) : viz.imageUrl ? (
                                                <img 
                                                    src={viz.imageUrl} 
                                                    alt={viz.label} 
                                                    className="rounded-md border w-full max-w-2xl h-auto" // Added max-width
                                                />
                                            ) : (
                                                <p className="text-muted-foreground">Visualization data not available.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
    

}

export default PredictionResultDialog;
