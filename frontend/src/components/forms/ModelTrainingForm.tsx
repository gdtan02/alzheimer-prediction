/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form } from "../ui/form";

import { PredictionService, TrainingResult } from "@/services/predictionService";
import TrainResultDialog from "../TrainResultDialog";
import FileUploadSection from "../FileUploadSection";
import { Button } from "../ui/button";
import { toast } from "sonner";

const formSchema = z.object({
    trainingFile: z.string()
});



const ModelTrainingForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploaded, setIsUploaded] = useState<boolean>(false);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
    const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

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

        setIsTraining(true);

        try {
            // Validate CSV structure
            const isValid = await PredictionService.validateCsvFile(file);

            if (!isValid) {
                toast.error("Invalid CSV format. The file must contain all the required fields.");  
                setIsTraining(false);
                return;
            }

            const result = await PredictionService.trainModel(file);

            console.log("results=", result)
            console.log("best model=", result.bestModel)

            setTrainingResult(result);

            // Show success message
            toast.success("Model trained successfully. Best model has been saved.", {
                description: `Best model: ${formatModelName(result.bestModel)}`
            });
        } catch (error) {
            console.log("Training error: ", error);
            toast.error("Failed to train models", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setIsTraining(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Model Training</CardTitle>
                <CardDescription>
                    Upload a training dataset (in CSV format) to train the Alzheimer's prediction models. The file should contain labeled data with patient information and diagnosis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-screen mx-auto">
                        <FileUploadSection
                            onFileUpload={handleFileUpload}
                            control={form.control}
                            name="trainingFile"
                        />

                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex justify-end gap-2">
                                <Button
                                    disabled={isTraining || !isUploaded}
                                    type="submit"
                                >
                                    {isTraining ? "Training Models..." : "Train Models"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={!trainingResult}
                                    onClick={() => setIsResultDialogOpen(true)}
                                >
                                    View Training Results
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
            <TrainResultDialog
                isOpen={isResultDialogOpen}
                onOpenChange={setIsResultDialogOpen}
                result={trainingResult}
            />
        </Card>
    );
};
    

export default ModelTrainingForm;