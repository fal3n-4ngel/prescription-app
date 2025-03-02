"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';


import { generatePrescriptionCode } from '@/app/lib/utils';
import { 
    Patient, 
    Prescription,
    MEDICATION_OPTIONS, 
    MedicationOptionField
  } from '@/app/lib/types';
import { auth, db } from '@/app/lib/firebaseConfig';

export default function PrescriptionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [patient, setPatient] = useState<Patient>({
    name: '',
    age: 0,
    gender: '',
    contactNumber: '',
  });
  
  const [medications, setMedications] = useState<MedicationOptionField []>([
    { name: '', dosage: '', frequency: '', duration: '', notes: '' }
  ]);
  
  const [notes, setNotes] = useState('');
  
  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };
  
  const handleMedicationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      
      // Add to Firestore with the code as the document ID
      const prescriptionsRef = collection(db, 'prescriptions');
      await addDoc(prescriptionsRef, {
        ...prescriptionData,
        id: prescriptionCode
      });
      
      router.push(`/prescriptions/${prescriptionCode}`);
    } catch (error) {
      console.error('Error saving prescription:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              value={patient.name}
              onChange={handlePatientChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              value={patient.age || ''}
              onChange={handlePatientChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={patient.gender}
              onChange={handlePatientChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              id="contactNumber"
              name="contactNumber"
              value={patient.contactNumber}
              onChange={handlePatientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Medications</h3>
        
        {medications.map((medication, index) => (
          <div key={index} className="p-4 border rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
              <div>
                <label htmlFor={`med-name-${index}`} className="block text-sm font-medium text-gray-700">
                  Medication
                </label>
                <select
                  id={`med-name-${index}`}
                  name="name"
                  value={medication.name}
                  onChange={(e) => handleMedicationChange(index, e)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Medication</option>
                  {MEDICATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor={`med-dosage-${index}`} className="block text-sm font-medium text-gray-700">
                  Dosage
                </label>
                <input
                  id={`med-dosage-${index}`}
                  name="dosage"
                  placeholder="e.g., 500mg"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, e)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor={`med-frequency-${index}`} className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <input
                  id={`med-frequency-${index}`}
                  name="frequency"
                  placeholder="e.g., 3 times daily"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, e)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor={`med-duration-${index}`} className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  id={`med-duration-${index}`}
                  name="duration"
                  placeholder="e.g., 7 days"
                  value={medication.duration}
                  onChange={(e) => handleMedicationChange(index, e)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mb-2">
              <label htmlFor={`med-notes-${index}`} className="block text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <input
                id={`med-notes-${index}`}
                name="notes"
                placeholder="Special instructions"
                value={medication.notes}
                onChange={(e) => handleMedicationChange(index, e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => removeMedication(index)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={medications.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={addMedication}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Medication
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Additional Notes</h3>
        <textarea
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Any additional instructions or notes"
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          type="submit" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Prescription'}
        </button>
      </div>
    </form>
  );
}