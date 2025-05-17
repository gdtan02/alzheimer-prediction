import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form } from "../ui/form";

import { PredictionResult, PredictionService } from '@/services/predictionService';
import FileUploadSection from "../common/FileUploadSection";
import { Button } from "../ui/button";
import PredictionResultDialog from "../results/PredictionResultDialog";
import { toast } from "sonner";
import { VisualizationResult } from "@/types/visualization";
import { VisualizationService } from "@/services/visualizationService";

const formSchema = z.object({
    datasetFile: z.string()
});

const DatasetUploadForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploaded, setIsUploaded] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
    const [predictionResult, setPredictionResult] = useState<PredictionResult[] | null>(null);
    const [visualizations, setVisualizations] = useState<VisualizationResult[] | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    // Cleaning up visualization Object URLs
    useEffect(() => {
        const currentVisualizations = visualizations;
        return () => {
            if (currentVisualizations) {
                VisualizationService.cleanupVisualizationUrls(currentVisualizations);
            }
        };
    }, [visualizations]);

    function handleFileUpload(files: File[] | null) {

        setValidationError(null);

        if (files && files.length > 0) {
            setFile(files[0]);
            setIsUploaded(true);

            // Validate file format
            const fileExt = files[0].name.split('.').pop()?.toLowerCase();
            if (fileExt !== 'csv') {
                setValidationError("Please upload a CSV file.");
                return;
            }

            // Validate file size
            if (files[0].size > 10 * 1024 * 1024) {
                setValidationError("File size exceeds 10MB limit");
                return;
            }
        } else {
            setFile(null);
            setIsUploaded(false);
        }
    }

    async function onSubmit() {
        if (!file) return;

        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsGenerating(true);

        // Cleanup previous prediction results and visualizations
        setPredictionResult(null);
        setVisualizations(null);

        try {
            // Validate CSV structure
            const isValid = await PredictionService.validateCsvFile(file, false);

            if (!isValid) {
                toast.error("Invalid CSV format. The file must contain all the required fields.");
                setIsGenerating(false);
                return;
            }

            const [predictionOutcome, visualizationOutcome] = await Promise.allSettled([
                PredictionService.predictFromCSV(file),
                VisualizationService.generateAllVisualizations(file)
            ]);

            // Process prediction results
            if (predictionOutcome.status === 'fulfilled') {
                setPredictionResult(predictionOutcome.value);
                
            } else {
                console.error("Prediction generation error: ", predictionOutcome.reason);
                throw Error("Failed to generate prediction results.")
            }

            // Process visualization results
            if (visualizationOutcome.status === 'fulfilled') {
                setVisualizations(visualizationOutcome.value);
                
            } else {
                console.error("Visualization generation error: ", visualizationOutcome.reason);
                throw Error("Visualizations generation process failed");
            }

            toast.success("Predictions are completed.", { description: "Click 'View Results' to view the prediction and visualization results."})
        

        } catch (error) {
            console.log("Prediction error: ", error);
            toast.error("Failed to make predictions", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Dataset</CardTitle>
                <CardDescription>
                    Upload a dataset file (in CSV format) containing patient data for Alzheimer's prediction. The maximum file size is 10 MB.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-screen mx-auto">
                        <FileUploadSection
                            onFileUpload={handleFileUpload}
                            control={form.control}
                            name="datasetFile"
                        />

                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex justify-end gap-2">
                                <Button
                                    disabled={isGenerating || !isUploaded}
                                    type="submit"
                                        > {isGenerating ? "Generating...": "Generate Prediction"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={!predictionResult}
                                    onClick={() => setIsResultDialogOpen(true)}
                                >
                                    View Prediction Results
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form> 
            </CardContent>
            <PredictionResultDialog
                isOpen={isResultDialogOpen}
                onOpenChange={setIsResultDialogOpen}
                results={predictionResult}
                visualizations={visualizations}
            />
        </Card>        
    )
}
    

export default DatasetUploadForm;