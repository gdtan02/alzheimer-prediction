/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form } from "../ui/form";

import { PredictionResult, PredictionService } from '@/services/predictionService';
import FileUploadSection from "../FileUploadSection";
import { Button } from "../ui/button";
import PredictionResultDialog from "../PredictionResultDialog";
import { toast } from "sonner";

const formSchema = z.object({
    datasetFile: z.string()
});

const DatasetUploadForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploaded, setIsUploaded] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
    const [predictionResult, setPredictionResult] = useState<PredictionResult[] | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

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

        try {
            // Validate CSV structure
            const isValid = await PredictionService.validateCsvFile(file, false);

            if (!isValid) {
                toast.error("Invalid CSV format. The file must contain all the required fields.");
                setIsGenerating(false);
                return;
            }

            const result = await PredictionService.predictFromCSV(file);

            console.log("results=", result)

            setPredictionResult(result);

            // Show success message
            toast.success("Predicted successfully. View the results in the table.");
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
            />
        </Card>        
    )
}
    

export default DatasetUploadForm;