import FileUploadForm from "@/components/forms/FileUploadForm";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
    return (
        <>
            <NavBar />
            <main className="flex-1 p-6 pt-24">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* <h1 className="text-3xl font-bold">Dashboard</h1> */}
                    
                    <Tabs defaultValue="csv-upload" className="w-full">
                        <TabsList>
                            <TabsTrigger value="csv-upload">Dataset Upload</TabsTrigger>
                            <TabsTrigger value="manual-input">Manual Input</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="csv-upload" className="mt-6">
                            <FileUploadForm />
                        </TabsContent>
                        
                        <TabsContent value="manual-input" className="mt-6">
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
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </>
    )
};

export default DashboardPage;
