import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import {
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreHorizontal,
  MapPin,
  Building2,
  Wifi,
  Car,
  Accessibility,
  Coffee,
  Music,
  Camera,
  Users,
  Star,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { ExportDialog } from "@/components/ui/export-dialog";
import { commonColumns } from "@/lib/exportUtils";

type Venue = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  capacity: number;
  facilities: string[];
  status: "active" | "inactive" | "maintenance";
  rating: number;
  totalEvents: number;
  lastEventDate?: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

const VenueManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [venues, setVenues] = useState<Venue[]>([
    {
      id: "1",
      name: "Cairo International Convention Center",
      description:
        "A state-of-the-art convention center with multiple halls and modern facilities",
      address: "Nasr City, Cairo",
      city: "Cairo",
      capacity: 5000,
      facilities: [
        "WiFi",
        "Parking",
        "Wheelchair Access",
        "Catering",
        "Audio/Visual",
        "Security",
      ],
      status: "active",
      rating: 4.8,
      totalEvents: 45,
      lastEventDate: "2024-01-15",
      contactPhone: "+20 2 2268 0000",
      contactEmail: "info@cicc.com.eg",
      website: "https://cicc.com.eg",
      images: ["/venues/cicc-1.jpg", "/venues/cicc-2.jpg"],
      createdAt: "2023-01-01",
      updatedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Opera House - Main Hall",
      description:
        "Historic venue with excellent acoustics for classical and contemporary performances",
      address: "El Borg, Cairo",
      city: "Cairo",
      capacity: 1200,
      facilities: [
        "WiFi",
        "Parking",
        "Wheelchair Access",
        "Catering",
        "Audio/Visual",
      ],
      status: "active",
      rating: 4.9,
      totalEvents: 78,
      lastEventDate: "2024-01-20",
      contactPhone: "+20 2 2739 0114",
      contactEmail: "info@cairoopera.org",
      website: "https://cairoopera.org",
      images: ["/venues/opera-1.jpg"],
      createdAt: "2023-01-01",
      updatedAt: "2024-01-20",
    },
    {
      id: "3",
      name: "Giza Pyramids Complex",
      description:
        "Outdoor venue with breathtaking views of the ancient pyramids",
      address: "Giza Plateau, Giza",
      city: "Giza",
      capacity: 10000,
      facilities: [
        "Parking",
        "Security",
        "Catering",
        "Audio/Visual",
        "Transportation",
      ],
      status: "active",
      rating: 4.7,
      totalEvents: 23,
      lastEventDate: "2024-01-10",
      contactPhone: "+20 2 3380 0000",
      contactEmail: "info@giza-pyramids.org",
      images: ["/venues/pyramids-1.jpg"],
      createdAt: "2023-01-01",
      updatedAt: "2024-01-10",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [editingVenue, setEditingVenue] = useState<Partial<Venue>>({});
  const [newVenue, setNewVenue] = useState<Partial<Venue>>({
    name: "",
    description: "",
    address: "",
    city: "",
    capacity: 0,
    facilities: [],
    contactPhone: "",
    contactEmail: "",
    website: "",
    images: [],
  });

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch =
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || venue.status === statusFilter;
      const matchesCity = cityFilter === "all" || venue.city === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [venues, searchTerm, statusFilter, cityFilter]);

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
  const paginatedVenues = filteredVenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(venues.map((venue) => venue.city))];
    return uniqueCities.sort();
  }, [venues]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "wheelchair access":
        return <Accessibility className="h-4 w-4" />;
      case "catering":
        return <Coffee className="h-4 w-4" />;
      case "audio/visual":
        return <Music className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "camera":
        return <Camera className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const handleAddVenue = () => {
    setIsAddDialogOpen(true);
  };

  const handleViewVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsViewDialogOpen(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setEditingVenue({
      name: venue.name,
      description: venue.description,
      facilities: [...venue.facilities],
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteVenue = (venueId: string) => {
    setVenues(venues.filter((venue) => venue.id !== venueId));
    toast({
      title: "Venue Deleted",
      description: "Venue has been successfully deleted",
    });
  };

  const handleSaveNewVenue = () => {
    if (!newVenue.name || !newVenue.description || !newVenue.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const venue: Venue = {
      id: Date.now().toString(),
      name: newVenue.name!,
      description: newVenue.description!,
      address: newVenue.address!,
      city: newVenue.city!,
      capacity: newVenue.capacity!,
      facilities: newVenue.facilities!,
      status: "active",
      rating: 0,
      totalEvents: 0,
      contactPhone: newVenue.contactPhone!,
      contactEmail: newVenue.contactEmail!,
      website: newVenue.website,
      images: newVenue.images!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVenues([...venues, venue]);
    setNewVenue({
      name: "",
      description: "",
      address: "",
      city: "",
      capacity: 0,
      facilities: [],
      contactPhone: "",
      contactEmail: "",
      website: "",
      images: [],
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Venue Added",
      description: "Venue has been successfully added",
    });
  };

  const handleSaveVenueEdit = () => {
    if (!editingVenue.name || !editingVenue.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedVenue) {
      const updatedVenues = venues.map((venue) =>
        venue.id === selectedVenue.id
          ? {
              ...venue,
              name: editingVenue.name!,
              description: editingVenue.description!,
              facilities: editingVenue.facilities || [],
              updatedAt: new Date().toISOString(),
            }
          : venue
      );
      setVenues(updatedVenues);
      setIsEditDialogOpen(false);
      setEditingVenue({});
      toast({
        title: "Venue Updated",
        description: "Venue has been successfully updated",
      });
    }
  };

  const handleNewVenueChange = (field: string, value: any) => {
    setNewVenue((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditVenueChange = (field: string, value: any) => {
    setEditingVenue((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFacility = () => {
    const facility = prompt("Enter facility name:");
    if (facility) {
      setNewVenue((prev) => ({
        ...prev,
        facilities: [...(prev.facilities || []), facility],
      }));
    }
  };

  const handleRemoveFacility = (index: number) => {
    setNewVenue((prev) => ({
      ...prev,
      facilities: prev.facilities?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleEditAddFacility = () => {
    const facility = prompt("Enter facility name:");
    if (facility) {
      setEditingVenue((prev) => ({
        ...prev,
        facilities: [...(prev.facilities || []), facility],
      }));
    }
  };

  const handleEditRemoveFacility = (index: number) => {
    setEditingVenue((prev) => ({
      ...prev,
      facilities: prev.facilities?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleExportVenues = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Description,Address,City,Capacity,Status,Rating,Total Events\n" +
      venues
        .map(
          (venue) =>
            `${venue.name},${venue.description},${venue.address},${venue.city},${venue.capacity},${venue.status},${venue.rating},${venue.totalEvents}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "venues.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Venues Exported",
      description: "Venues have been exported successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
            Venue Management
          </h2>
          <p className="text-muted-foreground rtl:text-right ltr:text-left">
            Manage all venues, their details, and facilities
          </p>
        </div>
        <div className="flex items-center gap-2 rtl:flex-row-reverse">
          <ExportDialog
            data={filteredVenues}
            columns={commonColumns.venues}
            title="Venues"
            subtitle="Manage event venues and locations"
            filename="venues"
            filters={{
              search: searchTerm,
              status: statusFilter,
              city: cityFilter,
            }}
            onExport={(format) => {
              toast({
                title: "Export Successful",
                description: "Venues exported successfully",
              });
            }}
          >
            <Button
              variant="outline"
              className="flex items-center gap-2 rtl:flex-row-reverse"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </ExportDialog>
          <Button
            onClick={handleAddVenue}
            className="flex items-center gap-2 rtl:flex-row-reverse"
          >
            <Plus className="h-4 w-4" />
            Add Venue
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rtl:space-x-reverse">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
              <Input
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Venues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Venues</CardTitle>
          <CardDescription>
            Showing {filteredVenues.length} venues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Facilities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVenues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{venue.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {venue.description.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 rtl:flex-row-reverse">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{venue.city}</div>
                          <div className="text-sm text-muted-foreground">
                            {venue.address}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 rtl:flex-row-reverse">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {venue.capacity.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {venue.facilities.slice(0, 3).map((facility, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {facility}
                          </Badge>
                        ))}
                        {venue.facilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{venue.facilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(venue.status)}>
                        {getStatusText(venue.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 rtl:flex-row-reverse">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{venue.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{venue.totalEvents}</div>
                        <div className="text-xs text-muted-foreground">
                          {venue.lastEventDate
                            ? `Last: ${venue.lastEventDate}`
                            : "No events"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewVenue(venue)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditVenue(venue)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Venue
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteVenue(venue.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Venue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Venue Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Venue</DialogTitle>
            <DialogDescription>
              Add a new venue with all its details and facilities
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newVenue.name}
                  onChange={(e) => handleNewVenueChange("name", e.target.value)}
                  placeholder="Enter venue name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newVenue.description}
                  onChange={(e) =>
                    handleNewVenueChange("description", e.target.value)
                  }
                  placeholder="Enter venue description"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={newVenue.address}
                  onChange={(e) =>
                    handleNewVenueChange("address", e.target.value)
                  }
                  placeholder="Enter venue address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={newVenue.city}
                  onChange={(e) => handleNewVenueChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  value={newVenue.capacity}
                  onChange={(e) =>
                    handleNewVenueChange("capacity", parseInt(e.target.value))
                  }
                  placeholder="Enter capacity"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={newVenue.contactPhone}
                  onChange={(e) =>
                    handleNewVenueChange("contactPhone", e.target.value)
                  }
                  placeholder="Enter contact phone"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={newVenue.contactEmail}
                  onChange={(e) =>
                    handleNewVenueChange("contactEmail", e.target.value)
                  }
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={newVenue.website}
                  onChange={(e) =>
                    handleNewVenueChange("website", e.target.value)
                  }
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Facilities</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {newVenue.facilities?.map((facility, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getFacilityIcon(facility)}
                    {facility}
                    <button
                      onClick={() => handleRemoveFacility(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFacility}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewVenue}>Save Venue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Venue Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
            <DialogDescription>
              Update venue details and facilities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editingVenue.name}
                onChange={(e) => handleEditVenueChange("name", e.target.value)}
                placeholder="Enter venue name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editingVenue.description}
                onChange={(e) =>
                  handleEditVenueChange("description", e.target.value)
                }
                placeholder="Enter venue description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Facilities</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {editingVenue.facilities?.map((facility, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getFacilityIcon(facility)}
                    {facility}
                    <button
                      onClick={() => handleEditRemoveFacility(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditAddFacility}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveVenueEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Venue Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVenue?.name}</DialogTitle>
            <DialogDescription>{selectedVenue?.description}</DialogDescription>
          </DialogHeader>
          {selectedVenue && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Location</h4>
                  <div className="flex items-center gap-2 rtl:flex-row-reverse mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedVenue.address}, {selectedVenue.city}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Capacity</h4>
                  <div className="flex items-center gap-2 rtl:flex-row-reverse mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVenue.capacity.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Contact</h4>
                  <div className="space-y-1 mt-1">
                    <div>{selectedVenue.contactPhone}</div>
                    <div>{selectedVenue.contactEmail}</div>
                    {selectedVenue.website && (
                      <div>
                        <a
                          href={selectedVenue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedVenue.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Facilities</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedVenue.facilities.map((facility, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {getFacilityIcon(facility)}
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedVenue.rating}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rating
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedVenue.totalEvents}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Events
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <Badge className={getStatusColor(selectedVenue.status)}>
                    {getStatusText(selectedVenue.status)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueManagement;
