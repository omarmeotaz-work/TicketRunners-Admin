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
  Mail,
  Phone,
  Calendar,
  DollarSign,
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
  TrendingUp,
  CreditCard,
  Ticket,
  MapPin,
  Star,
  StarOff,
  Repeat,
  Activity,
  Ban,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  formatNumberForLocale,
  formatCurrencyForLocale,
  formatPhoneNumberForLocale,
} from "@/lib/utils";
import { ExportDialog } from "@/components/ui/export-dialog";
import { commonColumns } from "@/lib/exportUtils";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "banned";
  registrationDate: string;
  lastLogin: string;
  totalBookings: number;
  totalSpent: number;
  nfcCardId?: string;
  attendedEvents: number;
  recurrentUser: boolean;
  location: string;
  profileImage?: string;
};

type CustomerBooking = {
  id: string;
  eventTitle: string;
  date: string;
  amount: number;
  status: "confirmed" | "cancelled" | "refunded";
};

type CustomerActivity = {
  id: string;
  type: "login" | "booking" | "checkin" | "payment" | "refund";
  description: string;
  timestamp: string;
  eventTitle?: string;
  amount?: number;
};

const CustomerManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showBookingsDialog, setShowBookingsDialog] = useState(false);
  const [showNfcCardDialog, setShowNfcCardDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showEditBookingDialog, setShowEditBookingDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<CustomerBooking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get current locale for date formatting
  const currentLocale = i18n.language === "ar" ? ar : enUS;

  // Format date for current locale
  const formatDateForLocale = (
    dateString: string,
    formatString: string = "MMM dd, yyyy"
  ) => {
    try {
      return format(parseISO(dateString), formatString, {
        locale: currentLocale,
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format time for current locale
  const formatTimeForLocale = (
    dateString: string,
    formatString: string = "HH:mm"
  ) => {
    try {
      return format(parseISO(dateString), formatString, {
        locale: currentLocale,
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format number for current locale
  const formatNumber = (number: number) => {
    return formatNumberForLocale(number, i18n.language);
  };

  // Format currency for current locale
  const formatCurrency = (amount: number) => {
    return formatCurrencyForLocale(amount, i18n.language);
  };

  // Format phone number for current locale
  const formatPhone = (phoneNumber: string) => {
    return formatPhoneNumberForLocale(phoneNumber, i18n.language);
  };

  // Mock customers data
  const customers: Customer[] = [
    {
      id: "C001",
      name: "Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      phone: "+20 10 1234 5678",
      status: "active",
      registrationDate: "2024-01-15",
      lastLogin: "2025-08-16T10:30:00",
      totalBookings: 8,
      totalSpent: 2500,
      nfcCardId: "NFC-001-2025",
      attendedEvents: 6,
      recurrentUser: true,
      location: "Cairo, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C002",
      name: "Sarah Mohamed",
      email: "sarah.mohamed@example.com",
      phone: "+20 10 2345 6789",
      status: "active",
      registrationDate: "2024-02-20",
      lastLogin: "2025-08-15T15:45:00",
      totalBookings: 5,
      totalSpent: 1800,
      nfcCardId: "NFC-002-2025",
      attendedEvents: 4,
      recurrentUser: true,
      location: "Alexandria, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C003",
      name: "Omar Ali",
      email: "omar.ali@example.com",
      phone: "+20 10 3456 7890",
      status: "inactive",
      registrationDate: "2024-03-10",
      lastLogin: "2025-07-20T09:15:00",
      totalBookings: 3,
      totalSpent: 900,
      attendedEvents: 2,
      recurrentUser: false,
      location: "Giza, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C004",
      name: "Fatima Ahmed",
      email: "fatima.ahmed@example.com",
      phone: "+20 10 4567 8901",
      status: "banned",
      registrationDate: "2024-04-05",
      lastLogin: "2025-06-15T14:20:00",
      totalBookings: 2,
      totalSpent: 600,
      attendedEvents: 1,
      recurrentUser: false,
      location: "Cairo, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C005",
      name: "Youssef Ibrahim",
      email: "youssef.ibrahim@example.com",
      phone: "+20 10 5678 9012",
      status: "active",
      registrationDate: "2024-05-12",
      lastLogin: "2025-08-16T11:00:00",
      totalBookings: 12,
      totalSpent: 4200,
      nfcCardId: "NFC-005-2025",
      attendedEvents: 10,
      recurrentUser: true,
      location: "Cairo, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C006",
      name: "Mariam Khalil",
      email: "mariam.khalil@example.com",
      phone: "+20 10 6789 0123",
      status: "active",
      registrationDate: "2024-06-18",
      lastLogin: "2025-08-17T14:30:00",
      totalBookings: 6,
      totalSpent: 1800,
      nfcCardId: "NFC-006-2025",
      attendedEvents: 5,
      recurrentUser: true,
      location: "Alexandria, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C007",
      name: "Karim Hassan",
      email: "karim.hassan@example.com",
      phone: "+20 10 7890 1234",
      status: "inactive",
      registrationDate: "2024-07-05",
      lastLogin: "2025-07-25T16:45:00",
      totalBookings: 4,
      totalSpent: 1200,
      attendedEvents: 3,
      recurrentUser: false,
      location: "Giza, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C008",
      name: "Layla Ahmed",
      email: "layla.ahmed@example.com",
      phone: "+20 10 8901 2345",
      status: "banned",
      registrationDate: "2024-08-20",
      lastLogin: "2025-07-10T12:20:00",
      totalBookings: 2,
      totalSpent: 600,
      attendedEvents: 1,
      recurrentUser: false,
      location: "Cairo, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C009",
      name: "Hassan Ali",
      email: "hassan.ali@example.com",
      phone: "+20 10 9012 3456",
      status: "active",
      registrationDate: "2024-09-01",
      lastLogin: "2025-08-18T09:15:00",
      totalBookings: 9,
      totalSpent: 2700,
      nfcCardId: "NFC-008-2025",
      attendedEvents: 7,
      recurrentUser: true,
      location: "Cairo, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C010",
      name: "Nour Ibrahim",
      email: "nour.ibrahim@example.com",
      phone: "+20 10 0123 4567",
      status: "active",
      registrationDate: "2024-10-15",
      lastLogin: "2025-08-19T10:30:00",
      totalBookings: 7,
      totalSpent: 2100,
      nfcCardId: "NFC-010-2025",
      attendedEvents: 6,
      recurrentUser: true,
      location: "Alexandria, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C011",
      name: "Amira Mohamed",
      email: "amira.mohamed@example.com",
      phone: "+20 10 1234 5678",
      status: "inactive",
      registrationDate: "2024-11-08",
      lastLogin: "2025-08-15T11:00:00",
      totalBookings: 3,
      totalSpent: 900,
      attendedEvents: 2,
      recurrentUser: false,
      location: "Giza, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C012",
      name: "Omar Khalil",
      email: "omar.khalil@example.com",
      phone: "+20 10 2345 6789",
      status: "active",
      registrationDate: "2024-12-12",
      lastLogin: "2025-08-20T15:45:00",
      totalBookings: 11,
      totalSpent: 3300,
      nfcCardId: "NFC-013-2025",
      attendedEvents: 9,
      recurrentUser: true,
      location: "Cairo, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C013",
      name: "Fatima Hassan",
      email: "fatima.hassan@example.com",
      phone: "+20 10 3456 7890",
      status: "active",
      registrationDate: "2025-01-20",
      lastLogin: "2025-08-21T13:20:00",
      totalBookings: 5,
      totalSpent: 1500,
      nfcCardId: "NFC-014-2025",
      attendedEvents: 4,
      recurrentUser: true,
      location: "Alexandria, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C014",
      name: "Youssef Ali",
      email: "youssef.ali@example.com",
      phone: "+20 10 4567 8901",
      status: "banned",
      registrationDate: "2025-02-14",
      lastLogin: "2025-08-05T09:30:00",
      totalBookings: 1,
      totalSpent: 300,
      attendedEvents: 0,
      recurrentUser: false,
      location: "Giza, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "C015",
      name: "Sara Khalil",
      email: "sara.khalil@example.com",
      phone: "+20 10 5678 9012",
      status: "active",
      registrationDate: "2025-03-10",
      lastLogin: "2025-08-22T16:10:00",
      totalBookings: 8,
      totalSpent: 2400,
      nfcCardId: "NFC-015-2025",
      attendedEvents: 6,
      recurrentUser: true,
      location: "Cairo, Egypt",
      profileImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ];

  // Mock customer bookings
  const customerBookings: CustomerBooking[] = [
    {
      id: "B001",
      eventTitle: "Summer Music Festival",
      date: "2025-08-15",
      amount: 500,
      status: "confirmed",
    },
    {
      id: "B002",
      eventTitle: "Tech Innovators Meetup",
      date: "2025-09-01",
      amount: 200,
      status: "confirmed",
    },
    {
      id: "B003",
      eventTitle: "Stand-up Comedy Night",
      date: "2025-08-22",
      amount: 450,
      status: "cancelled",
    },
  ];

  // Mock customer activities
  const customerActivities: CustomerActivity[] = [
    {
      id: "A001",
      type: "login",
      description: t("admin.customers.activity.login"),
      timestamp: "2025-08-16T10:30:00",
    },
    {
      id: "A002",
      type: "booking",
      description: t("admin.customers.activity.booking", {
        event: "Summer Music Festival",
      }),
      timestamp: "2025-07-15T14:20:00",
      eventTitle: "Summer Music Festival",
      amount: 500,
    },
    {
      id: "A003",
      type: "checkin",
      description: t("admin.customers.activity.checkin"),
      timestamp: "2025-08-15T18:30:00",
      eventTitle: "Summer Music Festival",
    },
    {
      id: "A004",
      type: "payment",
      description: t("admin.customers.activity.payment"),
      timestamp: "2025-07-15T14:25:00",
      amount: 500,
    },
  ];

  // Filter customers based on search and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || customer.status === statusFilter;
      const matchesLocation =
        locationFilter === "all" || customer.location.includes(locationFilter);

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [customers, searchTerm, statusFilter, locationFilter]);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    return [...new Set(customers.map((customer) => customer.location))];
  }, [customers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, locationFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("admin.customers.status.active");
      case "inactive":
        return t("admin.customers.status.inactive");
      case "banned":
        return t("admin.customers.status.banned");
      default:
        return status;
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "login":
        return <User className="h-4 w-4" />;
      case "booking":
        return <Ticket className="h-4 w-4" />;
      case "checkin":
        return <CheckCircle className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "refund":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    toast({
      title: t("admin.customers.toast.customerDeleted"),
      description: t("admin.customers.toast.customerDeletedDesc"),
    });
  };

  const handleExportCustomers = () => {
    toast({
      title: t("admin.customers.toast.exportSuccess"),
      description: t("admin.customers.toast.exportSuccessDesc"),
    });
  };

  const handleDeactivateCustomer = (customerId: string) => {
    toast({
      title: t("admin.customers.toast.customerDeactivated"),
      description: t("admin.customers.toast.customerDeactivatedDesc"),
    });
  };

  const handleReactivateCustomer = (customerId: string) => {
    toast({
      title: t("admin.customers.toast.customerReactivated"),
      description: t("admin.customers.toast.customerReactivatedDesc"),
    });
  };

  const handleBanCustomer = (customerId: string) => {
    toast({
      title: t("admin.customers.toast.customerBanned"),
      description: t("admin.customers.toast.customerBannedDesc"),
    });
  };

  const handleUnbanCustomer = (customerId: string) => {
    toast({
      title: t("admin.customers.toast.customerUnbanned"),
      description: t("admin.customers.toast.customerUnbannedDesc"),
    });
  };

  const handleForcePasswordReset = (customerId: string) => {
    toast({
      title: t("admin.customers.toast.passwordReset"),
      description: t("admin.customers.toast.passwordResetDesc"),
    });
  };

  const handleViewBookings = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowBookingsDialog(true);
    }
  };

  const handleViewNfcCard = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowNfcCardDialog(true);
    }
  };

  const handleViewActivity = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowActivityDialog(true);
    }
  };

  const handleAddCustomer = () => {
    toast({
      title: t("admin.customers.toast.customerAdded"),
      description: t("admin.customers.toast.customerAddedDesc"),
    });
    setIsAddDialogOpen(false);
  };

  const handleSaveCustomerChanges = () => {
    toast({
      title: t("admin.customers.toast.customerUpdated"),
      description: t("admin.customers.toast.customerUpdatedDesc"),
    });
    setIsEditDialogOpen(false);
  };

  const handleEditBooking = (booking: CustomerBooking) => {
    setSelectedBooking(booking);
    setShowEditBookingDialog(true);
  };

  const handleSaveBookingChanges = () => {
    toast({
      title: t("admin.customers.toast.bookingUpdated"),
      description: t("admin.customers.toast.bookingUpdatedDesc"),
    });
    setShowEditBookingDialog(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    toast({
      title: t("admin.customers.toast.bookingCancelled"),
      description: t("admin.customers.toast.bookingCancelledDesc"),
    });
  };

  const handleRefundBooking = (bookingId: string) => {
    toast({
      title: t("admin.customers.toast.bookingRefunded"),
      description: t("admin.customers.toast.bookingRefundedDesc"),
    });
  };

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.customers.title")}
          </h2>
          <p className="text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.customers.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDialog
            data={filteredCustomers}
            columns={commonColumns.customers}
            title={t("admin.customers.title")}
            subtitle={t("admin.customers.subtitle")}
            filename="customers"
            filters={{
              search: searchTerm,
              status: statusFilter,
              location: locationFilter,
            }}
            onExport={(format) => {
              toast({
                title: t("admin.customers.toast.exportSuccess"),
                description: t("admin.customers.toast.exportSuccessDesc"),
              });
            }}
          >
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.customers.actions.export")}
            </Button>
          </ExportDialog>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.customers.actions.addCustomer")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
            <Filter className="h-5 w-5" />
            {t("admin.customers.filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
              <Input
                placeholder={t("admin.customers.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.customers.filters.status")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.customers.filters.allStatus")}
                </SelectItem>
                <SelectItem value="active">
                  {t("admin.customers.filters.active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("admin.customers.filters.inactive")}
                </SelectItem>
                <SelectItem value="banned">
                  {t("admin.customers.filters.banned")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.customers.filters.location")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.customers.filters.allLocations")}
                </SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="rtl:text-right ltr:text-left">
            {t("admin.customers.table.customer")} (
            {formatNumber(filteredCustomers.length)})
          </CardTitle>
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            <span className="text-sm text-muted-foreground">
              {t("admin.customers.pagination.showing")} {startIndex + 1}-
              {Math.min(endIndex, filteredCustomers.length)}{" "}
              {t("admin.customers.pagination.of")} {filteredCustomers.length}
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
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
                    {t("admin.customers.table.customer")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.customers.table.contact")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.customers.table.status")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.customers.table.registration")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.customers.table.lastLogin")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.customers.table.bookings")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.customers.table.spent")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.customers.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img
                          src={
                            customer.profileImage ||
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                          }
                          alt={customer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="rtl:text-right ltr:text-left">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.customers.table.id")}: {customer.id}
                          </p>
                          {customer.recurrentUser && (
                            <Badge variant="outline" className="mt-1">
                              <Repeat className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                              {t("admin.customers.table.recurrent")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right ltr:text-left">
                        <p className="text-sm">{customer.email}</p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {formatPhone(customer.phone)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>
                        {getStatusText(customer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right ltr:text-left">
                        {formatDateForLocale(customer.registrationDate)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right ltr:text-left">
                        {customer.lastLogin
                          ? formatDateForLocale(
                              customer.lastLogin,
                              "MMM dd, HH:mm"
                            )
                          : t("admin.customers.details.never")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right ltr:text-left">
                        <p className="font-medium">
                          {formatNumber(customer.totalBookings)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.customers.table.attended")}:{" "}
                          {formatNumber(customer.attendedEvents)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right ltr:text-left">
                        <p className="font-medium">
                          {formatCurrency(customer.totalSpent)}
                        </p>
                        {customer.nfcCardId && (
                          <p className="text-sm text-muted-foreground">
                            {t("admin.customers.table.nfcCard")}:{" "}
                            {customer.nfcCardId}
                          </p>
                        )}
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
                            {t("admin.customers.table.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.customers.actions.viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.customers.actions.editCustomer")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewBookings(customer.id)}
                          >
                            <Ticket className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.customers.actions.viewBookings")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewNfcCard(customer.id)}
                          >
                            <CreditCard className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.customers.actions.viewNfcCard")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewActivity(customer.id)}
                          >
                            <Activity className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.customers.actions.viewActivity")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {customer.status === "active" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeactivateCustomer(customer.id)
                                }
                                className="text-yellow-600"
                              >
                                <UserX className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {t("admin.customers.actions.deactivate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBanCustomer(customer.id)}
                                className="text-red-600"
                              >
                                <Ban className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {t("admin.customers.actions.banCustomer")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {customer.status === "inactive" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleReactivateCustomer(customer.id)
                              }
                              className="text-green-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                              {t("admin.customers.actions.reactivate")}
                            </DropdownMenuItem>
                          )}
                          {customer.status === "banned" && (
                            <DropdownMenuItem
                              onClick={() => handleUnbanCustomer(customer.id)}
                              className="text-green-600"
                            >
                              <Unlock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                              {t("admin.customers.actions.unbanCustomer")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleForcePasswordReset(customer.id)
                            }
                            className="text-blue-600"
                          >
                            <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.customers.actions.forcePasswordReset")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.customers.actions.deleteCustomer")}
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
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground rtl:text-right">
                {t("admin.customers.pagination.showing")} {startIndex + 1}-
                {Math.min(endIndex, filteredCustomers.length)}{" "}
                {t("admin.customers.pagination.of")} {filteredCustomers.length}{" "}
                {t("admin.customers.pagination.results")}
              </div>
              <Pagination>
                <PaginationContent>
                  {/* First Page */}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    >
                      {t("admin.customers.pagination.first")}
                    </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* First page number */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Ellipsis */}
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Previous page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>

                  {/* Next page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Ellipsis */}
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Last page number */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Last Page */}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(totalPages)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    >
                      {t("admin.customers.pagination.last")}
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="max-w-4xl rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.customerDetails")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.customerDetailsSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="text-center">
                    <img
                      src={
                        selectedCustomer.profileImage ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                      }
                      alt={selectedCustomer.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold rtl:text-right ltr:text-left">
                      {selectedCustomer.name}
                    </h3>
                    <p className="text-muted-foreground rtl:text-right ltr:text-left">
                      {selectedCustomer.email}
                    </p>
                    <Badge className={getStatusColor(selectedCustomer.status)}>
                      {getStatusText(selectedCustomer.status)}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.phone")}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {formatPhone(selectedCustomer.phone)}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.location")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCustomer.location}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.registrationDate")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateForLocale(selectedCustomer.registrationDate)}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.lastLogin")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCustomer.lastLogin
                          ? formatDateForLocale(
                              selectedCustomer.lastLogin,
                              "MMM dd, yyyy HH:mm"
                            )
                          : t("admin.customers.details.never")}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.totalBookings")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(selectedCustomer.totalBookings)}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.totalSpent")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(selectedCustomer.totalSpent)}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.attendedEvents")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(selectedCustomer.attendedEvents)}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.customers.details.nfcCard")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCustomer.nfcCardId ||
                          t("admin.customers.details.noNfcCard")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-semibold mb-4 rtl:text-right ltr:text-left">
                  {t("admin.customers.details.recentActivity")}
                </h4>
                <div className="space-y-2">
                  {customerActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg rtl:space-x-reverse"
                    >
                      {getActivityTypeIcon(activity.type)}
                      <div className="flex-1 rtl:text-right ltr:text-left">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        {activity.eventTitle && (
                          <p className="text-xs text-muted-foreground">
                            {activity.eventTitle}
                          </p>
                        )}
                      </div>
                      <div className="rtl:text-left ltr:text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDateForLocale(
                            activity.timestamp,
                            "MMM dd, HH:mm"
                          )}
                        </p>
                        {activity.amount && (
                          <p className="text-xs font-medium">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomerDetails(false)}
            >
              {t("admin.customers.dialogs.close")}
            </Button>
            <Button onClick={() => handleEditCustomer(selectedCustomer!)}>
              {t("admin.customers.actions.editCustomer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.editCustomer")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.editCustomerSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.form.name")}
                  </label>
                  <Input defaultValue={selectedCustomer.name} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.form.email")}
                  </label>
                  <Input type="email" defaultValue={selectedCustomer.email} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.form.phone")}
                  </label>
                  <Input defaultValue={selectedCustomer.phone} dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.form.location")}
                  </label>
                  <Input defaultValue={selectedCustomer.location} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.form.status")}
                  </label>
                  <Select defaultValue={selectedCustomer.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("admin.customers.status.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("admin.customers.status.inactive")}
                      </SelectItem>
                      <SelectItem value="banned">
                        {t("admin.customers.status.banned")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 rtl:text-right ltr:text-left">
                  {t("admin.customers.form.passwordSection")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium rtl:text-right ltr:text-left">
                      {t("admin.customers.form.newPassword")}
                    </label>
                    <Input
                      type="password"
                      placeholder={t(
                        "admin.customers.form.newPasswordPlaceholder"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium rtl:text-right ltr:text-left">
                      {t("admin.customers.form.confirmPassword")}
                    </label>
                    <Input
                      type="password"
                      placeholder={t(
                        "admin.customers.form.confirmPasswordPlaceholder"
                      )}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 rtl:text-right ltr:text-left">
                  {t("admin.customers.form.passwordNote")}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("admin.customers.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveCustomerChanges}>
              {t("admin.customers.dialogs.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.addCustomer")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.addCustomerSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.customers.form.name")}
                </label>
                <Input
                  placeholder={t("admin.customers.form.namePlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.customers.form.email")}
                </label>
                <Input
                  type="email"
                  placeholder={t("admin.customers.form.emailPlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.customers.form.phone")}
                </label>
                <Input
                  placeholder={t("admin.customers.form.phonePlaceholder")}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.customers.form.location")}
                </label>
                <Input
                  placeholder={t("admin.customers.form.locationPlaceholder")}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 rtl:text-right ltr:text-left">
                {t("admin.customers.form.passwordSection")}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.form.newPassword")}
                  </label>
                  <Input
                    type="password"
                    placeholder={t(
                      "admin.customers.form.newPasswordPlaceholder"
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.form.confirmPassword")}
                  </label>
                  <Input
                    type="password"
                    placeholder={t(
                      "admin.customers.form.confirmPasswordPlaceholder"
                    )}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 rtl:text-right ltr:text-left">
                {t("admin.customers.form.passwordRequired")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("admin.customers.dialogs.cancel")}
            </Button>
            <Button onClick={handleAddCustomer}>
              {t("admin.customers.dialogs.addCustomerButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bookings Dialog */}
      <Dialog open={showBookingsDialog} onOpenChange={setShowBookingsDialog}>
        <DialogContent className="max-w-4xl rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.viewBookings")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {selectedCustomer &&
                `${t("admin.customers.dialogs.viewBookingsFor")} ${
                  selectedCustomer.name
                }`}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <img
                    src={
                      selectedCustomer.profileImage ||
                      "/public/Portrait_Placeholder.png"
                    }
                    alt={selectedCustomer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="text-sm font-medium">
                    {t("admin.customers.bookings.totalBookings")}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatNumber(selectedCustomer.totalBookings)}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.customers.bookings.event")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.customers.bookings.date")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.customers.bookings.amount")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.customers.bookings.statusLabel")}
                      </TableHead>
                      <TableHead className="rtl:text-right ltr:text-left">
                        {t("admin.customers.table.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="rtl:text-right ltr:text-left">
                          <div>
                            <p className="font-medium">{booking.eventTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {booking.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="rtl:text-right ltr:text-left">
                          {formatDateForLocale(booking.date)}
                        </TableCell>
                        <TableCell className="rtl:text-right ltr:text-left">
                          {formatCurrency(booking.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {t(
                              `admin.customers.bookings.status.${booking.status}`
                            )}
                          </Badge>
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
                                {t("admin.customers.bookings.actions.title")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEditBooking(booking)}
                              >
                                <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                {t("admin.customers.bookings.actions.edit")}
                              </DropdownMenuItem>
                              {booking.status === "confirmed" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    className="text-yellow-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                    {t(
                                      "admin.customers.bookings.actions.cancel"
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRefundBooking(booking.id)
                                    }
                                    className="text-red-600"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                    {t(
                                      "admin.customers.bookings.actions.refund"
                                    )}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {booking.status === "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() => handleEditBooking(booking)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                  {t(
                                    "admin.customers.bookings.actions.reactivate"
                                  )}
                                </DropdownMenuItem>
                              )}
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
              onClick={() => setShowBookingsDialog(false)}
            >
              {t("admin.customers.dialogs.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View NFC Card Dialog */}
      <Dialog open={showNfcCardDialog} onOpenChange={setShowNfcCardDialog}>
        <DialogContent className="max-w-2xl rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.viewNfcCard")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {selectedCustomer &&
                `${t("admin.customers.dialogs.viewNfcCardFor")} ${
                  selectedCustomer.name
                }`}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <img
                  src={
                    selectedCustomer.profileImage ||
                    "/public/Portrait_Placeholder.png"
                  }
                  alt={selectedCustomer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              {selectedCustomer.nfcCardId ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
                        <CreditCard className="h-5 w-5" />
                        {t("admin.customers.nfcCard.details")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rtl:text-right ltr:text-left">
                          <p className="text-sm font-medium">
                            {t("admin.customers.nfcCard.cardId")}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {selectedCustomer.nfcCardId}
                          </p>
                        </div>
                        <div className="rtl:text-right ltr:text-left">
                          <p className="text-sm font-medium">
                            {t("admin.customers.nfcCard.status")}
                          </p>
                          <Badge className="bg-green-100 text-green-800">
                            {t("admin.customers.nfcCard.active")}
                          </Badge>
                        </div>
                        <div className="rtl:text-right ltr:text-left">
                          <p className="text-sm font-medium">
                            {t("admin.customers.nfcCard.issuedDate")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateForLocale(
                              selectedCustomer.registrationDate
                            )}
                          </p>
                        </div>
                        <div className="rtl:text-right ltr:text-left">
                          <p className="text-sm font-medium">
                            {t("admin.customers.nfcCard.lastUsed")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCustomer.lastLogin
                              ? formatDateForLocale(
                                  selectedCustomer.lastLogin,
                                  "MMM dd, yyyy HH:mm"
                                )
                              : t("admin.customers.details.never")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="rtl:text-right ltr:text-left">
                        {t("admin.customers.nfcCard.usage")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatNumber(selectedCustomer.attendedEvents)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.customers.nfcCard.eventsAttended")}
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {formatNumber(selectedCustomer.totalBookings)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.customers.nfcCard.totalBookings")}
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(selectedCustomer.totalSpent)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("admin.customers.nfcCard.totalSpent")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {t("admin.customers.nfcCard.noCard")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("admin.customers.nfcCard.noCardDesc")}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t("admin.customers.nfcCard.issueCard")}
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNfcCardDialog(false)}
            >
              {t("admin.customers.dialogs.close")}
            </Button>
            {selectedCustomer?.nfcCardId && (
              <Button variant="destructive">
                <Ban className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t("admin.customers.nfcCard.deactivate")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.viewActivity")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {selectedCustomer &&
                `${t("admin.customers.dialogs.viewActivityFor")} ${
                  selectedCustomer.name
                }`}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <img
                    src={
                      selectedCustomer.profileImage ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                    }
                    alt={selectedCustomer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="text-sm font-medium">
                    {t("admin.customers.activity.totalActivities")}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatNumber(customerActivities.length)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    {t("admin.customers.activity.recentActivity")}
                  </h3>
                </div>

                <div className="space-y-3">
                  {customerActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 rtl:space-x-reverse"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {getActivityTypeIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateForLocale(
                              activity.timestamp,
                              "MMM dd, HH:mm"
                            )}
                          </p>
                        </div>
                        {activity.eventTitle && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("admin.customers.activity.event")}:{" "}
                            {activity.eventTitle}
                          </p>
                        )}
                        {activity.amount && (
                          <p className="text-sm font-medium text-green-600 mt-1">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm rtl:text-right ltr:text-left">
                      {t("admin.customers.activity.activityTypes")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.logins")}
                        </span>
                        <Badge variant="outline">1</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.bookings")}
                        </span>
                        <Badge variant="outline">1</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.checkins")}
                        </span>
                        <Badge variant="outline">1</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.payments")}
                        </span>
                        <Badge variant="outline">1</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm rtl:text-right ltr:text-left">
                      {t("admin.customers.activity.timeStats")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.lastActivity")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          2 hours ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.avgSession")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          45 min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.totalSessions")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          12
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm rtl:text-right ltr:text-left">
                      {t("admin.customers.activity.deviceInfo")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.lastDevice")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          iPhone 15
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.browser")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Safari
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {t("admin.customers.activity.location")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Cairo, EG
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActivityDialog(false)}
            >
              {t("admin.customers.dialogs.close")}
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.customers.activity.exportActivity")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog
        open={showEditBookingDialog}
        onOpenChange={setShowEditBookingDialog}
      >
        <DialogContent className="max-w-2xl rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.customers.dialogs.editBooking")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {selectedBooking &&
                `${t("admin.customers.dialogs.editBookingFor")} ${
                  selectedBooking.eventTitle
                }`}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.bookings.event")}
                  </label>
                  <Input defaultValue={selectedBooking.eventTitle} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.bookings.date")}
                  </label>
                  <Input type="date" defaultValue={selectedBooking.date} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.bookings.amount")}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={selectedBooking.amount.toString()}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.customers.bookings.statusLabel")}
                  </label>
                  <Select defaultValue={selectedBooking.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">
                        {t("admin.customers.bookings.status.confirmed")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("admin.customers.bookings.status.cancelled")}
                      </SelectItem>
                      <SelectItem value="refunded">
                        {t("admin.customers.bookings.status.refunded")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditBookingDialog(false)}
            >
              {t("admin.customers.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveBookingChanges}>
              {t("admin.customers.dialogs.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
