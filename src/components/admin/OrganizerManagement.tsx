import React, { useState, useMemo, useEffect } from "react";
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
  DialogTrigger,
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  ResponsivePagination,
} from "@/components/ui/pagination";
import {
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  User,
  Shield,
  Settings,
  MoreHorizontal,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Crown,
  Users,
  UserCog,
  Key,
  LogOut,
  Calendar,
  EyeOff,
  CheckSquare,
  Square,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ticket,
  CalendarDays,
  Award,
  FileText,
  CreditCard,
  Wallet,
  Target,
  Zap,
  Repeat,
  Clock3,
  CalendarX,
  Building,
  Home,
  Briefcase,
  GraduationCap,
  Music,
  Camera,
  Palette,
  Gamepad2,
  Utensils,
  Car,
  Plane,
  Train,
  Bus,
  Ship,
  Bike,
  Upload,
  Image,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { formatNumberForLocale, formatPhoneNumberForLocale } from "@/lib/utils";
import { ExportDialog } from "@/components/ui/export-dialog";
import { commonColumns } from "@/lib/exportUtils";

type Organizer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  status: "active" | "inactive" | "suspended" | "pending";
  registrationDate: string;
  lastLogin: string;
  totalEvents: number;
  totalRevenue: number;
  commissionRate: number;
  rating: number;
  verified: boolean;
  category:
    | "music"
    | "sports"
    | "technology"
    | "art"
    | "food"
    | "education"
    | "business"
    | "other";
  location: string;
  description: string;
  profileImage?: string;
  contactPerson: string;
  businessLicense?: string;
  taxId?: string;
  bankAccount?: string;
  payoutMethod: "bank" | "paypal" | "stripe";
  payoutEmail?: string;
  minimumPayout: number;
  totalPayouts: number;
  pendingPayout: number;
  eventsThisMonth: number;
  eventsLastMonth: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  responseTime: number; // in hours
  cancellationRate: number;
  refundRate: number;
  customerSatisfaction: number;
  repeatCustomers: number;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
};

type OrganizerEvent = {
  id: string;
  title: string;
  date: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  commission: number;
  rating?: number;
  image?: string;
  description?: string;
  location?: string;
  price?: number;
};

type OrganizerActivity = {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  eventTitle?: string;
  amount?: number;
  status: "success" | "failed" | "warning";
};

const OrganizersManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showOrganizerDetails, setShowOrganizerDetails] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isEventsDialogOpen, setIsEventsDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(
    null
  );
  const [newOrganizer, setNewOrganizer] = useState<Partial<Organizer>>({});
  const [editingEvent, setEditingEvent] = useState<OrganizerEvent | null>(null);
  const [newEvent, setNewEvent] = useState<
    Partial<OrganizerEvent> & {
      time?: string;
      category?: string;
      ticketLimit?: number;
      ticketTransferEnabled?: boolean;
      commissionRate?: {
        type: "percentage" | "flat";
        value: number;
      };
      transferFee?: {
        type: "percentage" | "flat";
        value: number;
      };
      imageUrl?: string;
    }
  >({
    commissionRate: {
      type: "percentage",
      value: 10,
    },
    transferFee: {
      type: "percentage",
      value: 5,
    },
    ticketTransferEnabled: false,
    ticketLimit: 1,
  });
  const [organizers, setOrganizers] = useState<Organizer[]>([
    {
      id: "ORG001",
      name: "Cairo Events Pro",
      email: "contact@cairoeventspro.com",
      phone: "+20 10 1234 5678",
      website: "https://cairoeventspro.com",
      status: "active",
      registrationDate: "2024-01-15",
      lastLogin: "2025-08-16T10:30:00",
      totalEvents: 45,
      totalRevenue: 1250000,
      commissionRate: 10,
      rating: 4.8,
      verified: true,
      category: "music",
      location: "Cairo, Egypt",
      description:
        "Premier event organizer specializing in music concerts and festivals across Egypt.",
      profileImage: "/public/Portrait_Placeholder.png",
      contactPerson: "Ahmed Hassan",
      businessLicense: "BL-2024-001",
      taxId: "TAX-123456789",
      bankAccount: "EG123456789012345678901234",
      payoutMethod: "bank",
      minimumPayout: 5000,
      totalPayouts: 1150000,
      pendingPayout: 15000,
      eventsThisMonth: 3,
      eventsLastMonth: 4,
      averageRating: 4.8,
      totalReviews: 156,
      responseRate: 98,
      responseTime: 2,
      cancellationRate: 2,
      refundRate: 1,
      customerSatisfaction: 95,
      repeatCustomers: 45,
      socialMedia: {
        facebook: "cairoeventspro",
        instagram: "cairoeventspro",
        twitter: "cairoeventspro",
      },
    },
    {
      id: "ORG002",
      name: "Tech Events Egypt",
      email: "info@techeventsegypt.com",
      phone: "+20 10 2345 6789",
      website: "https://techeventsegypt.com",
      status: "active",
      registrationDate: "2024-02-20",
      lastLogin: "2025-08-16T09:15:00",
      totalEvents: 28,
      totalRevenue: 850000,
      commissionRate: 12,
      rating: 4.6,
      verified: true,
      category: "technology",
      location: "Alexandria, Egypt",
      description:
        "Leading technology conference and workshop organizer in Egypt.",
      profileImage: "/public/Portrait_Placeholder.png",
      contactPerson: "Sarah Mohamed",
      businessLicense: "BL-2024-002",
      taxId: "TAX-987654321",
      bankAccount: "EG987654321098765432109876",
      payoutMethod: "paypal",
      payoutEmail: "payments@techeventsegypt.com",
      minimumPayout: 3000,
      totalPayouts: 748000,
      pendingPayout: 102000,
      eventsThisMonth: 2,
      eventsLastMonth: 3,
      averageRating: 4.6,
      totalReviews: 89,
      responseRate: 95,
      responseTime: 4,
      cancellationRate: 5,
      refundRate: 2,
      customerSatisfaction: 92,
      repeatCustomers: 32,
      socialMedia: {
        linkedin: "techeventsegypt",
        twitter: "techeventsegypt",
      },
    },
    {
      id: "ORG003",
      name: "Art & Culture Hub",
      email: "hello@artculturehub.com",
      phone: "+20 10 3456 7890",
      website: "https://artculturehub.com",
      status: "active",
      registrationDate: "2024-03-10",
      lastLogin: "2025-08-16T11:45:00",
      totalEvents: 15,
      totalRevenue: 320000,
      commissionRate: 8,
      rating: 4.9,
      verified: true,
      category: "art",
      location: "Giza, Egypt",
      description: "Curating exceptional art exhibitions and cultural events.",
      profileImage: "/public/Portrait_Placeholder.png",
      contactPerson: "Layla Ahmed",
      businessLicense: "BL-2024-003",
      taxId: "TAX-456789123",
      bankAccount: "EG456789123456789123456789",
      payoutMethod: "bank",
      minimumPayout: 2000,
      totalPayouts: 294400,
      pendingPayout: 25600,
      eventsThisMonth: 1,
      eventsLastMonth: 2,
      averageRating: 4.9,
      totalReviews: 67,
      responseRate: 100,
      responseTime: 1,
      cancellationRate: 0,
      refundRate: 0,
      customerSatisfaction: 98,
      repeatCustomers: 28,
      socialMedia: {
        instagram: "artculturehub",
        facebook: "artculturehub",
      },
    },
    {
      id: "ORG004",
      name: "Sports Events Plus",
      email: "contact@sportseventsplus.com",
      phone: "+20 10 4567 8901",
      website: "https://sportseventsplus.com",
      status: "inactive",
      registrationDate: "2024-04-05",
      lastLogin: "2025-07-20T14:20:00",
      totalEvents: 8,
      totalRevenue: 180000,
      commissionRate: 15,
      rating: 4.3,
      verified: false,
      category: "sports",
      location: "Sharm El Sheikh, Egypt",
      description:
        "Sports event organizer specializing in marathons and fitness events.",
      profileImage: "/public/Portrait_Placeholder.png",
      contactPerson: "Omar Khalil",
      businessLicense: "BL-2024-004",
      taxId: "TAX-789123456",
      bankAccount: "EG789123456789123456789123",
      payoutMethod: "stripe",
      minimumPayout: 1000,
      totalPayouts: 153000,
      pendingPayout: 27000,
      eventsThisMonth: 0,
      eventsLastMonth: 1,
      averageRating: 4.3,
      totalReviews: 34,
      responseRate: 85,
      responseTime: 6,
      cancellationRate: 8,
      refundRate: 3,
      customerSatisfaction: 87,
      repeatCustomers: 12,
    },
    {
      id: "ORG005",
      name: "Food Festival Masters",
      email: "info@foodfestivalmasters.com",
      phone: "+20 10 5678 9012",
      website: "https://foodfestivalmasters.com",
      status: "active",
      registrationDate: "2024-05-12",
      lastLogin: "2025-08-16T08:30:00",
      totalEvents: 22,
      totalRevenue: 680000,
      commissionRate: 10,
      rating: 4.7,
      verified: true,
      category: "food",
      location: "Luxor, Egypt",
      description: "Premier food festival and culinary event organizer.",
      profileImage: "/public/Portrait_Placeholder.png",
      contactPerson: "Fatima Ali",
      businessLicense: "BL-2024-005",
      taxId: "TAX-321654987",
      bankAccount: "EG321654987321654987321654",
      payoutMethod: "bank",
      minimumPayout: 4000,
      totalPayouts: 612000,
      pendingPayout: 68000,
      eventsThisMonth: 2,
      eventsLastMonth: 2,
      averageRating: 4.7,
      totalReviews: 123,
      responseRate: 96,
      responseTime: 3,
      cancellationRate: 3,
      refundRate: 1,
      customerSatisfaction: 94,
      repeatCustomers: 38,
      socialMedia: {
        instagram: "foodfestivalmasters",
        facebook: "foodfestivalmasters",
        twitter: "foodfestivalmasters",
      },
    },
  ]);

  // Mock organizer activity data
  const organizerActivities: OrganizerActivity[] = [
    {
      id: "1",
      action: "Event Created",
      description: "Created new event 'Summer Concert 2025'",
      timestamp: "2025-08-16T14:30:00",
      eventTitle: "Summer Concert 2025",
      status: "success",
    },
    {
      id: "2",
      action: "Payout Requested",
      description: "Requested payout of EGP 15,000",
      timestamp: "2025-08-16T14:25:00",
      amount: 15000,
      status: "success",
    },
    {
      id: "3",
      action: "Event Updated",
      description: "Updated event details for 'Tech Conference 2025'",
      timestamp: "2025-08-16T14:20:00",
      eventTitle: "Tech Conference 2025",
      status: "success",
    },
    {
      id: "4",
      action: "Login",
      description: "Organizer logged in successfully",
      timestamp: "2025-08-16T14:15:00",
      status: "success",
    },
    {
      id: "5",
      action: "Event Cancelled",
      description: "Cancelled event 'Art Exhibition' due to venue issues",
      timestamp: "2025-08-16T14:10:00",
      eventTitle: "Art Exhibition",
      status: "warning",
    },
    {
      id: "6",
      action: "Payment Failed",
      description: "Failed to process payout due to invalid bank details",
      timestamp: "2025-08-16T14:05:00",
      status: "failed",
    },
  ];

  // Mock organizer events data
  const [organizerEvents, setOrganizerEvents] = useState<OrganizerEvent[]>([
    {
      id: "E001",
      title: "Summer Concert 2025",
      date: "2025-09-15",
      status: "upcoming",
      ticketsSold: 850,
      totalTickets: 1000,
      revenue: 85000,
      commission: 8500,
      rating: 4.5,
      image: "/public/Portrait_Placeholder.png",
      description: "An amazing summer concert featuring top artists",
      location: "Cairo Stadium",
      price: 100,
    },
    {
      id: "E002",
      title: "Tech Conference 2025",
      date: "2025-08-20",
      status: "upcoming",
      ticketsSold: 320,
      totalTickets: 500,
      revenue: 48000,
      commission: 4800,
      rating: 4.2,
      image: "/public/Portrait_Placeholder.png",
      description: "Annual technology conference with industry leaders",
      location: "Alexandria Convention Center",
      price: 150,
    },
    {
      id: "E003",
      title: "Art Exhibition",
      date: "2025-07-10",
      status: "cancelled",
      ticketsSold: 0,
      totalTickets: 200,
      revenue: 0,
      commission: 0,
      image: "/public/Portrait_Placeholder.png",
      description: "Contemporary art exhibition featuring local artists",
      location: "Giza Art Gallery",
      price: 50,
    },
    {
      id: "E004",
      title: "Food Festival 2025",
      date: "2025-06-25",
      status: "completed",
      ticketsSold: 1200,
      totalTickets: 1200,
      revenue: 120000,
      commission: 12000,
      rating: 4.8,
      image: "/public/Portrait_Placeholder.png",
      description: "Annual food festival showcasing local cuisine",
      location: "Luxor Food Court",
      price: 75,
    },
  ]);

  // Filter organizers based on search and filters
  const filteredOrganizers = useMemo(() => {
    return organizers.filter((organizer) => {
      const matchesSearch =
        organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.contactPerson
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || organizer.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || organizer.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [organizers, searchTerm, statusFilter, categoryFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrganizers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrganizers = filteredOrganizers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("admin.organizers.status.active");
      case "inactive":
        return t("admin.organizers.status.inactive");
      case "suspended":
        return t("admin.organizers.status.suspended");
      case "pending":
        return t("admin.organizers.status.pending");
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "music":
        return "bg-purple-100 text-purple-800";
      case "sports":
        return "bg-green-100 text-green-800";
      case "technology":
        return "bg-blue-100 text-blue-800";
      case "art":
        return "bg-pink-100 text-pink-800";
      case "food":
        return "bg-orange-100 text-orange-800";
      case "education":
        return "bg-indigo-100 text-indigo-800";
      case "business":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "music":
        return t("admin.organizers.categories.music");
      case "sports":
        return t("admin.organizers.categories.sports");
      case "technology":
        return t("admin.organizers.categories.technology");
      case "art":
        return t("admin.organizers.categories.art");
      case "food":
        return t("admin.organizers.categories.food");
      case "education":
        return t("admin.organizers.categories.education");
      case "business":
        return t("admin.organizers.categories.business");
      case "other":
        return t("admin.organizers.categories.other");
      default:
        return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "music":
        return <Music className="h-4 w-4" />;
      case "sports":
        return <Target className="h-4 w-4" />;
      case "technology":
        return <Zap className="h-4 w-4" />;
      case "art":
        return <Palette className="h-4 w-4" />;
      case "food":
        return <Utensils className="h-4 w-4" />;
      case "education":
        return <GraduationCap className="h-4 w-4" />;
      case "business":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const handleEditOrganizer = (organizer: Organizer) => {
    setEditingOrganizer(organizer);
    setIsEditDialogOpen(true);
  };

  const handleViewOrganizer = (organizer: Organizer) => {
    setSelectedOrganizer(organizer);
    setShowOrganizerDetails(true);
  };

  const handleDeleteOrganizer = (organizerId: string) => {
    setOrganizers((prevOrganizers) =>
      prevOrganizers.filter((organizer) => organizer.id !== organizerId)
    );
    toast({
      title: t("admin.organizers.toast.organizerDeleted"),
      description: t("admin.organizers.toast.organizerDeletedDesc"),
    });
  };

  const handleExportOrganizers = () => {
    toast({
      title: t("admin.organizers.toast.exportSuccess"),
      description: t("admin.organizers.toast.exportSuccessDesc"),
    });
  };

  const handleSuspendOrganizer = (organizerId: string) => {
    setOrganizers((prevOrganizers) =>
      prevOrganizers.map((organizer) =>
        organizer.id === organizerId
          ? { ...organizer, status: "suspended" as const }
          : organizer
      )
    );
    toast({
      title: t("admin.organizers.toast.organizerSuspended"),
      description: t("admin.organizers.toast.organizerSuspendedDesc"),
    });
  };

  const handleActivateOrganizer = (organizerId: string) => {
    setOrganizers((prevOrganizers) =>
      prevOrganizers.map((organizer) =>
        organizer.id === organizerId
          ? { ...organizer, status: "active" as const }
          : organizer
      )
    );
    toast({
      title: t("admin.organizers.toast.organizerActivated"),
      description: t("admin.organizers.toast.organizerActivatedDesc"),
    });
  };

  const handleVerifyOrganizer = (organizerId: string) => {
    setOrganizers((prevOrganizers) =>
      prevOrganizers.map((organizer) =>
        organizer.id === organizerId
          ? { ...organizer, verified: true }
          : organizer
      )
    );
    toast({
      title: t("admin.organizers.toast.organizerVerified"),
      description: t("admin.organizers.toast.organizerVerifiedDesc"),
    });
  };

  const handleViewActivity = (organizerId: string) => {
    const organizer = organizers.find((o) => o.id === organizerId);
    if (organizer) {
      setSelectedOrganizer(organizer);
      setIsActivityDialogOpen(true);
    }
  };

  const handleViewEvents = (organizerId: string) => {
    const organizer = organizers.find((o) => o.id === organizerId);
    if (organizer) {
      setSelectedOrganizer(organizer);
      setIsEventsDialogOpen(true);
    }
  };

  const handleAddOrganizer = () => {
    // Create a simple new organizer with basic info
    const newId = `ORG${String(organizers.length + 1).padStart(3, "0")}`;
    const newOrganizer: Organizer = {
      id: newId,
      name: "New Organizer",
      email: "new@organizer.com",
      phone: "+20 10 0000 0000",
      status: "pending",
      registrationDate: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString(),
      totalEvents: 0,
      totalRevenue: 0,
      commissionRate: 10,
      rating: 0,
      verified: false,
      category: "other",
      location: "Egypt",
      description: "New organizer account",
      contactPerson: "Contact Person",
      payoutMethod: "bank",
      minimumPayout: 1000,
      totalPayouts: 0,
      pendingPayout: 0,
      eventsThisMonth: 0,
      eventsLastMonth: 0,
      averageRating: 0,
      totalReviews: 0,
      responseRate: 0,
      responseTime: 24,
      cancellationRate: 0,
      refundRate: 0,
      customerSatisfaction: 0,
      repeatCustomers: 0,
    };

    setOrganizers((prevOrganizers) => [...prevOrganizers, newOrganizer]);
    toast({
      title: t("admin.organizers.toast.organizerAdded"),
      description: t("admin.organizers.toast.organizerAddedDesc"),
    });
    setIsAddDialogOpen(false);
  };

  const handleSaveOrganizerChanges = () => {
    if (editingOrganizer) {
      setOrganizers((prevOrganizers) =>
        prevOrganizers.map((organizer) =>
          organizer.id === editingOrganizer.id ? editingOrganizer : organizer
        )
      );
      toast({
        title: t("admin.organizers.toast.organizerUpdated"),
        description: t("admin.organizers.toast.organizerUpdatedDesc"),
      });
      setEditingOrganizer(null);
      setIsEditDialogOpen(false);
    }
  };

  const formatDateForLocale = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy", {
        locale: i18n.language === "ar" ? ar : undefined,
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTimeForLocale = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, HH:mm", {
        locale: i18n.language === "ar" ? ar : undefined,
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPhone = (phoneNumber: string) => {
    return formatPhoneNumberForLocale(phoneNumber, i18n.language);
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.organizers.title")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.organizers.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <ExportDialog
            data={filteredOrganizers}
            columns={commonColumns.organizers}
            title={t("admin.organizers.title")}
            subtitle={t("admin.organizers.subtitle")}
            filename="organizers"
            filters={{
              search: searchTerm,
              status: statusFilter,
              category: categoryFilter,
            }}
            onExport={(format) => {
              toast({
                title: t("admin.organizers.toast.exportSuccess"),
                description: t("admin.organizers.toast.exportSuccessDesc"),
              });
            }}
          >
            <Button variant="outline" className="text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 rtl:ml-1 sm:rtl:ml-2 rtl:mr-0" />
              <span className="hidden sm:inline">
                {t("admin.organizers.actions.export")}
              </span>
              <span className="sm:hidden">Export</span>
            </Button>
          </ExportDialog>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 rtl:ml-1 sm:rtl:ml-2 rtl:mr-0" />
            <span className="hidden sm:inline">
              {t("admin.organizers.actions.addOrganizer")}
            </span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
            <Filter className="h-5 w-5" />
            {t("admin.organizers.filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
              <Input
                placeholder={t("admin.organizers.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.organizers.filters.status")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.organizers.filters.allStatus")}
                </SelectItem>
                <SelectItem value="active">
                  {t("admin.organizers.filters.active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("admin.organizers.filters.inactive")}
                </SelectItem>
                <SelectItem value="suspended">
                  {t("admin.organizers.filters.suspended")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("admin.organizers.filters.pending")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.organizers.filters.category")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.organizers.filters.allCategories")}
                </SelectItem>
                <SelectItem value="music">
                  {t("admin.organizers.categories.music")}
                </SelectItem>
                <SelectItem value="sports">
                  {t("admin.organizers.categories.sports")}
                </SelectItem>
                <SelectItem value="technology">
                  {t("admin.organizers.categories.technology")}
                </SelectItem>
                <SelectItem value="art">
                  {t("admin.organizers.categories.art")}
                </SelectItem>
                <SelectItem value="food">
                  {t("admin.organizers.categories.food")}
                </SelectItem>
                <SelectItem value="education">
                  {t("admin.organizers.categories.education")}
                </SelectItem>
                <SelectItem value="business">
                  {t("admin.organizers.categories.business")}
                </SelectItem>
                <SelectItem value="other">
                  {t("admin.organizers.categories.other")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Organizers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="rtl:text-right ltr:text-left">
            {t("admin.organizers.table.organizer")} (
            {formatNumberForLocale(filteredOrganizers.length, i18n.language)})
          </CardTitle>
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            <span className="text-sm text-muted-foreground">
              {t("admin.organizers.pagination.showing")} {startIndex + 1}-
              {Math.min(endIndex, filteredOrganizers.length)}{" "}
              {t("admin.organizers.pagination.of")} {filteredOrganizers.length}{" "}
              {t("admin.organizers.pagination.results")}
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.organizer")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.contact")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.category")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.status")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.events")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.revenue")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.rating")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.organizers.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img
                          src={
                            organizer.profileImage ||
                            "/public/Portrait_Placeholder.png"
                          }
                          alt={organizer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="rtl:text-right ltr:text-left">
                          <div className="flex items-center gap-2 rtl:flex-row-reverse">
                            <p className="font-medium">{organizer.name}</p>
                            {organizer.verified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                                {t("admin.organizers.verified")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {organizer.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right ltr:text-left">
                        <p className="text-sm">{organizer.email}</p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {formatPhone(organizer.phone)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(organizer.category)}>
                        <div className="flex items-center gap-1 rtl:flex-row-reverse">
                          {getCategoryIcon(organizer.category)}
                          {getCategoryText(organizer.category)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(organizer.status)}>
                        {getStatusText(organizer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right ltr:text-left">
                        {formatNumberForLocale(
                          organizer.totalEvents,
                          i18n.language
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right ltr:text-left">
                        {formatNumberForLocale(
                          organizer.totalRevenue,
                          i18n.language
                        )}{" "}
                        EGP
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 rtl:flex-row-reverse">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{organizer.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rtl:text-right ltr:text-left"
                        >
                          <DropdownMenuLabel>
                            {t("admin.organizers.table.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewOrganizer(organizer)}
                          >
                            <Eye className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.organizers.actions.viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditOrganizer(organizer)}
                          >
                            <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.organizers.actions.editOrganizer")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewEvents(organizer.id)}
                          >
                            <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.organizers.actions.viewEvents")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewActivity(organizer.id)}
                          >
                            <Activity className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.organizers.actions.viewActivity")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!organizer.verified && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleVerifyOrganizer(organizer.id)
                              }
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                              {t("admin.organizers.actions.verify")}
                            </DropdownMenuItem>
                          )}
                          {organizer.status === "active" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleSuspendOrganizer(organizer.id)
                              }
                              className="text-yellow-600"
                            >
                              <UserX className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                              {t("admin.organizers.actions.suspend")}
                            </DropdownMenuItem>
                          )}
                          {organizer.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleActivateOrganizer(organizer.id)
                              }
                              className="text-green-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                              {t("admin.organizers.actions.activate")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteOrganizer(organizer.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.organizers.actions.deleteOrganizer")}
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
          <ResponsivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showInfo={true}
            infoText={`${t("admin.organizers.pagination.showing")} ${
              startIndex + 1
            }-${Math.min(endIndex, filteredOrganizers.length)} ${t(
              "admin.organizers.pagination.of"
            )} ${filteredOrganizers.length} ${t(
              "admin.organizers.pagination.results"
            )}`}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredOrganizers.length}
            itemsPerPage={itemsPerPage}
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* View Organizer Details Dialog */}
      <Dialog
        open={showOrganizerDetails}
        onOpenChange={setShowOrganizerDetails}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
              <User className="h-5 w-5" />
              {t("admin.organizers.details.title")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.organizers.details.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedOrganizer && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
                    <User className="h-5 w-5" />
                    {t("admin.organizers.details.basicInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <img
                        src={
                          selectedOrganizer.profileImage ||
                          "/public/Portrait_Placeholder.png"
                        }
                        alt={selectedOrganizer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="rtl:text-right ltr:text-left">
                        <h3 className="text-lg font-semibold">
                          {selectedOrganizer.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrganizer.location}
                        </p>
                        <div className="flex items-center gap-2 mt-1 rtl:flex-row-reverse">
                          <Badge
                            className={getStatusColor(selectedOrganizer.status)}
                          >
                            {getStatusText(selectedOrganizer.status)}
                          </Badge>
                          {selectedOrganizer.verified && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                              {t("admin.organizers.verified")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 rtl:text-right ltr:text-left">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t("admin.organizers.details.email")}
                        </label>
                        <p className="text-sm">{selectedOrganizer.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t("admin.organizers.details.phone")}
                        </label>
                        <p className="text-sm" dir="ltr">
                          {formatPhone(selectedOrganizer.phone)}
                        </p>
                      </div>
                      {selectedOrganizer.website && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t("admin.organizers.details.website")}
                          </label>
                          <p className="text-sm">{selectedOrganizer.website}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
                    <TrendingUp className="h-5 w-5" />
                    {t("admin.organizers.details.statistics")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {selectedOrganizer.totalEvents}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.organizers.details.totalEvents")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {formatNumberForLocale(
                          selectedOrganizer.totalRevenue,
                          i18n.language
                        )}{" "}
                        EGP
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.organizers.details.totalRevenue")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {selectedOrganizer.rating}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.organizers.details.rating")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {selectedOrganizer.commissionRate}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.organizers.details.commissionRate")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
                    <FileText className="h-5 w-5" />
                    {t("admin.organizers.details.description")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm rtl:text-right ltr:text-left">
                    {selectedOrganizer.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOrganizerDetails(false)}
            >
              {t("admin.organizers.details.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organizer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
              <Edit className="h-5 w-5" />
              {t("admin.organizers.edit.title")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.organizers.edit.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {editingOrganizer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.edit.name")}
                  </label>
                  <Input
                    value={editingOrganizer.name}
                    onChange={(e) =>
                      setEditingOrganizer({
                        ...editingOrganizer,
                        name: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.edit.profileImage")}
                  </label>
                  <div className="flex items-center space-x-3 mt-1 rtl:space-x-reverse">
                    <img
                      src={
                        editingOrganizer.profileImage ||
                        "/public/Portrait_Placeholder.png"
                      }
                      alt={editingOrganizer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <Input
                      value={editingOrganizer.profileImage}
                      onChange={(e) =>
                        setEditingOrganizer({
                          ...editingOrganizer,
                          profileImage: e.target.value,
                        })
                      }
                      placeholder="Enter image URL"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = prompt("Enter image URL:");
                        if (url) {
                          setEditingOrganizer({
                            ...editingOrganizer,
                            profileImage: url,
                          });
                        }
                      }}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.edit.email")}
                  </label>
                  <Input
                    value={editingOrganizer.email}
                    onChange={(e) =>
                      setEditingOrganizer({
                        ...editingOrganizer,
                        email: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.edit.phone")}
                  </label>
                  <Input
                    value={editingOrganizer.phone}
                    onChange={(e) =>
                      setEditingOrganizer({
                        ...editingOrganizer,
                        phone: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.edit.status")}
                  </label>
                  <Select
                    value={editingOrganizer.status}
                    onValueChange={(value) =>
                      setEditingOrganizer({
                        ...editingOrganizer,
                        status: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("admin.organizers.status.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("admin.organizers.status.inactive")}
                      </SelectItem>
                      <SelectItem value="suspended">
                        {t("admin.organizers.status.suspended")}
                      </SelectItem>
                      <SelectItem value="pending">
                        {t("admin.organizers.status.pending")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.edit.category")}
                  </label>
                  <Select
                    value={editingOrganizer.category}
                    onValueChange={(value) =>
                      setEditingOrganizer({
                        ...editingOrganizer,
                        category: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="music">
                        {t("admin.organizers.categories.music")}
                      </SelectItem>
                      <SelectItem value="sports">
                        {t("admin.organizers.categories.sports")}
                      </SelectItem>
                      <SelectItem value="technology">
                        {t("admin.organizers.categories.technology")}
                      </SelectItem>
                      <SelectItem value="art">
                        {t("admin.organizers.categories.art")}
                      </SelectItem>
                      <SelectItem value="food">
                        {t("admin.organizers.categories.food")}
                      </SelectItem>
                      <SelectItem value="education">
                        {t("admin.organizers.categories.education")}
                      </SelectItem>
                      <SelectItem value="business">
                        {t("admin.organizers.categories.business")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("admin.organizers.categories.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.edit.location")}
                  </label>
                  <Input
                    value={editingOrganizer.location}
                    onChange={(e) =>
                      setEditingOrganizer({
                        ...editingOrganizer,
                        location: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("admin.organizers.edit.description")}
                </label>
                <textarea
                  value={editingOrganizer.description}
                  onChange={(e) =>
                    setEditingOrganizer({
                      ...editingOrganizer,
                      description: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-3 border rounded-md resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("admin.organizers.edit.cancel")}
            </Button>
            <Button onClick={handleSaveOrganizerChanges}>
              {t("admin.organizers.edit.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Organizer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
              <Plus className="h-5 w-5" />
              {t("admin.organizers.add.title")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.organizers.add.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("admin.organizers.add.name")}
                </label>
                <Input
                  value={newOrganizer.name}
                  onChange={(e) =>
                    setNewOrganizer({ ...newOrganizer, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("admin.organizers.add.email")}
                </label>
                <Input
                  value={newOrganizer.email}
                  onChange={(e) =>
                    setNewOrganizer({ ...newOrganizer, email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("admin.organizers.add.phone")}
                </label>
                <Input
                  value={newOrganizer.phone}
                  onChange={(e) =>
                    setNewOrganizer({ ...newOrganizer, phone: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("admin.organizers.add.status")}
                </label>
                <Select
                  value={newOrganizer.status}
                  onValueChange={(value) =>
                    setNewOrganizer({ ...newOrganizer, status: value as any })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t("admin.organizers.status.active")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("admin.organizers.status.inactive")}
                    </SelectItem>
                    <SelectItem value="suspended">
                      {t("admin.organizers.status.suspended")}
                    </SelectItem>
                    <SelectItem value="pending">
                      {t("admin.organizers.status.pending")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("admin.organizers.add.category")}
                </label>
                <Select
                  value={newOrganizer.category}
                  onValueChange={(value) =>
                    setNewOrganizer({ ...newOrganizer, category: value as any })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">
                      {t("admin.organizers.categories.music")}
                    </SelectItem>
                    <SelectItem value="sports">
                      {t("admin.organizers.categories.sports")}
                    </SelectItem>
                    <SelectItem value="technology">
                      {t("admin.organizers.categories.technology")}
                    </SelectItem>
                    <SelectItem value="art">
                      {t("admin.organizers.categories.art")}
                    </SelectItem>
                    <SelectItem value="food">
                      {t("admin.organizers.categories.food")}
                    </SelectItem>
                    <SelectItem value="education">
                      {t("admin.organizers.categories.education")}
                    </SelectItem>
                    <SelectItem value="business">
                      {t("admin.organizers.categories.business")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("admin.organizers.categories.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("admin.organizers.add.location")}
                </label>
                <Input
                  value={newOrganizer.location}
                  onChange={(e) =>
                    setNewOrganizer({
                      ...newOrganizer,
                      location: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("admin.organizers.add.description")}
              </label>
              <textarea
                value={newOrganizer.description}
                onChange={(e) =>
                  setNewOrganizer({
                    ...newOrganizer,
                    description: e.target.value,
                  })
                }
                className="w-full mt-1 p-3 border rounded-md resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("admin.organizers.add.cancel")}
            </Button>
            <Button
              onClick={() => {
                const newId = `ORG${String(organizers.length + 1).padStart(
                  3,
                  "0"
                )}`;
                const organizerToAdd: Organizer = {
                  id: newId,
                  name: newOrganizer.name || "New Organizer",
                  email: newOrganizer.email || "new@organizer.com",
                  phone: newOrganizer.phone || "+20 10 0000 0000",
                  status: newOrganizer.status || "pending",
                  registrationDate: new Date().toISOString().split("T")[0],
                  lastLogin: new Date().toISOString(),
                  totalEvents: 0,
                  totalRevenue: 0,
                  commissionRate: 10,
                  rating: 0,
                  verified: false,
                  category: newOrganizer.category || "other",
                  location: newOrganizer.location || "Egypt",
                  description:
                    newOrganizer.description || "New organizer account",
                  contactPerson: "Contact Person",
                  payoutMethod: "bank",
                  minimumPayout: 1000,
                  totalPayouts: 0,
                  pendingPayout: 0,
                  eventsThisMonth: 0,
                  eventsLastMonth: 0,
                  averageRating: 0,
                  totalReviews: 0,
                  responseRate: 0,
                  responseTime: 24,
                  cancellationRate: 0,
                  refundRate: 0,
                  customerSatisfaction: 0,
                  repeatCustomers: 0,
                };
                setOrganizers((prevOrganizers) => [
                  ...prevOrganizers,
                  organizerToAdd,
                ]);
                toast({
                  title: t("admin.organizers.toast.organizerAdded"),
                  description: t("admin.organizers.toast.organizerAddedDesc"),
                });
                setIsAddDialogOpen(false);
                setNewOrganizer({});
              }}
            >
              {t("admin.organizers.add.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Events Dialog */}
      <Dialog open={isEventsDialogOpen} onOpenChange={setIsEventsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
              <Calendar className="h-5 w-5" />
              {t("admin.organizers.events.title")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.organizers.events.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedOrganizer && (
            <div className="space-y-4">
              <div className="flex justify-end rtl:text-right ltr:text-left">
                <Button onClick={() => setIsAddEventDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t("admin.organizers.events.addEvent")}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.organizers.events.event")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.organizers.events.date")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.organizers.events.statusLabel")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.organizers.events.tickets")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.organizers.events.revenue")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.organizers.events.rating")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.organizers.events.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizerEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="rtl:text-right ltr:text-left">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img
                              src={
                                event.image ||
                                "/public/Portrait_Placeholder.png"
                              }
                              alt={event.title}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                            <p className="font-medium">{event.title}</p>
                          </div>
                        </TableCell>
                        <TableCell className="rtl:text-right ltr:text-left">
                          {formatDateForLocale(event.date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="rtl:text-right ltr:text-left">
                          {formatNumberForLocale(
                            event.ticketsSold,
                            i18n.language
                          )}{" "}
                          /{" "}
                          {formatNumberForLocale(
                            event.totalTickets,
                            i18n.language
                          )}
                        </TableCell>
                        <TableCell className="rtl:text-right ltr:text-left">
                          {formatNumberForLocale(event.revenue, i18n.language)}{" "}
                          EGP
                        </TableCell>
                        <TableCell>
                          {event.rating ? (
                            <div className="flex items-center gap-1 rtl:flex-row-reverse">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{event.rating}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rtl:text-right ltr:text-left"
                            >
                              <DropdownMenuLabel>
                                {t("admin.organizers.events.actions")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingEvent(event);
                                  setIsEditEventDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {t("admin.organizers.actions.editEvent")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setOrganizerEvents((prevEvents) =>
                                    prevEvents.filter((e) => e.id !== event.id)
                                  );
                                  toast({
                                    title: t(
                                      "admin.organizers.toast.eventDeleted"
                                    ),
                                    description: t(
                                      "admin.organizers.toast.eventDeletedDesc"
                                    ),
                                  });
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {t("admin.organizers.actions.deleteEvent")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEventsDialogOpen(false)}
            >
              {t("admin.organizers.events.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog
        open={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="rtl:text-right">
            <DialogTitle>{t("admin.organizers.events.add.title")}</DialogTitle>
            <DialogDescription>
              {t("admin.organizers.events.add.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.name")} *
                </label>
                <Input
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder={t("admin.organizers.events.add.namePlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.category")} *
                </label>
                <Select
                  value={newEvent.category || ""}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin.organizers.events.add.selectCategory"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.date")} *
                </label>
                <Input
                  type="date"
                  value={newEvent.date || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.time")}
                </label>
                <Input
                  type="time"
                  value={newEvent.time || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.totalTickets")}
                </label>
                <Input
                  type="number"
                  value={newEvent.totalTickets || 0}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      totalTickets: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.ticketLimit")}
                </label>
                <Input
                  type="number"
                  value={newEvent.ticketLimit || 1}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      ticketLimit: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.location")} *
                </label>
                <Input
                  value={newEvent.location || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  placeholder={t(
                    "admin.organizers.events.add.locationPlaceholder"
                  )}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.description")}
                </label>
                <Input
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder={t(
                    "admin.organizers.events.add.descriptionPlaceholder"
                  )}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:flex-row-reverse rtl:space-x-reverse">
              <Switch
                checked={newEvent.ticketTransferEnabled || false}
                onCheckedChange={(checked) =>
                  setNewEvent({ ...newEvent, ticketTransferEnabled: checked })
                }
              />
              <span className="text-sm">
                {t("admin.organizers.events.add.enableTicketTransfers")}
              </span>
            </div>

            {/* Commission Rate Configuration */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 rtl:text-right">
                {t("admin.organizers.events.add.commissionRateConfig")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.organizers.events.add.commissionType")}
                  </label>
                  <Select
                    value={newEvent.commissionRate?.type || "percentage"}
                    onValueChange={(value) =>
                      setNewEvent({
                        ...newEvent,
                        commissionRate: {
                          ...newEvent.commissionRate,
                          type: value as "percentage" | "flat",
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Fee (E£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.organizers.events.add.commissionValue")}
                  </label>
                  <Input
                    type="number"
                    value={newEvent.commissionRate?.value || 10}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        commissionRate: {
                          ...newEvent.commissionRate,
                          value: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder={
                      newEvent.commissionRate?.type === "percentage"
                        ? "10"
                        : "50"
                    }
                  />
                </div>
              </div>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-800">
                  <strong>
                    {t("admin.organizers.events.add.commissionCalculation")}:
                  </strong>
                  {newEvent.commissionRate?.type === "percentage" ? (
                    <span>
                      {" "}
                      {newEvent.commissionRate?.value || 10}%{" "}
                      {t("admin.organizers.events.add.ofTotalRevenue")}
                    </span>
                  ) : (
                    <span>
                      {" "}
                      E£{newEvent.commissionRate?.value || 50} ×{" "}
                      {t("admin.organizers.events.add.numberOfTicketsSold")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Transfer Fee Configuration */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 rtl:text-right">
                {t("admin.organizers.events.add.transferFeeConfig")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.organizers.events.add.transferFeeType")}
                  </label>
                  <Select
                    value={newEvent.transferFee?.type || "percentage"}
                    onValueChange={(value) =>
                      setNewEvent({
                        ...newEvent,
                        transferFee: {
                          ...newEvent.transferFee,
                          type: value as "percentage" | "flat",
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Fee (E£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.organizers.events.add.transferFeeValue")}
                  </label>
                  <Input
                    type="number"
                    value={newEvent.transferFee?.value || 5}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        transferFee: {
                          ...newEvent.transferFee,
                          value: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder={
                      newEvent.transferFee?.type === "percentage" ? "5" : "25"
                    }
                  />
                </div>
              </div>
              <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-800">
                  <strong>
                    {t("admin.organizers.events.add.transferFeeCalculation")}:
                  </strong>
                  {newEvent.transferFee?.type === "percentage" ? (
                    <span>
                      {" "}
                      {newEvent.transferFee?.value || 5}%{" "}
                      {t(
                        "admin.organizers.events.add.ofTicketPriceWhenTransferred"
                      )}
                    </span>
                  ) : (
                    <span>
                      {" "}
                      E£{newEvent.transferFee?.value || 25}{" "}
                      {t("admin.organizers.events.add.perTicketTransfer")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Event Image */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 rtl:text-right">
                {t("admin.organizers.events.add.eventImage")}
              </h4>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.organizers.events.add.imageUrl")}
                </label>
                <Input
                  type="url"
                  value={newEvent.imageUrl || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, imageUrl: e.target.value })
                  }
                  placeholder={t(
                    "admin.organizers.events.add.imageUrlPlaceholder"
                  )}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddEventDialogOpen(false);
                setNewEvent({
                  commissionRate: {
                    type: "percentage",
                    value: 10,
                  },
                  transferFee: {
                    type: "percentage",
                    value: 5,
                  },
                  ticketTransferEnabled: false,
                  ticketLimit: 1,
                });
              }}
            >
              {t("admin.organizers.events.add.cancel")}
            </Button>
            <Button
              onClick={() => {
                // Validate required fields
                if (
                  !newEvent.title ||
                  !newEvent.date ||
                  !newEvent.location ||
                  !newEvent.category
                ) {
                  toast({
                    title: t("admin.organizers.toast.validationError"),
                    description: t(
                      "admin.organizers.toast.validationErrorDesc"
                    ),
                    variant: "destructive",
                  });
                  return;
                }

                // Create new event object
                const eventToAdd: OrganizerEvent = {
                  id: `E${String(organizerEvents.length + 1).padStart(3, "0")}`,
                  title: newEvent.title,
                  date: newEvent.date,
                  status: "upcoming",
                  ticketsSold: 0,
                  totalTickets: newEvent.totalTickets || 0,
                  revenue: 0,
                  commission: 0,
                  rating: 0,
                  image:
                    newEvent.imageUrl || "/public/Portrait_Placeholder.png",
                  description: newEvent.description || "",
                  location: newEvent.location,
                  price: 0,
                };

                setOrganizerEvents((prevEvents) => [...prevEvents, eventToAdd]);
                toast({
                  title: t("admin.organizers.toast.eventAdded"),
                  description: t("admin.organizers.toast.eventAddedDesc"),
                });
                setIsAddEventDialogOpen(false);
                setNewEvent({
                  commissionRate: {
                    type: "percentage",
                    value: 10,
                  },
                  transferFee: {
                    type: "percentage",
                    value: 5,
                  },
                  ticketTransferEnabled: false,
                  ticketLimit: 1,
                });
              }}
            >
              {t("admin.organizers.events.add.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog
        open={isEditEventDialogOpen}
        onOpenChange={setIsEditEventDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
              <Edit className="h-5 w-5" />
              {t("admin.organizers.events.edit.title")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.organizers.events.edit.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.title")}
                  </label>
                  <Input
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        title: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.date")}
                  </label>
                  <Input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.status")}
                  </label>
                  <Select
                    value={editingEvent.status}
                    onValueChange={(value) =>
                      setEditingEvent({ ...editingEvent, status: value as any })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">
                        {t("admin.organizers.events.status.upcoming")}
                      </SelectItem>
                      <SelectItem value="ongoing">
                        {t("admin.organizers.events.status.ongoing")}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("admin.organizers.events.status.completed")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("admin.organizers.events.status.cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.ticketsSold")}
                  </label>
                  <Input
                    type="number"
                    value={editingEvent.ticketsSold}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        ticketsSold: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.totalTickets")}
                  </label>
                  <Input
                    type="number"
                    value={editingEvent.totalTickets}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        totalTickets: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.revenue")}
                  </label>
                  <Input
                    type="number"
                    value={editingEvent.revenue}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        revenue: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.commission")}
                  </label>
                  <Input
                    type="number"
                    value={editingEvent.commission}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        commission: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.rating")}
                  </label>
                  <Input
                    type="number"
                    value={editingEvent.rating}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        rating: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.image")}
                  </label>
                  <Input
                    type="url"
                    value={editingEvent.image}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        image: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.description")}
                  </label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description: e.target.value,
                      })
                    }
                    className="w-full mt-1 p-3 border rounded-md resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.location")}
                  </label>
                  <Input
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("admin.organizers.events.edit.price")}
                  </label>
                  <Input
                    type="number"
                    value={editingEvent.price}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        price: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditEventDialogOpen(false)}
            >
              {t("admin.organizers.events.edit.cancel")}
            </Button>
            <Button
              onClick={() => {
                setOrganizerEvents((prevEvents) =>
                  prevEvents.map((event) =>
                    event.id === editingEvent.id ? editingEvent : event
                  )
                );
                toast({
                  title: t("admin.organizers.toast.eventUpdated"),
                  description: t("admin.organizers.toast.eventUpdatedDesc"),
                });
                setIsEditEventDialogOpen(false);
                setEditingEvent(null);
              }}
            >
              {t("admin.organizers.events.edit.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Activity Dialog */}
      <Dialog
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
              <Activity className="h-5 w-5" />
              {t("admin.organizers.activity.title")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.organizers.activity.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedOrganizer && (
            <div className="space-y-4">
              <div className="space-y-3">
                {organizerActivities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 rtl:space-x-reverse">
                          {getActivityStatusIcon(activity.status)}
                          <div className="rtl:text-right ltr:text-left">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            {activity.eventTitle && (
                              <p className="text-sm text-blue-600">
                                {activity.eventTitle}
                              </p>
                            )}
                            {activity.amount && (
                              <p className="text-sm text-green-600">
                                {formatNumberForLocale(
                                  activity.amount,
                                  i18n.language
                                )}{" "}
                                EGP
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground rtl:text-right ltr:text-left">
                          {formatDateTimeForLocale(activity.timestamp)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActivityDialogOpen(false)}
            >
              {t("admin.organizers.activity.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizersManagement;
