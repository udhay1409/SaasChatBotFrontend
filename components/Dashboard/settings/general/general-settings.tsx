"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  isActive: boolean;
  isVerified: boolean;
  subscription: string;
  chatbotsLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  subscription: string;
  chatbotsLimit: number;
  createdAt: string;
  updatedAt: string;
}

export const GeneralSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user from localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const currentUser = JSON.parse(userData);
        console.log("Current user data:", currentUser);
        setUser(currentUser);

        // Method 1: If user has organizationId, fetch organization details
        if (currentUser.organizationId) {
          console.log("Fetching organization data for ID:", currentUser.organizationId);
          try {
            const orgResponse = await axiosInstance.get(
              `/api/dashboard/admin/organization/getorganizationbyid/${currentUser.organizationId}`
            );

            console.log("Organization API response:", orgResponse.data);
            if (orgResponse.data.success) {
              setOrganization(orgResponse.data.data);
            }
          } catch (error) {
            console.error("Error fetching organization by ID:", error);
          }
        } 
        // Method 2: If no organizationId, try to find organization by email match
        else {
          console.log("No organizationId found, trying to find organization by email match");
          try {
            // Get all organizations and find one that matches user's email
            const allOrgsResponse = await axiosInstance.get(
              `/api/dashboard/admin/organization/getorganization`
            );

            console.log("All organizations response:", allOrgsResponse.data);
            
            if (allOrgsResponse.data.success && allOrgsResponse.data.data) {
              // Find organization where email matches current user's email
              const matchingOrg = allOrgsResponse.data.data.find(
                (org: Organization) => org.email.toLowerCase() === currentUser.email.toLowerCase()
              );

              if (matchingOrg) {
                console.log("Found matching organization:", matchingOrg);
                setOrganization(matchingOrg);
              } else {
                console.log("No organization found with matching email");
              }
            }
          } catch (error) {
            console.error("Error fetching organizations:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user information");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
   

      {/* Organization Information */}
      {organization ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization ID</Label>
                <Input value={organization.organizationId || ""} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input value={organization.name || ""} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={organization.contactPerson || ""} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Organization Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input value={organization.email || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input value={organization.phone || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Badge
                  variant={organization.isActive ? "default" : "destructive"}
                >
                  {organization.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Address</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={organization.address || ""}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Organization Subscription</Label>
                <Badge variant="secondary" className="capitalize">
                  {organization.subscription || "Free"}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Chatbots Limit</Label>
                <div className="text-sm font-medium">
                  {organization.chatbotsLimit || 1} chatbot(s)
                </div>
              </div>

              <div className="space-y-2">
                <Label>Created Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {organization.createdAt ? formatDate(organization.createdAt) : "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {organization.updatedAt ? formatDate(organization.updatedAt) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : user && !user.organizationId ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Organization information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No Organization</h3>
                <p className="text-muted-foreground">
                  You are not currently associated with any organization. You are using an individual account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
