/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { CloudUpload, Paperclip } from "lucide-react";
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "../ui/file-upload";
import ResultDialog from "../ResultDialog";
import { MOCK_RESULTS } from "@/services/predictionService";

const formSchema = z.object({
    filename: z.string()
});

const FileUploadForm = () => {

    const [files, setFiles] = useState<File[] | null>(null);
    const [isUploaded, setIsUploaded] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isResultGenerated, setIsResultGenerated] = useState<boolean>(false);
    const [isResultDialogOpen, setIsResultDialogOpen] = useState<boolean>(false);

    const dropZoneConfig = {
        accept: { "text/*": [".csv"] },
        maxFiles: 1,
        maxSize: 1024 * 1024 * 10,
        multiple: false
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        setIsGenerating(true)

        // To Be Implemented
        await new Promise( f => setTimeout(f, 2000));   // Placeholder

        setIsResultGenerated(true)
        setIsGenerating(false)
    }

    function displayResult() {
        setIsResultDialogOpen(true);
    }

    function fileUpload(files: File[] | null) {
        setFiles(files);
        setIsUploaded((files != null));
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
                            <FormField
                                control={form.control}
                                name="filename"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUploader
                                                value={files}
                                                onValueChange={fileUpload}
                                                dropzoneOptions={dropZoneConfig}
                                                className="relative bg-card rounded-lg p-2"
                                            >
                                                <FileInput
                                                    id="fileInput"
                                                    className="outline-dashed outline-1 outline-slate-500"
                                                    {...field}
                                                >
                                                    <div className="flex items-center justify-center flex-col p-8 w-full ">
                                                        <CloudUpload className='text-gray-500 w-10 h-10' format="csv" />
                                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="font-semibold">Click to upload</span>
                                                            &nbsp; or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Support up to 1 CSV file only.
                                                        </p>
                                                    </div>
                                                </FileInput>
                                                <FileUploaderContent>
                                                    {files &&
                                                        files.length > 0 &&
                                                        files.map((file, i) => (
                                                            <FileUploaderItem key={i} index={i}>
                                                                <Paperclip className="h-4 w-4 stroke-current" />
                                                                <span>{file.name}</span>
                                                            </FileUploaderItem>
                                                        ))}
                                                </FileUploaderContent>
                                            </FileUploader>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col gap-4 py-4">
                                <div className="flex justify-end gap-2">
                                    <Button 
                                    disabled={(isGenerating) || (!isUploaded)}
                                    type="submit"
                                    >
                                    {isGenerating ? "Generating..." : "Generate Prediction" }
                                    </Button>
                                    <Button 
                                    variant="secondary" type="button"
                                    disabled={(!isResultGenerated)}
                                    onClick={displayResult}
                                    >
                                        View Results
                                    </Button> 
                                </div>
                            </div>
                        </form>
                    </Form> 
                </CardContent>
            <ResultDialog isOpen={isResultDialogOpen} onOpenChange={setIsResultDialogOpen} result={MOCK_RESULTS}
            />
            </Card>

        
    )
}
    

export default FileUploadForm;