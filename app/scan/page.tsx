"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Scan, Search } from 'lucide-react';

import { formatDate } from '@/app/lib/utils';
import { db } from '../lib/firebaseConfig';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";


function PrescriptionLookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeFromUrl = searchParams.get('code');
  
  const [prescriptionCode, setPrescriptionCode] = useState(codeFromUrl || '');
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (codeFromUrl) {
      lookupPrescription(codeFromUrl);
    }
  }, [codeFromUrl]);

  interface Prescription {
    prescriptionCode: string;
    date: string;
    doctorName: string;
    patient: {
      name: string;
    };
  }

  const lookupPrescription = async (code: string): Promise<void> => {
    if (!code.trim()) {
      setError('Please enter a prescription code');
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const prescriptionsRef = collection(db, 'prescriptions');
      const q = query(prescriptionsRef, where("prescriptionCode", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const prescriptionData = querySnapshot.docs[0].data() as Prescription;
        setPrescription(prescriptionData);
      } else {
        setError('No prescription found with this code');
        setPrescription(null);
      }
    } catch (err) {
      setError('Failed to fetch prescription. Please try again.');
      console.error("Lookup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    lookupPrescription(prescriptionCode);
  };

  const handleViewFull = () => {
    if (prescription?.prescriptionCode) {
      router.push(`/prescriptions/${prescription.prescriptionCode}`);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4 sm:py-12">
      <Card className="shadow-xl border border-zinc-200 overflow-hidden">
        <CardHeader className=" text-black">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">
              <Scan className="h-6 w-6 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Prescription Lookup</CardTitle>
              <CardDescription className="text-zinc-300 mt-1">
                Enter your prescription code to view details
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="prescription-code" className="text-sm font-medium text-zinc-700">
                Prescription Code
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    id="prescription-code"
                    type="text"
                    value={prescriptionCode}
                    onChange={(e) => setPrescriptionCode(e.target.value)}
                    placeholder="Enter prescription code"
                    className="pl-10 border-zinc-300 focus:ring-black focus:border-black"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!prescriptionCode.trim() || loading}
                  className="bg-black hover:bg-zinc-800 text-white min-w-[120px] transition-all"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Enter the unique code provided by your doctor or pharmacy
              </p>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6 bg-red-50 border-red-200 text-red-800">
              <AlertTitle className="font-semibold">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="mt-8 space-y-4">
              <Skeleton className="w-48 h-6" />
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="w-20 h-4 mb-2" />
                      <Skeleton className="w-32 h-6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {prescription && !loading && (
          <div className="border-t border-zinc-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Prescription Details</h2>
                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                  Valid
                </Badge>
              </div>
              
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Code</p>
                    <Badge variant="outline" className="mt-1 border-black text-black">
                      {prescription.prescriptionCode}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Date</p>
                    <p className="mt-1 font-medium">{formatDate(prescription.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Doctor</p>
                    <p className="mt-1 font-medium">{prescription.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Patient</p>
                    <p className="mt-1 font-medium">{prescription.patient.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 pt-0 flex justify-end">
              <Button 
                onClick={handleViewFull}
                className="bg-black hover:bg-zinc-800 text-white transition-all"
              >
                View Full Details
              </Button>
            </CardFooter>
          </div>
        )}
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4 sm:py-12">
      <Card className="shadow-xl border border-zinc-200 overflow-hidden">
        <CardHeader className="text-black">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PrescriptionLookup() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PrescriptionLookupContent />
    </Suspense>
  );
}