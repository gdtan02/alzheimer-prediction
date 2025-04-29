import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { TrainingResult } from "@/services/predictionService";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface TrainResultsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: TrainingResult | null;
}

const chartConfig = {
    svm: {
        label: "SVM",
        color: "#16a34a",
    },
    naiveBayes: {
        label: "Naïve Bayes",
        color: "#4ade80",
    },
    decisionTree: {
        label: "Decision Tree",
        color: "#bbf7d0"
    }
} satisfies ChartConfig;

const TrainResultDialog: React.FC<TrainResultsDialogProps> = ({ isOpen, onOpenChange, result }) => {

    // Prepare data for the chart
    const prepareChartData = () => {
        if (!result) {
            throw "No results generated";
        }
        const metrics = ['f1Score', 'accuracy', 'precision', 'recall'];
        return metrics.map(metric => {
        return {
            name: formatMetricName(metric),
            "SVM": result.models.svm[metric as keyof typeof result.models.svm],
            'Naive Bayes': result.models.naiveBayes[metric as keyof typeof result.models.naiveBayes],
            'Decision Tree': result.models.decisionTree[metric as keyof typeof result.models.decisionTree],
        };
        });
    };

    const formatModelName = (model: string): string => {
    switch (model) {
        case "svm":
            return "SVM Classifier";
        case "naiveBayes":
            return "Naïve Bayes Classifier";
        case "decisionTree":
            return "Decision Tree Classifier";
        default:
            return model;
        }
    };

    const formatPercentage = (value: number): string => {
        return `${(value * 100).toFixed(2)}%`;
    };

    // Format metric names for display
    const formatMetricName = (metric: string): string => {
        switch (metric) {
        case 'f1Score':
            return 'F1 Score';
        case 'accuracy':
            return 'Accuracy';
        case 'precision':
            return 'Precision';
        case 'recall':
            return 'Recall';
        default:
            return metric;
        }
    };


    if (result) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                {/* Results generated */}
                <DialogContent className="sm:max-w-[130vh] max-h-[90vh]">
                    
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Model Training Results</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[80vh]">    
                        {/* Best Model Card */}
                        <Card className="mb-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Best Model</CardTitle>
                                <CardDescription>Model with the highest F1 score</CardDescription>
                            </CardHeader>
                            
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{formatModelName(result.bestModel)}</h3>
                                        <p className="text-muted-foreground">F1 Score: {formatPercentage(result.models[result.bestModel].f1Score)}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/10">Recommended</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Models Comparison Chart */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Model Comparison</CardTitle>
                                <CardDescription>Performance metrics across all models</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full">
                                    <ChartContainer config={chartConfig}>
                                        <BarChart
                                            accessibilityLayer
                                            data={prepareChartData()}
                                            >
                                            <Legend />
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                            <YAxis domain={[0, 1]} tickLine={true} tickFormatter={(value) => `${(value * 100)}%`} />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />}/>
                                            {/* <Legend /> */}
                                            <Bar dataKey="SVM" fill="var(--color-svm)" radius={4} />
                                            <Bar dataKey="Naive Bayes" fill="var(--color-naiveBayes)" radius={4} />
                                            <Bar dataKey="Decision Tree" fill="var(--color-decisionTree)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detailed Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {Object.entries(result.models).map(([model, metrics]) => (
                                <Card key={model}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">{formatModelName(model)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="space-y-2 text-sm">
                                            {Object.entries(metrics).map(([metric, value]) => (
                                                <div key={metric} className="flex justify-between">
                                                    <dt className="text-muted-foreground">{formatMetricName(metric)}</dt>
                                                    <dd className="font-medium">{formatPercentage(value)}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        )
    }

    {/* No Results */}
    return (
        <Dialog>
            <DialogContent className="sm:max-w-[800px]" hidden={result != null}>
                <DialogHeader>
                    <DialogDescription>No Results Generated</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )

}

export default TrainResultDialog;
