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
  Ban,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Ticket,
  Calendar,
  DollarSign,
  MoreHorizontal,
  QrCode,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { formatCurrencyForLocale } from "@/lib/utils";

type Ticket = {
  id: string;
  eventId: string;
  eventTitle: string;
  customerId: string;
  customerName: string;
  category: string;
  price: number;
  purchaseDate: string;
  status: "valid" | "used" | "refunded" | "banned";
  checkInTime?: string;
  dependents: number;
  ticketNumber: string;
  qrCode: string;
};

type CheckInLog = {
  id: string;
  ticketId: string;
  customerName: string;
  eventTitle: string;
  checkInTime: string;
  scanResult: "success" | "already_used" | "invalid" | "expired";
  location: string;
  usherName: string;
};

const TicketsManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [showCheckInLogs, setShowCheckInLogs] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock tickets data
  const tickets: Ticket[] = [
    {
      id: "1",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C001",
      customerName: t("admin.tickets.mock.customer.ahmedHassan"),
      category: "vip",
      price: 500,
      purchaseDate: "2025-07-15",
      status: "valid",
      dependents: 2,
      ticketNumber: "TKT-001-2025",
      qrCode: "QR-001-2025",
    },
    {
      id: "2",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C002",
      customerName: t("admin.tickets.mock.customer.sarahMohamed"),
      category: "regular",
      price: 250,
      purchaseDate: "2025-07-16",
      status: "used",
      checkInTime: "2025-08-15T18:30:00",
      dependents: 0,
      ticketNumber: "TKT-002-2025",
      qrCode: "QR-002-2025",
    },
    {
      id: "3",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C003",
      customerName: t("admin.tickets.mock.customer.omarAli"),
      category: "earlyBird",
      price: 200,
      purchaseDate: "2025-07-20",
      status: "valid",
      dependents: 1,
      ticketNumber: "TKT-003-2025",
      qrCode: "QR-003-2025",
    },
    {
      id: "4",
      eventId: "3",
      eventTitle: t("admin.tickets.mock.standupComedyNight"),
      customerId: "C004",
      customerName: t("admin.tickets.mock.customer.fatimaAhmed"),
      category: "general",
      price: 150,
      purchaseDate: "2025-07-25",
      status: "refunded",
      dependents: 0,
      ticketNumber: "TKT-004-2025",
      qrCode: "QR-004-2025",
    },
    {
      id: "5",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C005",
      customerName: t("admin.tickets.mock.customer.youssefIbrahim"),
      category: "student",
      price: 150,
      purchaseDate: "2025-07-28",
      status: "banned",
      dependents: 0,
      ticketNumber: "TKT-005-2025",
      qrCode: "QR-005-2025",
    },
    {
      id: "6",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C006",
      customerName: "Mariam Khalil",
      category: "vip",
      price: 500,
      purchaseDate: "2025-07-30",
      status: "valid",
      dependents: 3,
      ticketNumber: "TKT-006-2025",
      qrCode: "QR-006-2025",
    },
    {
      id: "7",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C007",
      customerName: "Karim Hassan",
      category: "regular",
      price: 300,
      purchaseDate: "2025-08-01",
      status: "used",
      checkInTime: "2025-09-01T09:15:00",
      dependents: 0,
      ticketNumber: "TKT-007-2025",
      qrCode: "QR-007-2025",
    },
    {
      id: "8",
      eventId: "3",
      eventTitle: t("admin.tickets.mock.standupComedyNight"),
      customerId: "C008",
      customerName: "Layla Ahmed",
      category: "student",
      price: 100,
      purchaseDate: "2025-08-05",
      status: "valid",
      dependents: 1,
      ticketNumber: "TKT-008-2025",
      qrCode: "QR-008-2025",
    },
    {
      id: "9",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C009",
      customerName: "Hassan Ali",
      category: "earlyBird",
      price: 400,
      purchaseDate: "2025-08-10",
      status: "refunded",
      dependents: 0,
      ticketNumber: "TKT-009-2025",
      qrCode: "QR-009-2025",
    },
    {
      id: "10",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C010",
      customerName: "Nour Ibrahim",
      category: "general",
      price: 250,
      purchaseDate: "2025-08-12",
      status: "valid",
      dependents: 2,
      ticketNumber: "TKT-010-2025",
      qrCode: "QR-010-2025",
    },
    {
      id: "11",
      eventId: "3",
      eventTitle: t("admin.tickets.mock.standupComedyNight"),
      customerId: "C011",
      customerName: "Amira Mohamed",
      category: "vip",
      price: 300,
      purchaseDate: "2025-08-15",
      status: "banned",
      dependents: 0,
      ticketNumber: "TKT-011-2025",
      qrCode: "QR-011-2025",
    },
    {
      id: "12",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C012",
      customerName: "Omar Khalil",
      category: "regular",
      price: 250,
      purchaseDate: "2025-08-18",
      status: "used",
      checkInTime: "2025-08-15T20:15:00",
      dependents: 1,
      ticketNumber: "TKT-012-2025",
      qrCode: "QR-012-2025",
    },
    {
      id: "13",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C013",
      customerName: "Fatima Hassan",
      category: "student",
      price: 150,
      purchaseDate: "2025-08-20",
      status: "valid",
      dependents: 0,
      ticketNumber: "TKT-013-2025",
      qrCode: "QR-013-2025",
    },
    {
      id: "14",
      eventId: "3",
      eventTitle: t("admin.tickets.mock.standupComedyNight"),
      customerId: "C014",
      customerName: "Youssef Ali",
      category: "earlyBird",
      price: 120,
      purchaseDate: "2025-08-22",
      status: "valid",
      dependents: 2,
      ticketNumber: "TKT-014-2025",
      qrCode: "QR-014-2025",
    },
    {
      id: "15",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C015",
      customerName: "Sara Khalil",
      category: "general",
      price: 200,
      purchaseDate: "2025-08-25",
      status: "refunded",
      dependents: 0,
      ticketNumber: "TKT-015-2025",
      qrCode: "QR-015-2025",
    },
    {
      id: "16",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C016",
      customerName: "Ahmed Ibrahim",
      category: "vip",
      price: 400,
      purchaseDate: "2025-08-28",
      status: "valid",
      dependents: 1,
      ticketNumber: "TKT-016-2025",
      qrCode: "QR-016-2025",
    },
    {
      id: "17",
      eventId: "3",
      eventTitle: t("admin.tickets.mock.standupComedyNight"),
      customerId: "C017",
      customerName: "Mariam Hassan",
      category: "regular",
      price: 180,
      purchaseDate: "2025-08-30",
      status: "used",
      checkInTime: "2025-09-10T19:30:00",
      dependents: 0,
      ticketNumber: "TKT-017-2025",
      qrCode: "QR-017-2025",
    },
    {
      id: "18",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C018",
      customerName: "Karim Mohamed",
      category: "student",
      price: 150,
      purchaseDate: "2025-09-01",
      status: "valid",
      dependents: 1,
      ticketNumber: "TKT-018-2025",
      qrCode: "QR-018-2025",
    },
    {
      id: "19",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C019",
      customerName: "Layla Ali",
      category: "earlyBird",
      price: 200,
      purchaseDate: "2025-09-03",
      status: "banned",
      dependents: 0,
      ticketNumber: "TKT-019-2025",
      qrCode: "QR-019-2025",
    },
    {
      id: "20",
      eventId: "3",
      eventTitle: t("admin.tickets.mock.standupComedyNight"),
      customerId: "C020",
      customerName: "Hassan Khalil",
      category: "general",
      price: 150,
      purchaseDate: "2025-09-05",
      status: "valid",
      dependents: 2,
      ticketNumber: "TKT-020-2025",
      qrCode: "QR-020-2025",
    },
    {
      id: "21",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C021",
      customerName: "Nour Ibrahim",
      category: "vip",
      price: 500,
      purchaseDate: "2025-09-08",
      status: "valid",
      dependents: 3,
      ticketNumber: "TKT-021-2025",
      qrCode: "QR-021-2025",
    },
    {
      id: "22",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C022",
      customerName: "Amira Hassan",
      category: "regular",
      price: 300,
      purchaseDate: "2025-09-10",
      status: "used",
      checkInTime: "2025-09-01T10:45:00",
      dependents: 0,
      ticketNumber: "TKT-022-2025",
      qrCode: "QR-022-2025",
    },
    {
      id: "23",
      eventId: "3",
      eventTitle: t("admin.tickets.mock.standupComedyNight"),
      customerId: "C023",
      customerName: "Omar Khalil",
      category: "student",
      price: 100,
      purchaseDate: "2025-09-12",
      status: "valid",
      dependents: 1,
      ticketNumber: "TKT-023-2025",
      qrCode: "QR-023-2025",
    },
    {
      id: "24",
      eventId: "1",
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      customerId: "C024",
      customerName: "Fatima Ali",
      category: "earlyBird",
      price: 400,
      purchaseDate: "2025-09-15",
      status: "refunded",
      dependents: 0,
      ticketNumber: "TKT-024-2025",
      qrCode: "QR-024-2025",
    },
    {
      id: "25",
      eventId: "2",
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      customerId: "C025",
      customerName: "Youssef Mohamed",
      category: "general",
      price: 250,
      purchaseDate: "2025-09-18",
      status: "valid",
      dependents: 2,
      ticketNumber: "TKT-025-2025",
      qrCode: "QR-025-2025",
    },
  ];

  // Mock check-in logs
  const checkInLogs: CheckInLog[] = [
    {
      id: "1",
      ticketId: "2",
      customerName: t("admin.tickets.mock.customer.sarahMohamed"),
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      checkInTime: "2025-08-15T18:30:00",
      scanResult: "success",
      location: t("admin.tickets.mock.location.mainGate"),
      usherName: t("admin.tickets.mock.usher.usher1"),
    },
    {
      id: "2",
      ticketId: "3",
      customerName: t("admin.tickets.mock.customer.omarAli"),
      eventTitle: t("admin.tickets.mock.techInnovatorsMeetup"),
      checkInTime: "2025-09-01T10:15:00",
      scanResult: "success",
      location: t("admin.tickets.mock.location.entranceA"),
      usherName: t("admin.tickets.mock.usher.usher2"),
    },
    {
      id: "3",
      ticketId: "1",
      customerName: t("admin.tickets.mock.customer.ahmedHassan"),
      eventTitle: t("admin.tickets.mock.summerMusicFestival"),
      checkInTime: "2025-08-15T19:45:00",
      scanResult: "already_used",
      location: t("admin.tickets.mock.location.mainGate"),
      usherName: t("admin.tickets.mock.usher.usher1"),
    },
  ];

  // Filter tickets based on search and filters
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEvent =
        eventFilter === "all" || ticket.eventId === eventFilter;
      const matchesCategory =
        categoryFilter === "all" || ticket.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesDate =
        dateFilter === "all" || ticket.purchaseDate.includes(dateFilter);

      return (
        matchesSearch &&
        matchesEvent &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    tickets,
    searchTerm,
    eventFilter,
    categoryFilter,
    statusFilter,
    dateFilter,
  ]);

  // Get unique values for filters
  const uniqueEvents = useMemo(() => {
    return [
      ...new Map(
        tickets.map((ticket) => [
          ticket.eventId,
          { id: ticket.eventId, title: ticket.eventTitle },
        ])
      ).values(),
    ];
  }, [tickets]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(tickets.map((ticket) => ticket.category))];
  }, [tickets]);

  const uniqueDates = useMemo(() => {
    return [
      ...new Set(tickets.map((ticket) => ticket.purchaseDate.substring(0, 7))),
    ];
  }, [tickets]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, eventFilter, categoryFilter, statusFilter, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-blue-100 text-blue-800";
      case "refunded":
        return "bg-yellow-100 text-yellow-800";
      case "banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid":
        return t("admin.tickets.status.valid");
      case "used":
        return t("admin.tickets.status.used");
      case "refunded":
        return t("admin.tickets.status.refunded");
      case "banned":
        return t("admin.tickets.status.banned");
      default:
        return status;
    }
  };

  const getScanResultColor = (result: string) => {
    switch (result) {
      case "success":
        return "bg-green-100 text-green-800";
      case "already_used":
        return "bg-yellow-100 text-yellow-800";
      case "invalid":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScanResultText = (result: string) => {
    switch (result) {
      case "success":
        return t("admin.tickets.scanResults.success");
      case "already_used":
        return t("admin.tickets.scanResults.alreadyUsed");
      case "invalid":
        return t("admin.tickets.scanResults.invalid");
      case "expired":
        return t("admin.tickets.scanResults.expired");
      default:
        return result;
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditDialogOpen(true);
  };

  const handleBanTicket = (ticketId: string) => {
    toast({
      title: t("admin.tickets.toast.ticketBanned"),
      description: t("admin.tickets.toast.ticketBannedDesc"),
    });
  };

  const handleRefundTicket = (ticketId: string) => {
    toast({
      title: t("admin.tickets.toast.ticketRefunded"),
      description: t("admin.tickets.toast.ticketRefundedDesc"),
    });
  };

  const handleExportTickets = () => {
    toast({
      title: t("admin.tickets.toast.exportSuccess"),
      description: t("admin.tickets.toast.exportSuccessDesc"),
    });
  };

  const handleAssignTicket = () => {
    setIsAssignDialogOpen(true);
  };

  const handleViewQrCode = (ticketId: string) => {
    toast({
      title: t("admin.tickets.toast.qrCodeOpened"),
      description: t("admin.tickets.toast.qrCodeOpenedDesc"),
    });
  };

  const handleUnbanTicket = (ticketId: string) => {
    toast({
      title: t("admin.tickets.toast.ticketUnbanned"),
      description: t("admin.tickets.toast.ticketUnbannedDesc"),
    });
  };

  const handleAssignTicketAction = () => {
    toast({
      title: t("admin.tickets.toast.ticketAssigned"),
      description: t("admin.tickets.toast.ticketAssignedDesc"),
    });
    setIsAssignDialogOpen(false);
  };

  const handleSaveTicketChanges = () => {
    toast({
      title: t("admin.tickets.toast.ticketUpdated"),
      description: t("admin.tickets.toast.ticketUpdatedDesc"),
    });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.tickets.title")}
          </h2>
          <p className="text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.tickets.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportTickets}>
            <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.tickets.actions.export")}
          </Button>
          <Button onClick={handleAssignTicket}>
            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.tickets.actions.assignTicket")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
            <Filter className="h-5 w-5" />
            {t("admin.tickets.filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
              <Input
                placeholder={t("admin.tickets.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.tickets.filters.event")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.tickets.filters.allEvents")}
                </SelectItem>
                {uniqueEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.tickets.filters.category")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.tickets.filters.allCategories")}
                </SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(`admin.tickets.categories.${category}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.tickets.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.tickets.filters.allStatus")}
                </SelectItem>
                <SelectItem value="valid">
                  {t("admin.tickets.status.valid")}
                </SelectItem>
                <SelectItem value="used">
                  {t("admin.tickets.status.used")}
                </SelectItem>
                <SelectItem value="refunded">
                  {t("admin.tickets.status.refunded")}
                </SelectItem>
                <SelectItem value="banned">
                  {t("admin.tickets.status.banned")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.tickets.filters.purchaseDate")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.tickets.filters.allDates")}
                </SelectItem>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(parseISO(date + "-01"), "MMMM yyyy", {
                      locale: i18n.language === "ar" ? ar : undefined,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="rtl:text-right ltr:text-left">
            {t("admin.tickets.table.ticket")} ({filteredTickets.length})
          </CardTitle>
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            <span className="text-sm text-muted-foreground">
              {t("admin.tickets.pagination.showing")} {startIndex + 1}-
              {Math.min(endIndex, filteredTickets.length)}{" "}
              {t("admin.tickets.pagination.of")} {filteredTickets.length}
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
            <Table className="w-full rtl:text-right ltr:text-left">
              <TableHeader>
                <TableRow>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.ticket")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.customer")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.event")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.category")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.purchaseDate")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.status")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.price")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium">{ticket.ticketNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.tickets.table.dependents")}:{" "}
                          {ticket.dependents}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium">{ticket.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.tickets.table.id")}: {ticket.customerId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right">
                        {ticket.eventTitle}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`admin.tickets.categories.${ticket.category}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right">
                        {format(parseISO(ticket.purchaseDate), "MMM dd, yyyy", {
                          locale: i18n.language === "ar" ? ar : undefined,
                        })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium rtl:text-right">
                        {formatCurrencyForLocale(ticket.price, i18n.language)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t("admin.tickets.table.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditTicket(ticket)}
                          >
                            <Edit className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.tickets.actions.editTicket")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewQrCode(ticket.id)}
                          >
                            <QrCode className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.tickets.actions.viewQrCode")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {ticket.status === "valid" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRefundTicket(ticket.id)}
                                className="text-yellow-600"
                              >
                                <RefreshCw className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                {t("admin.tickets.actions.refundTicket")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBanTicket(ticket.id)}
                                className="text-red-600"
                              >
                                <Ban className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                {t("admin.tickets.actions.banTicket")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {ticket.status === "banned" && (
                            <DropdownMenuItem
                              onClick={() => handleUnbanTicket(ticket.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                              {t("admin.tickets.actions.unbanTicket")}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground rtl:text-right">
                {t("admin.tickets.pagination.showing")} {startIndex + 1}-
                {Math.min(endIndex, filteredTickets.length)}{" "}
                {t("admin.tickets.pagination.of")} {filteredTickets.length}{" "}
                {t("admin.tickets.pagination.results")}
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
                      {t("admin.tickets.pagination.first")}
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
                      {t("admin.tickets.pagination.last")}
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-in Logs */}
      {showCheckInLogs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse rtl:text-right ltr:text-left">
              <Clock className="h-5 w-5" />
              {t("admin.tickets.checkInLogs.title")}
            </CardTitle>
            <CardDescription className="rtl:text-right ltr:text-left">
              {t("admin.tickets.checkInLogs.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full rtl:text-right ltr:text-left">
                <TableHeader>
                  <TableRow>
                    <TableHead className="rtl:text-right">
                      {t("admin.tickets.checkInLogs.customer")}
                    </TableHead>
                    <TableHead className="rtl:text-right">
                      {t("admin.tickets.checkInLogs.event")}
                    </TableHead>
                    <TableHead className="rtl:text-right">
                      {t("admin.tickets.checkInLogs.checkInTime")}
                    </TableHead>
                    <TableHead className="rtl:text-right">
                      {t("admin.tickets.checkInLogs.scanResult")}
                    </TableHead>
                    <TableHead className="rtl:text-right">
                      {t("admin.tickets.checkInLogs.location")}
                    </TableHead>
                    <TableHead className="rtl:text-right">
                      {t("admin.tickets.checkInLogs.usher")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkInLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <p className="font-medium rtl:text-right">
                          {log.customerName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm rtl:text-right">
                          {log.eventTitle}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm rtl:text-right">
                          {format(
                            parseISO(log.checkInTime),
                            "MMM dd, yyyy HH:mm",
                            {
                              locale: i18n.language === "ar" ? ar : undefined,
                            }
                          )}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getScanResultColor(log.scanResult)}>
                          {getScanResultText(log.scanResult)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm rtl:text-right">{log.location}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm rtl:text-right">
                          {log.usherName}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.tickets.dialogs.editTicket")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.tickets.dialogs.editTicketSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.form.ticketNumber")}
                  </label>
                  <Input defaultValue={selectedTicket.ticketNumber} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.form.category")}
                  </label>
                  <Select defaultValue={selectedTicket.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vip">
                        {t("admin.tickets.categories.vip")}
                      </SelectItem>
                      <SelectItem value="regular">
                        {t("admin.tickets.categories.regular")}
                      </SelectItem>
                      <SelectItem value="student">
                        {t("admin.tickets.categories.student")}
                      </SelectItem>
                      <SelectItem value="earlyBird">
                        {t("admin.tickets.categories.earlyBird")}
                      </SelectItem>
                      <SelectItem value="general">
                        {t("admin.tickets.categories.general")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.form.price")}
                  </label>
                  <Input type="number" defaultValue={selectedTicket.price} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.form.dependents")}
                  </label>
                  <Input
                    type="number"
                    defaultValue={selectedTicket.dependents}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.form.status")}
                  </label>
                  <Select defaultValue={selectedTicket.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valid">
                        {t("admin.tickets.status.valid")}
                      </SelectItem>
                      <SelectItem value="used">
                        {t("admin.tickets.status.used")}
                      </SelectItem>
                      <SelectItem value="refunded">
                        {t("admin.tickets.status.refunded")}
                      </SelectItem>
                      <SelectItem value="banned">
                        {t("admin.tickets.status.banned")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("admin.tickets.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveTicketChanges}>
              {t("admin.tickets.dialogs.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Ticket Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.tickets.dialogs.assignTicket")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.tickets.dialogs.assignTicketSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.form.customer")}
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.tickets.form.selectCustomer")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C001">
                      {t("admin.tickets.mock.customer.ahmedHassan")}
                    </SelectItem>
                    <SelectItem value="C002">
                      {t("admin.tickets.mock.customer.sarahMohamed")}
                    </SelectItem>
                    <SelectItem value="C003">
                      {t("admin.tickets.mock.customer.omarAli")}
                    </SelectItem>
                    <SelectItem value="C004">
                      {t("admin.tickets.mock.customer.fatimaAhmed")}
                    </SelectItem>
                    <SelectItem value="C005">
                      {t("admin.tickets.mock.customer.youssefIbrahim")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.form.event")}
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.tickets.form.selectEvent")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      {t("admin.tickets.mock.summerMusicFestival")}
                    </SelectItem>
                    <SelectItem value="2">
                      {t("admin.tickets.mock.techInnovatorsMeetup")}
                    </SelectItem>
                    <SelectItem value="3">
                      {t("admin.tickets.mock.standupComedyNight")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.form.category")}
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.tickets.form.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vip">
                      {t("admin.tickets.categories.vip")}
                    </SelectItem>
                    <SelectItem value="regular">
                      {t("admin.tickets.categories.regular")}
                    </SelectItem>
                    <SelectItem value="student">
                      {t("admin.tickets.categories.student")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.form.dependents")}
                </label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              {t("admin.tickets.dialogs.cancel")}
            </Button>
            <Button onClick={handleAssignTicketAction}>
              {t("admin.tickets.dialogs.assignTicketButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsManagement;
