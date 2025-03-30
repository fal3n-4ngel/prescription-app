// app/prescriptions/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Printer, User, Pill, FileText, Share2, ArrowLeft } from "lucide-react";

import { Prescription } from "@/app/lib/types";
import { formatDate, generateQRCodeData } from "@/app/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { db } from "@/app/lib/firebaseConfig";
import { getCurrentUser } from "@/app/lib/auth";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    async function fetchPrescription() {
      if (isCheckingAuth) return;

      try {
        const prescriptionsRef = collection(db, "prescriptions");
        const q = query(prescriptionsRef, where("prescriptionCode", "==", id));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first matching document
          const prescriptionData = querySnapshot.docs[0].data() as Prescription;
          setPrescription(prescriptionData);
        } else {
          setError("Prescription not found");
        }
      } catch (err) {
        setError("Error fetching prescription");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrescription();
  }, [id, isCheckingAuth]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (isCheckingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="animate-pulse">Loading prescription...</div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Prescription not found"}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-zinc-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="print:hidden"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="print:hidden">
            <Button variant="default" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Prescription</CardTitle>
                <p className="text-sm text-zinc-500">
                  Created on {formatDate(prescription.date)}
                </p>
              </div>
              <Badge variant="outline" className="text-md font-mono">
                {prescription.prescriptionCode}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Patient Information
                  </h3>
                  <div className="bg-zinc-50 px-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-zinc-500">Name</p>
                        <p className="font-medium">
                          {prescription.patient.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Age</p>
                        <p className="font-medium">
                          {prescription.patient.age}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Gender</p>
                        <p className="font-medium capitalize">
                          {prescription.patient.gender}
                        </p>
                      </div>
                      {prescription.patient.contactNumber && (
                        <div>
                          <p className="text-sm text-zinc-500">Contact</p>
                          <p className="font-medium">
                            {prescription.patient.contactNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Pill className="mr-2 h-4 w-4" />
                    Medications
                  </h3>
                  <div className="space-y-4">
                    {prescription.medications.map((medication, index) => (
                      <div
                        key={index}
                        className="border border-zinc-200 rounded-md bg-white p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{medication.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-zinc-500">Dosage</p>
                            <p>{medication.dosage}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Frequency</p>
                            <p>{medication.frequency}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Duration</p>
                            <p>{medication.duration}</p>
                          </div>
                          {medication.notes && (
                            <div className="md:col-span-3">
                              <p className="text-zinc-500">Notes</p>
                              <p>{medication.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Additional Notes
                </h3>
                <div className="bg-zinc-50 p-4 rounded-md">
                  <p>{prescription.notes || "No additional notes"}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Share2 className="mr-2 h-4 w-4" />
                Share Prescription
              </h3>
              <div className="bg-zinc-50 p-4 rounded-md">
                <QRCodeSVG value={generateQRCodeData(prescription)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
