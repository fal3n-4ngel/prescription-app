"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { User } from "firebase/auth";
import {
  Clock,
  FileText,
  Users,
  PlusCircle,
  QrCode,
  Search,
  LogOut,
  User2Icon,
} from "lucide-react";

import { db, auth } from "@/app/lib/firebaseConfig";
import { getCurrentUser } from "@/app/lib/auth";
import { Prescription } from "@/app/lib/types";
import { formatDate } from "@/app/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState<
    Prescription[]
  >([]);
  const [patientCount, setPatientCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      await fetchDashboardData(currentUser.uid);
    };

    checkAuth();
  }, [router]);

  const fetchDashboardData = async (userId: string) => {
    setIsLoading(true);
    try {
      // Fetch recent prescriptions
      const prescriptionsRef = collection(db, "prescriptions");
      const prescriptionsQuery = query(
        prescriptionsRef,
        where("doctorId", "==", userId),
        orderBy("date", "desc"),
        limit(5)
      );

      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      const prescriptionsData = prescriptionsSnapshot.docs.map(
        (doc) => doc.data() as Prescription
      );
      setRecentPrescriptions(prescriptionsData);

      // Get unique patient count
      const uniquePatients = new Set();
      prescriptionsSnapshot.docs.forEach((doc) => {
        const data = doc.data() as Prescription;
        uniquePatients.add(data.patient.name);
      });

      setPatientCount(uniquePatients.size);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNewPrescription = () => {
    router.push("/prescriptions/new");
  };

  const handleScanQR = () => {
    router.push("/scan");
  };

  const handleViewPrescription = (code: string) => {
    router.push(`/prescriptions/${code}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1
                className="text-xl font-bold cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                MED E-KART
              </h1>
              <nav className="hidden md:flex items-center space-x-2"></nav>
            </div>

            <div className="flex items-center space-x-2">
              <User2Icon className="h-6 w-6 text-zinc-500" />
              <span className="hidden md:inline-block text-sm font-medium mr-2">
                {user?.displayName || "Doctor"}
              </span>
              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="md:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex-1">
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex-1">
                Patients
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="md:hidden mb-6">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search prescriptions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome, {user?.displayName || "Doctor"}
            </h2>
            <p className="text-zinc-500">
              Manage your prescriptions and patients
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleNewPrescription}>
              <PlusCircle className="mr-1.5 h-4 w-4" />
              New Prescription
            </Button>
            <Button variant="outline" onClick={handleScanQR}>
              <QrCode className="mr-1.5 h-4 w-4" />
              Scan QR Code
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Total Prescriptions</span>
                <FileText className="h-4 w-4 text-zinc-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {recentPrescriptions.length}
              </div>
              <p className="text-zinc-500 text-sm">Recent prescriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Patients</span>
                <Users className="h-4 w-4 text-zinc-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patientCount}</div>
              <p className="text-zinc-500 text-sm">Unique patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Last Activity</span>
                <Clock className="h-4 w-4 text-zinc-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {recentPrescriptions.length > 0
                  ? formatDate(recentPrescriptions[0].date)
                  : "No activity"}
              </div>
              <p className="text-zinc-500 text-sm">Last prescription created</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>
              Your most recently created prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPrescriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 px-2 font-medium">Date</th>
                      <th className="py-3 px-2 font-medium">Patient</th>
                      <th className="py-3 px-2 font-medium">
                        Prescription Code
                      </th>
                      <th className="py-3 px-2 font-medium">Medications</th>
                      <th className="py-3 px-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPrescriptions.map((prescription, index) => (
                      <tr key={index} className="border-b hover:bg-zinc-50">
                        <td className="py-3 px-2">
                          {formatDate(prescription.date)}
                        </td>
                        <td className="py-3 px-2">
                          {prescription.patient.name}
                        </td>
                        <td className="py-3 px-2">
                          {prescription.prescriptionCode}
                        </td>
                        <td className="py-3 px-2">
                          {prescription.medications.length} items
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black text-white hover:text-white hover:bg-zinc-800 transition-all p-2 px-4"
                            onClick={() =>
                              handleViewPrescription(
                                prescription.prescriptionCode
                              )
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500">
                No prescriptions found. Create your first prescription!
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6"></CardFooter>
        </Card>
      </div>
    </div>
  );
}
