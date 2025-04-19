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
//       dosage: med.dosage,
//       frequency: med.frequency,
//       duration: med.duration
//     })),
//     date: prescription.date,
//     notes: prescription.notes
//   };

//   return JSON.stringify(qrData);
// }

export function generateQRCodeData(prescription: Prescription): string {
  const medicationFirstLetters = prescription.medications.map((med) =>
    med.name.charAt(0).toUpperCase()
  );

  const letterCounts: Record<string, number> = {};
  medicationFirstLetters.forEach((letter) => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  });

  const qrString = Object.entries(letterCounts)
    .map(([letter, count]) => `${letter}:${count}`)
    .join(",");

  return qrString;
}
