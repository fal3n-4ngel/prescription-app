
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { PlusCircle, MinusCircle, FilePlus } from 'lucide-react';

import { generatePrescriptionCode } from '@/app/lib/utils';
import { 
    Patient, 
    Prescription,
    MEDICATION_OPTIONS, 
    MedicationOptionField
} from '@/app/lib/types';
import { auth, db } from '@/app/lib/firebaseConfig';
import { getCurrentUser } from '@/app/lib/auth';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


export default function NewPrescriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [patient, setPatient] = useState<Patient>({
    name: '',
    age: 0,
    gender: '',
    contactNumber: '',
  });
  
  const [medications, setMedications] = useState<MedicationOptionField[]>([
    { name: '', dosage: '', frequency: '', duration: '', notes: '' }
  ]);
  
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);
  
  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handlePatientSelectChange = (name: string, value: string) => {
    setPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleMedicationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [name]: value
    };
    setMedications(updatedMedications);
  };

  const handleMedicationSelectChange = (index: number, name: string, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [name]: value
    };
    setMedications(updatedMedications);
  };
  
  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  };
  
  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      const updatedMedications = [...medications];
      updatedMedications.splice(index, 1);
      setMedications(updatedMedications);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      // Generate a unique prescription code
      const prescriptionCode = generatePrescriptionCode();
      
      const prescriptionData: Prescription = {
        doctorId: currentUser.uid,
        doctorName: currentUser.displayName || 'Doctor',
        patient,
        medications: medications.filter(med => med.name !== ''),
        date: new Date().toISOString(),
        notes,
        prescriptionCode
      };
      
      // Add to Firestore
      const prescriptionsRef = collection(db, 'prescriptions');
      await addDoc(prescriptionsRef, prescriptionData);
      
      router.push(`/prescriptions/${prescriptionCode}`);
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Checking authentication...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 bg-zinc-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Prescription</h1>
          <p className="text-zinc-500">Complete the form below to create a new prescription</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter the patient&apos;s personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={patient.name}
                    onChange={handlePatientChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={patient.age || ''}
                    onChange={handlePatientChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    onValueChange={(value) => handlePatientSelectChange('gender', value)}
                    value={patient.gender}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={patient.contactNumber}
                    onChange={handlePatientChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>Prescribe medications for the patient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {medications.map((medication, index) => (
                <div key={index} className="p-4 border border-zinc-200 rounded-md bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeMedication(index)}
                      disabled={medications.length <= 1}
                    >
                      <MinusCircle className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`med-name-${index}`}>Medication</Label>
                      <Select 
                        onValueChange={(value) => handleMedicationSelectChange(index, 'name', value)}
                        value={medication.name}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                      <Input
                        id={`med-dosage-${index}`}
                        name="dosage"
                        placeholder="e.g., 500mg"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, e)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`med-frequency-${index}`}>Frequency</Label>
                      <Input
                        id={`med-frequency-${index}`}
                        name="frequency"
                        placeholder="e.g., 3 times daily"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, e)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`med-duration-${index}`}>Duration</Label>
                      <Input
                        id={`med-duration-${index}`}
                        name="duration"
                        placeholder="e.g., 7 days"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, e)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`med-notes-${index}`}>Special Instructions (optional)</Label>
                    <Textarea
                      id={`med-notes-${index}`}
                      name="notes"
                      placeholder="Any specific instructions for this medication"
                      value={medication.notes}
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addMedication}
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Medication
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Add any additional instructions or notes</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                placeholder="Any additional instructions or notes for the patient"
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Prescription'}
                {!isLoading && <FilePlus className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}