import DatasetUploadForm from "@/components/forms/DatasetUploadForm";
import ModelTrainingForm from "@/components/forms/ModelTrainingForm";
import PatientEntryForm from "@/components/forms/PatientEntryForm";
import NavBar from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/stores/authStore";

const DashboardPage = () => {

    const { isAdmin } = useAuth()
    return (
        <>
            <NavBar />
            <main className="flex-1 p-6 pt-24">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* <h1 className="text-3xl font-bold">Dashboard</h1> */}
                    
                    <Tabs defaultValue={isAdmin ? "model-training" : "csv-upload"} className="w-full">
                        <TabsList>
                            <TabsTrigger hidden={!isAdmin} value="model-training">Model Training</TabsTrigger>
                            <TabsTrigger value="csv-upload">Dataset Upload</TabsTrigger>
                            <TabsTrigger value="manual-input">Manual Input</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="model-training" className="mt-6">
                            <ModelTrainingForm />
                        </TabsContent>
                        <TabsContent value="csv-upload" className="mt-6">
                            <DatasetUploadForm />
                        </TabsContent>
                        <TabsContent value="manual-input" className="mt-6">
                            <PatientEntryForm />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </>
    )
};

export default DashboardPage;
