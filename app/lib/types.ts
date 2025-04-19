
export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }
  
  export interface Patient {
    name: string;
    age: number;
    gender: string;
    contactNumber?: string;
  }
  
  export interface Prescription {
    id?: string;
    doctorId: string;
    doctorName: string;
    patient: Patient;
    medications: Medication[];
    date: string;
    notes?: string;
    prescriptionCode: string;
  }
  
  export type MedicationOption = {
    value: string;
    label: string;
  };

  export type MedicationOptionField = {
    name:string;
    dosage: string; 
    frequency: string;
    duration: string;
    notes:string;
  };

  
  export const MEDICATION_OPTIONS: MedicationOption[] = [
    { value: 'Aspirin', label: 'Aspirin' },
    { value: 'Paracetamol', label: 'Paracetamol' },
    { value: 'Naproxen', label: 'Naproxen' },
    { value: 'Metoprolol', label: 'Metoprolol' },
    { value: 'Dolo', label: 'Dolo' },
  ];