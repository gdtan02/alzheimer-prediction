/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form } from "../ui/form";

import { MOCK_RESULTS, TrainingResult } from "@/services/predictionService";
import TrainResultDialog from "../TrainResultDialog";
import FileUploadSection from "../FileUploadSection";
import { Button } from "../ui/button";

const formSchema = z.object({
    trainingFile: z.string()
});

const ModelTrainingForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploaded, setIsUploaded] = useState<boolean>(false);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);
    const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);

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

        setIsTraining(true);

        // To Be Implemented
        await new Promise(f => setTimeout(f, 2000));   // Placeholder

        setIsTraining(false)
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
                result={MOCK_RESULTS}
            />
        </Card>
    );
};
    

export default ModelTrainingForm;