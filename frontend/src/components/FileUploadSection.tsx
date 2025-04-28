/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { CloudUpload, Paperclip } from "lucide-react";
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "./ui/file-upload";

interface FileUploadSectionProps {
    onFileUpload: (files: File[] | null) => void;
    control: Control<any>;
    name: string;
    acceptedFileTypes?: Record<string, string[]>;
    maxFileSize?: number;
    multiple?: boolean;
    maxFiles?: number;
}

const FileUploadSection = ({
    onFileUpload,
    control,
    name,
    acceptedFileTypes = { "text/*": [".csv"] },
    maxFileSize = 1024 * 1024 * 10,
    multiple = false,
    maxFiles = 1
}: FileUploadSectionProps) => {

    const [files, setFiles] = useState<File[] | null>(null);

    const dropZoneConfig = {
        accept: acceptedFileTypes,
        maxFiles: maxFiles,
        maxSize: maxFileSize,
        multiple: multiple
    };

    function handleFileUpload(files: File[] | null) {
        setFiles(files);
        onFileUpload(files);
    }


    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <FileUploader
                            value={files}
                            onValueChange={handleFileUpload}
                            dropzoneOptions={dropZoneConfig} className="relative bg-card rounded-lg p-2"
                        >
                            <FileInput
                                id={`fileInput-${name}`}
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
                                        Support up to {maxFiles} CSV {maxFiles > 1 ? 'files' : 'file'} only.
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
    );
};
    

export default FileUploadSection;