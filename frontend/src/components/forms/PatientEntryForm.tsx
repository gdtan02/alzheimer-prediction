import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { PatientData, PredictionResult, PredictionService } from "@/services/predictionService";
import { Badge } from "../ui/badge";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Current year
const currentYear = new Date().getFullYear();

// Form schemas
const formSchema = z.object({
    birthyr: z.coerce.number()
        .int("Birth year must be a whole number")
        .min(1900, "Birth year must be 1900 or later")
        .max(currentYear, `Birth year cannot be later than ${currentYear}`),
    
    sex: z.enum(["1", "2"], {
        errorMap: () => ({ message: "Please select the patient's sex." })
    }),

    educ: z.coerce.number()
        .int("Education years must be a whole number")
        .min(0, "Education years cannot be negative")
        .max(36, "Maximum education years is 36."),
    
    udsbentc: z.string().refine((val) => val !== "", { message: "Please select a value" }),

    mocatrai: z.string().refine((val) => val !== "", { message: "Please select a value" }),
    
    amndem: z.string().refine((val) => val !== "", { message: "Please select a value" }),
    
    naccppag: z.string().refine((val) => val !== "", { message: "Please select a value" }),

    amylpet: z.string().refine((val) => val !== "", { message: "Please select a value" }),

    dysill: z.enum(["0", "1"], {
        errorMap: () => ({ message: "Please select Yes or No. " })
    }),

    dysillif: z.string().refine((val) => val !== "", { message: "Please select a value" }),

});

type FormValues = z.infer<typeof formSchema>;


