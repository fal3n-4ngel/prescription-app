
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function generatePrescriptionCode(): string {
  return nanoid(8);
}


export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}


export function generateQRCodeData(prescriptionCode: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/scan?code=` 
    : 'localhost:3000/scan?code=';
  
  return baseUrl + prescriptionCode;
}