import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const PatientEntryForm = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Patient Data Entry</CardTitle>
                <CardDescription>
                    Enter patient data manually for Alzheimer's prediction.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    {/* Patient data form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Patient Name</label>
                            <Input
                                type="text"
                                placeholder="Enter patient name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Patient Age</label>
                            <Input
                                type="number"
                                placeholder="Enter patient age"
                            />
                        </div>
                    </div>
                    
                    
                    <div className="flex justify-end gap-2">
                        <Button
                            disabled={true}
                        >
                            Generate Prediction
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={true}
                        >
                            View Results
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PatientEntryForm;