const PatientEntryForm = () => {

    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            birthyr: undefined,
            sex: undefined,
            educ: undefined,
            udsbentc: "",
            mocatrai: "",
            amndem: "",
            naccppag: "",
            amylpet: "",
            dysill: undefined,
            dysillif: "",
        },
    });

    async function onSubmit(values: FormValues) {

        setIsGenerating(true);

        try {
            // Transform form values into patient data
            const patientData: PatientData = {
                ...values
            };
            console.log("patient data=", patientData)

            // Call prediction service
            const result = await PredictionService.predictSinglePatient(patientData);
            setPredictionResult(result);

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
                <CardTitle>Patient Data Entry</CardTitle>
                <CardDescription>
                    Enter patient data manually for Alzheimer's prediction.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Birth year */}
                            <FormField
                                control={form.control}
                                name="birthyr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Birth Year</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 1950"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Patient's year of birth (1900-{currentYear})
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sex */}
                            <FormField
                                control={form.control}
                                name="sex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sex</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex-gap-6"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="1" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Male</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="2" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Female</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Education */}
                            <FormField
                                control={form.control}
                                name="educ"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Education (Years)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 16"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Years of formal education (0 - 36)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* UDSBENTC: Total score for copy of benson figure */}
                            <FormField
                                control={form.control}
                                name="udsbentc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Benson Figure Score</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a score" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 18 }, (_, i) => (
                                                    <SelectItem key={i} value={i.toString()}>
                                                        {i}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="95">95 - Physical problem</SelectItem>
                                                <SelectItem value="96">96 - Cognitive/behavior problem</SelectItem>
                                                <SelectItem value="97">97 - Other problem</SelectItem>
                                                <SelectItem value="98">98 - Verbal refusal</SelectItem>
                                                <SelectItem value="-4">Not available</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Total score for copy of Benson figure (0-17, or special codes)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* MOCATRAI: MoCA Visuospatial/executive — Trails */}
                            <FormField
                                control={form.control}
                                name="mocatrai"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MOCA Trails</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Yes</SelectItem>
                                                <SelectItem value="0">No</SelectItem>
                                                <SelectItem value="95">95 - Physical problem</SelectItem>
                                                <SelectItem value="96">96 - Cognitive/behavior problem</SelectItem>
                                                <SelectItem value="97">97 - Other problem</SelectItem>
                                                <SelectItem value="98">98 - Verbal refusal</SelectItem>
                                                <SelectItem value="-4">Not available</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                           MoCA: Visuospatial/executive — Trails
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* AMNDEM: Amnestic multidomain dementia syndrome */}
                            <FormField
                                control={form.control}
                                name="amndem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amnestic Multidomain Dementia</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Yes</SelectItem>
                                                <SelectItem value="0">No</SelectItem>
                                                <SelectItem value="8">8 - No diagnosis of dementia</SelectItem>
                                                <SelectItem value="-4">Not applicable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                           Amnestic multidomain dementia syndrome
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* NACCPPAG: Primary progressive aphasia (PPA) subtype */}
                            <FormField
                                control={form.control}
                                name="naccppag"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>PPA Subtype</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">1 - Meets criteria for semantic PPA</SelectItem>
                                                <SelectItem value="2">2 - Meets criteria for logopenic PPA</SelectItem>
                                                <SelectItem value="3">3 - Meets criteria for nonfluent/agrammatic PPA</SelectItem>
                                                <SelectItem value="4">4 - PPA other/not otherwise specified</SelectItem>
                                                <SelectItem value="7">7 - Impaired but no PPA syndrome</SelectItem>
                                                <SelectItem value="8">8 - No cognitive impairment</SelectItem>
                                                <SelectItem value="-4">Not applicable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                           Primary progressive aphasia (PPA) subtype
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* AMYLPET: Abnormally elevated amyloid on PET */}
                            <FormField
                                control={form.control}
                                name="amylpet"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Elevated Amyloid on PET</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Yes</SelectItem>
                                                <SelectItem value="0">No</SelectItem>
                                                <SelectItem value="8">8 - Unknown or not assessed</SelectItem>
                                                <SelectItem value="-4">Not applicable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                           Abnormally elevated amyloid on PET scan
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* DYSILL: Cognitive impairment due to systemic disease/medical illness */}
                            <FormField
                                control={form.control}
                                name="dysill"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Systemic Disease Impairment</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex gap-6"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="1" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="0" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormDescription>
                                            Cognitive impairment due to systemic disease/medical illness
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            {/* DYSILLIF: Primary, contributing, or non-contributing cause */}
                            <FormField
                                control={form.control}
                                name="dysillif"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amnestic Multidomain Dementia</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">1 - Primary</SelectItem>
                                                <SelectItem value="2">2 - Contributing</SelectItem>
                                                <SelectItem value="3">3 - Non-contributing</SelectItem>
                                                <SelectItem value="7">7 - Cognitively impaired but no diagnosis of impairment due to systemic disease</SelectItem>
                                                <SelectItem value="8">8 - Diagnosis of normal cognition</SelectItem>
                                                <SelectItem value="-4">Not applicable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                           Cause classification for systemic disease/medical illness
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />  
                        </div>

                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex justify-end gap-2">
                                <Button
                                    disabled={isGenerating}
                                    type="submit"
                                        > {isGenerating ? "Submitting...": "Submit"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>

            {predictionResult && (
                <CardContent className="pt-0">
                <Card className={`border-l-4 mt-6 ${getResultCardColor(predictionResult.NACCUDSD)}`}>
                    <CardContent className="py-4">
                    <div className="flex items-start gap-4 ">
                        <div className={`rounded-full p-1 ${getResultIconColor(predictionResult.NACCUDSD)}`}>
                        <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-1">
                        <h4 className="text-xl font-medium">Prediction Result</h4>
                        <div className="flex items-center pt-2 gap-2">
                            {/* <span className="text-xl font-bold">{(predictionResult.NACCUDSD === 1) ? "Normal" : "Abnormal"}</span> */}
                            <Badge variant="outline" className={getResultBadgeColor(predictionResult.NACCUDSD)}>
                            {getAlzheimerClassLabel(predictionResult.NACCUDSD)}
                            </Badge>
                        </div>
                        {/* <p className="text-sm text-muted-foreground">
                            Confidence: {(predictionResult.probability * 100).toFixed(1)}%
                        </p> */}
                        <p className="text-sm pt-2">{getClassDescription(predictionResult.NACCUDSD)}</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                </CardContent>
            )}
        </Card>

        
    );
};

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

// Helper functions for styling and labeling based on prediction class
function getResultCardColor(classNum: number): string {
  switch (classNum) {
    case 1: return "border-green-500";
    case 2: return "border-blue-500";
    case 3: return "border-orange-500";
    case 4: return "border-red-500";
    default: return "border-gray-500";
  }
}

function getResultIconColor(classNum: number): string {
  switch (classNum) {
    case 1: return "bg-green-500";
    case 2: return "bg-blue-500";
    case 3: return "bg-orange-500";
    case 4: return "bg-red-500";
    default: return "bg-gray-500";
  }
}

function getResultBadgeColor(classNum: number): string {
  switch (classNum) {
    case 1: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 font-bold text-xl";
    case 2: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 font-bold text-xl";
    case 3: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 font-bold text-xl";
    case 4: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 font-bold text-xl";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 font-bold text-xl";
  }
}

function getClassDescription(classNum: number): string {
  switch (classNum) {
    case 1:
      return "No significant cognitive decline. The patient shows normal cognition for their age.";
    case 2:
      return "Noticeable decline in cognitive abilities, but not significantly affecting daily life activities.";
    case 3:
      return "Cognitive decline that affects daily activities. May require some assistance with complex tasks.";
    case 4:
      return "Significant cognitive decline requiring substantial assistance with daily activities.";
    default:
      return "";
  }
}

export default PatientEntryForm;