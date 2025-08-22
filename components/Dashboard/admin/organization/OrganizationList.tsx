"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AddOrganization } from './Addorganization';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

// Type guard for axios error responses
const isAxiosError = (error: unknown): error is { 
  response?: { 
    data?: { 
      message?: string; 
    } 
  } 
} => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

interface Organization {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export function OrganizationList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]); // Store all data for client-side filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch all organizations from API (without pagination for client-side filtering)
  const fetchAllOrganizations = useCallback(async () => {
    try {
      setLoading(true); 
      setError(null);
      
      // Fetch all organizations without pagination
      const response = await axiosInstance.get('/api/dashboard/admin/organization/getorganization?limit=1000');
      
      if (response.data.success) {
        setAllOrganizations(response.data.data);
      }
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err) 
        ? err.response?.data?.message || 'Failed to fetch organizations'
        : 'Failed to fetch organizations';
      setError(errorMessage);
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Client-side filtering and pagination
  const getFilteredOrganizations = useCallback(() => {
    let filtered = [...allOrganizations];

    // Apply search filter across multiple fields
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(org => 
        org.organizationId.toLowerCase().includes(searchLower) ||
        org.name.toLowerCase().includes(searchLower) ||
        org.contactPerson.toLowerCase().includes(searchLower) ||
        org.email.toLowerCase().includes(searchLower) ||
        org.phone.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(org => org.isActive === isActive);
    }

    // Calculate pagination
    const totalFiltered = filtered.length;
    const totalPagesCalculated = Math.ceil(totalFiltered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    // Update state
    setOrganizations(paginatedData);
    setTotalPages(totalPagesCalculated);
    setTotalCount(totalFiltered);
  }, [allOrganizations, searchTerm, statusFilter, currentPage, itemsPerPage]);

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Initial data load
  useEffect(() => {
    fetchAllOrganizations();
  }, [fetchAllOrganizations]);

  // Apply filtering and pagination when data or filters change
  useEffect(() => {
    if (allOrganizations.length > 0) {
      const timeoutId = setTimeout(() => {
        getFilteredOrganizations();
      }, searchTerm ? 300 : 0); // 300ms debounce for search, immediate for other changes

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, statusFilter, currentPage, itemsPerPage, getFilteredOrganizations, allOrganizations]);

  const handleAddOrganization = async (newOrg: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      const response = await axiosInstance.post('/api/dashboard/admin/organization/postorganization', newOrg);
      if (response.data.success) {
        // Refresh all data to include the new organization
        await fetchAllOrganizations();
        setIsModalOpen(false);
        toast.success('Organization created successfully!', {
          description: `${newOrg.name} has been added and verification email sent to ${newOrg.email}`,
        });
      }
    } catch (err: unknown) {
      console.error('Error adding organization:', err);
      const errorMessage = isAxiosError(err) 
        ? err.response?.data?.message || 'An error occurred while creating the organization'
        : 'An error occurred while creating the organization';
      
      toast.error('Failed to add organization', {
        description: errorMessage,
      });
    }
  };

  const handleToggleOrganizationStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'disable' : 'enable';
    const organization = organizations.find(org => org.id === id);
    
    // Show confirmation toast
    toast(`${action.charAt(0).toUpperCase() + action.slice(1)} Organization`, {
      description: `Are you sure you want to ${action} "${organization?.name}"?`,
      action: {
        label: action.charAt(0).toUpperCase() + action.slice(1),
        onClick: async () => {
          try {
            const response = await axiosInstance.put(`/api/dashboard/admin/organization/putorganization/${id}`, {
              isActive: !currentStatus
            });
            if (response.data.success) {
              // Update both allOrganizations and organizations state
              setAllOrganizations(prev => 
                prev.map(org => 
                  org.id === id ? { ...org, isActive: !currentStatus } : org
                )
              );
              toast.success(`Organization ${action}d successfully!`, {
                description: `${organization?.name} has been ${action}d`,
              });
            }
          } catch (err: unknown) {
            console.error('Error updating organization status:', err);
            const errorMessage = isAxiosError(err) 
              ? err.response?.data?.message || `An error occurred while ${action}ing the organization`
              : `An error occurred while ${action}ing the organization`;
            
            toast.error(`Failed to ${action} organization`, {
              description: errorMessage,
            });
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          toast.dismiss();
        },
      },
    });
  };

  const handleEditOrganization = (organization: Organization) => {
    // Set the organization data for editing
    setEditingOrganization(organization);
    setIsModalOpen(true);
  };

  const handleUpdateOrganization = async (id: string, updatedData: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      const response = await axiosInstance.put(`/api/dashboard/admin/organization/putorganization/${id}`, updatedData);
      if (response.data.success) {
        // Update both allOrganizations state
        setAllOrganizations(prev => 
          prev.map(org => 
            org.id === id ? { ...org, ...updatedData } : org
          )
        );
        setIsModalOpen(false);
        setEditingOrganization(null);
        toast.success('Organization updated successfully!', {
          description: `${updatedData.name} has been updated`,
        });
      }
    } catch (err: unknown) {
      console.error('Error updating organization:', err);
      const errorMessage = isAxiosError(err) 
        ? err.response?.data?.message || 'An error occurred while updating the organization'
        : 'An error occurred while updating the organization';
      
      toast.error('Failed to update organization', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Add Organization
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by ID, name, contact, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Items per page */}
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              {loading ? (
                "Loading..."
              ) : (
                `Showing ${organizations.length} of ${totalCount} organizations`
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization ID</TableHead>
                <TableHead>Organization Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow key="loading">
                  <TableCell colSpan={9} className="text-center py-8">
                    Loading organizations...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow key="error">
                  <TableCell colSpan={9} className="text-center py-8 text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow key="empty">
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">No organizations found</div>
                    <Button
                      variant="link"
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4"
                    >
                      Add your first organization
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-mono text-sm">{org.organizationId}</TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.contactPerson}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{org.phone}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={org.address}>
                        {org.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        org.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditOrganization(org)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={org.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                          onClick={() => handleToggleOrganizationStatus(org.id, org.isActive)}
                        >
                          {org.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls - Only render when there are multiple pages */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AddOrganization
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrganization(null);
        }}
        onSubmit={handleAddOrganization}
        editingOrganization={editingOrganization}
        onUpdate={handleUpdateOrganization}
      />
    </div>
  );
}

export default OrganizationList;
