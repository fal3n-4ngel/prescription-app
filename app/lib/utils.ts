import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import { Prescription } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePrescriptionCode(): string {
  return nanoid(8);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

// OLD generateQRCodeData function  IN CASE YOU NEED A JSON STRING FOR QR CODE
// DO NOT DELETE ,JUST KEEP IT COMMENTED

// export function generateQRCodeData(prescription: Prescription): string {
//   const qrData = {
//     code: prescription.prescriptionCode,
//     patient: {
//       name: prescription.patient.name,
//       age: prescription.patient.age,
//       gender: prescription.patient.gender
//     },
//     doctor: prescription.doctorName,
//     medications: prescription.medications.map(med => ({
//       name: med.name,
//       Count: med.Count,
//       frequency: med.frequency,
//       duration: med.duration
//     })),
//     date: prescription.date,
//     notes: prescription.notes
//   };

//   return JSON.stringify(qrData);
// }

// export function generateQRCodeData(prescription: Prescription): string {
//   const medicationCounts: Record<string, number> = {};

//   prescription.medications.forEach((med) => {
//     const firstLetter = med.name.charAt(0).toUpperCase();
//     const Count = Number(med.frequency) * Number(med.duration);

//     if (!isNaN(Count)) {
//       medicationCounts[firstLetter] =
//         (medicationCounts[firstLetter] || 0) + Count;
//     }
//   });

//   const qrString = Object.entries(medicationCounts)
//     .map(([letter, Count]) => `${letter}:${Count}`)
//     .join(",");


//   return qrString;
// }


export function generateQRCodeData(prescription: Prescription): string {

  const medicationCounts: Record<string, number> = {};
  prescription.medications.forEach((med) => {
    const firstLetter = med.name.charAt(0).toUpperCase();
    const count = Number(med.frequency) * Number(med.duration);
    if (!isNaN(count)) {
      medicationCounts[firstLetter] = (medicationCounts[firstLetter] || 0) + count;
    }
  });

  const letterOrder = ['A', 'P', 'N', 'M', 'D'];
  
  const qrParts = letterOrder.map(letter => {
    const value = medicationCounts[letter] !== undefined ? medicationCounts[letter] : 0;
    return `${letter}:${value}`;
  });
  
  return qrParts.join(',');
}
