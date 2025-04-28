/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form } from "../ui/form";

import { PredictionResult } from '@/services/predictionService';
import TrainResultDialog from "../TrainResultDialog";
import FileUploadSection from "../FileUploadSection";
import { Button } from "../ui/button";

const formSchema = z.object({
    datasetFile: z.string()
});

const DatasetUploadForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploaded, setIsUploaded] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
    const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    function handleFileUpload(files: File[] | null) {
        if (files && files.length > 0) {
            setFile(files[0]);
            setIsUploaded(true);
        } else {
            setFile(null);
            setIsUploaded(false);
        }
    }

    async function onSubmit() {
        if (!file) return;

        setIsGenerating(true);

        // To Be Implemented
        await new Promise( f => setTimeout(f, 2000));   // Placeholder

        setIsGenerating(false)
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
                result={predictionResult}
            />
        </Card>        
    )
}
    

export default DatasetUploadForm;