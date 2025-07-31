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
import { Switch } from "@/components/ui/switch";
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
  BarChart3,
  Users,
  Ticket,
  DollarSign,
  Calendar,
  MapPin,
  MoreHorizontal,
  Settings,
  UserCheck,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  UserPlus,
  UserMinus,
  QrCode,
  Activity,
  PieChart,
  LineChart,
  Target,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { formatNumberForLocale, formatCurrencyForLocale } from "@/lib/utils";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Event {
  id: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  category: string;
  totalTickets: number;
  ticketsSold: number;
  revenue: number;
  commission: number;
  payout: number;
  ticketTransferEnabled: boolean;
  ticketLimit: number;
  usheringAccounts: number;
  imageUrl: string;
  description: string;
}

const EventsManagement: React.FC = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [organizerFilter, setOrganizerFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isUsherManagementDialogOpen, setIsUsherManagementDialogOpen] =
    useState(false);
  const [isTicketManagementDialogOpen, setIsTicketManagementDialogOpen] =
    useState(false);
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] =
    useState<Event | null>(null);
  const [selectedEventForUshers, setSelectedEventForUshers] =
    useState<Event | null>(null);
  const [selectedEventForTickets, setSelectedEventForTickets] =
    useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    organizer: "",
    date: "",
    time: "",
    location: "",
    category: "",
    totalTickets: 0,
    ticketLimit: 1,
    description: "",
    ticketTransferEnabled: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock events data
  const events: Event[] = [
    {
      id: "1",
      title: t("admin.events.mock.summerMusicFestival.title"),
      organizer: t("admin.events.mock.summerMusicFestival.organizer"),
      date: "2025-08-15",
      time: "18:00",
      location: t("admin.events.mock.summerMusicFestival.location"),
      status: "upcoming",
      category: t("admin.events.mock.summerMusicFestival.category"),
      totalTickets: 500,
      ticketsSold: 470,
      revenue: 117500,
      commission: 11750,
      payout: 105750,
      ticketTransferEnabled: true,
      ticketLimit: 5,
      usheringAccounts: 3,
      imageUrl: "/public/event1.jpg",
      description: t("admin.events.mock.summerMusicFestival.description"),
    },
    {
      id: "2",
      title: t("admin.events.mock.techInnovatorsMeetup.title"),
      organizer: t("admin.events.mock.techInnovatorsMeetup.organizer"),
      date: "2025-09-01",
      time: "10:00",
      location: t("admin.events.mock.techInnovatorsMeetup.location"),
      status: "upcoming",
      category: t("admin.events.mock.techInnovatorsMeetup.category"),
      totalTickets: 200,
      ticketsSold: 150,
      revenue: 45000,
      commission: 4500,
      payout: 40500,
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 2,
      imageUrl: "/public/event2.jpg",
      description: t("admin.events.mock.techInnovatorsMeetup.description"),
    },
    {
      id: "3",
      title: t("admin.events.mock.standupComedyNight.title"),
      organizer: t("admin.events.mock.standupComedyNight.organizer"),
      date: "2025-08-22",
      time: "20:30",
      location: t("admin.events.mock.standupComedyNight.location"),
      status: "ongoing",
      category: t("admin.events.mock.standupComedyNight.category"),
      totalTickets: 150,
      ticketsSold: 120,
      revenue: 18000,
      commission: 1800,
      payout: 16200,
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 1,
      imageUrl: "/public/event3.jpg",
      description: t("admin.events.mock.standupComedyNight.description"),
    },
    {
      id: "4",
      title: t("admin.events.mock.modernArtExhibition.title"),
      organizer: t("admin.events.mock.modernArtExhibition.organizer"),
      date: "2025-07-10",
      time: "16:00",
      location: t("admin.events.mock.modernArtExhibition.location"),
      status: "completed",
      category: t("admin.events.mock.modernArtExhibition.category"),
      totalTickets: 300,
      ticketsSold: 280,
      revenue: 56000,
      commission: 5600,
      payout: 50400,
      ticketTransferEnabled: false,
      ticketLimit: 3,
      usheringAccounts: 2,
      imageUrl: "/public/event4.jpg",
      description: t("admin.events.mock.modernArtExhibition.description"),
    },
    {
      id: "5",
      title: "Football Championship Final",
      organizer: "Sports Events Egypt",
      date: "2025-10-05",
      time: "19:30",
      location: "Cairo International Stadium, Cairo",
      status: "upcoming",
      category: "Sports",
      totalTickets: 80000,
      ticketsSold: 75000,
      revenue: 1500000,
      commission: 150000,
      payout: 1350000,
      ticketTransferEnabled: true,
      ticketLimit: 6,
      usheringAccounts: 15,
      imageUrl: "/public/event5.jpg",
      description:
        "The biggest football event of the year featuring top teams competing for the championship title.",
    },
    {
      id: "6",
      title: "International Film Festival",
      organizer: "Cinema Egypt Productions",
      date: "2025-11-15",
      time: "14:00",
      location: "Alexandria Opera House, Alexandria",
      status: "upcoming",
      category: "Entertainment",
      totalTickets: 1200,
      ticketsSold: 950,
      revenue: 285000,
      commission: 28500,
      payout: 256500,
      ticketTransferEnabled: false,
      ticketLimit: 3,
      usheringAccounts: 8,
      imageUrl: "/public/event6.jpg",
      description:
        "A week-long celebration of international cinema with screenings, workshops, and celebrity appearances.",
    },
    {
      id: "7",
      title: "Tech Startup Conference",
      organizer: "Innovation Hub Egypt",
      date: "2025-09-20",
      time: "09:00",
      location: "Smart Village, Giza",
      status: "upcoming",
      category: "Technology",
      totalTickets: 500,
      ticketsSold: 420,
      revenue: 84000,
      commission: 8400,
      payout: 75600,
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 5,
      imageUrl: "/public/event7.jpg",
      description:
        "Connecting entrepreneurs, investors, and tech enthusiasts in Egypt's premier startup ecosystem.",
    },
    {
      id: "8",
      title: "Classical Music Symphony",
      organizer: "Cairo Philharmonic Orchestra",
      date: "2025-12-01",
      time: "20:00",
      location: "Cairo Opera House, Cairo",
      status: "upcoming",
      category: "Music",
      totalTickets: 800,
      ticketsSold: 650,
      revenue: 130000,
      commission: 13000,
      payout: 117000,
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 4,
      imageUrl: "/public/event8.jpg",
      description:
        "An evening of classical masterpieces performed by Egypt's finest musicians.",
    },
    {
      id: "9",
      title: "Fashion Week Egypt",
      organizer: "Egyptian Fashion Council",
      date: "2025-10-25",
      time: "18:00",
      location: "Grand Nile Tower, Cairo",
      status: "upcoming",
      category: "Art",
      totalTickets: 600,
      ticketsSold: 480,
      revenue: 144000,
      commission: 14400,
      payout: 129600,
      ticketTransferEnabled: true,
      ticketLimit: 3,
      usheringAccounts: 6,
      imageUrl: "/public/event9.jpg",
      description:
        "Showcasing the latest trends and designs from Egypt's top fashion designers.",
    },
    {
      id: "10",
      title: "Science and Innovation Expo",
      organizer: "Egyptian Academy of Sciences",
      date: "2025-11-08",
      time: "10:00",
      location: "Bibliotheca Alexandrina, Alexandria",
      status: "upcoming",
      category: "Education",
      totalTickets: 2000,
      ticketsSold: 1800,
      revenue: 180000,
      commission: 18000,
      payout: 162000,
      ticketTransferEnabled: false,
      ticketLimit: 5,
      usheringAccounts: 10,
      imageUrl: "/public/event10.jpg",
      description:
        "Exploring the latest scientific discoveries and technological innovations from around the world.",
    },
    {
      id: "11",
      title: "Jazz Under the Stars",
      organizer: "Cairo Jazz Club",
      date: "2025-08-30",
      time: "21:00",
      location: "Al-Azhar Park, Cairo",
      status: "ongoing",
      category: "Music",
      totalTickets: 300,
      ticketsSold: 280,
      revenue: 84000,
      commission: 8400,
      payout: 75600,
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 3,
      imageUrl: "/public/event11.jpg",
      description:
        "An intimate evening of jazz music under the beautiful Cairo sky.",
    },
    {
      id: "12",
      title: "Photography Workshop",
      organizer: "Egyptian Photographers Association",
      date: "2025-09-12",
      time: "14:00",
      location: "Luxor Temple, Luxor",
      status: "upcoming",
      category: "Education",
      totalTickets: 50,
      ticketsSold: 45,
      revenue: 22500,
      commission: 2250,
      payout: 20250,
      ticketTransferEnabled: false,
      ticketLimit: 1,
      usheringAccounts: 2,
      imageUrl: "/public/event12.jpg",
      description:
        "Learn photography techniques while exploring the ancient wonders of Luxor.",
    },
    {
      id: "13",
      title: "Street Food Festival",
      organizer: "Cairo Food Network",
      date: "2025-10-12",
      time: "12:00",
      location: "Khan el-Khalili, Cairo",
      status: "upcoming",
      category: "Entertainment",
      totalTickets: 1000,
      ticketsSold: 850,
      revenue: 85000,
      commission: 8500,
      payout: 76500,
      ticketTransferEnabled: true,
      ticketLimit: 6,
      usheringAccounts: 8,
      imageUrl: "/public/event13.jpg",
      description:
        "A culinary journey through Egypt's most delicious street food and traditional dishes.",
    },
    {
      id: "14",
      title: "Poetry Night",
      organizer: "Cairo Literary Society",
      date: "2025-09-25",
      time: "19:00",
      location: "Darb 1718, Cairo",
      status: "upcoming",
      category: "Entertainment",
      totalTickets: 100,
      ticketsSold: 75,
      revenue: 15000,
      commission: 1500,
      payout: 13500,
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 2,
      imageUrl: "/public/event14.jpg",
      description:
        "An evening of poetry readings featuring both established and emerging Egyptian poets.",
    },
    {
      id: "15",
      title: "Yoga Retreat",
      organizer: "Egyptian Wellness Center",
      date: "2025-11-20",
      time: "07:00",
      location: "Red Sea Coast, Hurghada",
      status: "upcoming",
      category: "Sports",
      totalTickets: 80,
      ticketsSold: 65,
      revenue: 26000,
      commission: 2600,
      payout: 23400,
      ticketTransferEnabled: true,
      ticketLimit: 2,
      usheringAccounts: 3,
      imageUrl: "/public/event15.jpg",
      description:
        "A peaceful retreat combining yoga, meditation, and the beautiful Red Sea environment.",
    },
    {
      id: "16",
      title: "Digital Art Exhibition",
      organizer: "Modern Art Gallery",
      date: "2025-08-05",
      time: "16:00",
      location: "Zamalek Art Gallery, Cairo",
      status: "completed",
      category: "Art",
      totalTickets: 200,
      ticketsSold: 180,
      revenue: 36000,
      commission: 3600,
      payout: 32400,
      ticketTransferEnabled: false,
      ticketLimit: 3,
      usheringAccounts: 2,
      imageUrl: "/public/event16.jpg",
      description:
        "Exploring the intersection of technology and art through digital installations and interactive exhibits.",
    },
    {
      id: "17",
      title: "Business Networking Event",
      organizer: "Egyptian Business Network",
      date: "2025-09-18",
      time: "18:30",
      location: "Four Seasons Hotel, Cairo",
      status: "upcoming",
      category: "Education",
      totalTickets: 150,
      ticketsSold: 120,
      revenue: 30000,
      commission: 3000,
      payout: 27000,
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 4,
      imageUrl: "/public/event17.jpg",
      description:
        "Connect with business leaders and entrepreneurs in an elegant networking environment.",
    },
    {
      id: "18",
      title: "Children's Theater Festival",
      organizer: "Cairo Children's Theater",
      date: "2025-10-30",
      time: "11:00",
      location: "Cairo Puppet Theater, Cairo",
      status: "upcoming",
      category: "Entertainment",
      totalTickets: 400,
      ticketsSold: 320,
      revenue: 32000,
      commission: 3200,
      payout: 28800,
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 5,
      imageUrl: "/public/event18.jpg",
      description:
        "A week-long festival of children's theater performances and interactive workshops.",
    },
    {
      id: "19",
      title: "Rock Concert",
      organizer: "Egyptian Rock Society",
      date: "2025-09-28",
      time: "22:00",
      location: "Cairo Stadium, Cairo",
      status: "upcoming",
      category: "Music",
      totalTickets: 5000,
      ticketsSold: 4200,
      revenue: 840000,
      commission: 84000,
      payout: 756000,
      ticketTransferEnabled: true,
      ticketLimit: 8,
      usheringAccounts: 20,
      imageUrl: "/public/event19.jpg",
      description:
        "The biggest rock concert of the year featuring local and international rock bands.",
    },
    {
      id: "20",
      title: "Cooking Masterclass",
      organizer: "Egyptian Culinary Institute",
      date: "2025-11-05",
      time: "15:00",
      location: "Cairo Cooking School, Cairo",
      status: "upcoming",
      category: "Education",
      totalTickets: 60,
      ticketsSold: 55,
      revenue: 16500,
      commission: 1650,
      payout: 14850,
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 2,
      imageUrl: "/public/event20.jpg",
      description:
        "Learn to cook traditional Egyptian dishes from master chefs in an intimate setting.",
    },
  ];

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || event.category === categoryFilter;
      const matchesLocation =
        locationFilter === "all" || event.location.includes(locationFilter);
      const matchesOrganizer =
        organizerFilter === "all" || event.organizer === organizerFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesLocation &&
        matchesOrganizer
      );
    });
  }, [
    events,
    searchTerm,
    statusFilter,
    categoryFilter,
    locationFilter,
    organizerFilter,
  ]);

  // Get unique values for filters
  const uniqueCategories = useMemo(() => {
    return [...new Set(events.map((event) => event.category))];
  }, [events]);

  const uniqueLocations = useMemo(() => {
    return [
      ...new Set(events.map((event) => event.location.split(",")[0].trim())),
    ];
  }, [events]);

  const uniqueOrganizers = useMemo(() => {
    return [...new Set(events.map((event) => event.organizer))];
  }, [events]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    categoryFilter,
    locationFilter,
    organizerFilter,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    toast({
      title: t("admin.events.toast.eventDeleted"),
      description: t("admin.events.toast.eventDeletedDesc"),
    });
  };

  const handleExportEvents = () => {
    toast({
      title: t("admin.events.toast.exportSuccess"),
      description: t("admin.events.toast.exportSuccessDesc"),
    });
  };

  const handleToggleTransfer = (eventId: string, enabled: boolean) => {
    toast({
      title: t("admin.events.toast.transferUpdated"),
      description: enabled
        ? t("admin.events.toast.transferEnabled")
        : t("admin.events.toast.transferDisabled"),
    });
  };

  const handleViewAnalytics = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEventForAnalytics(event);
      setIsAnalyticsDialogOpen(true);
    }
  };

  const handleManageUshers = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEventForUshers(event);
      setIsUsherManagementDialogOpen(true);
    }
  };

  const handleManageTickets = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEventForTickets(event);
      setIsTicketManagementDialogOpen(true);
    }
  };

  const handleSaveEventChanges = () => {
    toast({
      title: t("admin.events.toast.saveEventChanges"),
      description: t("admin.events.toast.saveEventChangesDesc"),
    });
    setIsEditDialogOpen(false);
  };

  const handleAddEvent = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveNewEvent = () => {
    // Validate required fields
    if (
      !newEvent.title ||
      !newEvent.organizer ||
      !newEvent.date ||
      !newEvent.location ||
      !newEvent.category
    ) {
      toast({
        title: t("admin.events.toast.validationError"),
        description: t("admin.events.toast.validationErrorDesc"),
        variant: "destructive",
      });
      return;
    }

    // Create new event object
    const eventToAdd: Event = {
      id: Date.now().toString(), // Simple ID generation
      title: newEvent.title,
      organizer: newEvent.organizer,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      status: "upcoming",
      category: newEvent.category,
      totalTickets: newEvent.totalTickets,
      ticketsSold: 0,
      revenue: 0,
      commission: 0,
      payout: 0,
      ticketTransferEnabled: newEvent.ticketTransferEnabled,
      ticketLimit: newEvent.ticketLimit,
      usheringAccounts: 0,
      imageUrl: "/public/placeholderLogo.png",
      description: newEvent.description,
    };

    // In a real app, you would make an API call here
    toast({
      title: t("admin.events.toast.eventAdded"),
      description: t("admin.events.toast.eventAddedDesc"),
    });

    // Reset form and close dialog
    setNewEvent({
      title: "",
      organizer: "",
      date: "",
      time: "",
      location: "",
      category: "",
      totalTickets: 0,
      ticketLimit: 1,
      description: "",
      ticketTransferEnabled: false,
    });
    setIsAddDialogOpen(false);
  };

  const handleNewEventChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculatePercentage = (sold: number, total: number) => {
    return total > 0 ? (sold / total) * 100 : 0;
  };

  return (
    <div
      className="space-y-6"
      dir={i18nInstance.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.events.title")}
          </h2>
          <p className="text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.events.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportEvents}>
            <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.dashboard.actions.export")}
          </Button>
          <Button onClick={handleAddEvent}>
            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.dashboard.actions.addEvent")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
            <Filter className="h-5 w-5" />
            {t("admin.events.filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
              <Input
                placeholder={t("admin.events.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.events.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.events.filters.allStatus")}
                </SelectItem>
                <SelectItem value="upcoming">
                  {t("admin.events.filters.upcoming")}
                </SelectItem>
                <SelectItem value="ongoing">
                  {t("admin.events.filters.ongoing")}
                </SelectItem>
                <SelectItem value="completed">
                  {t("admin.events.filters.completed")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t("admin.events.filters.cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.events.filters.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.events.filters.allCategories")}
                </SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.events.filters.location")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.events.filters.allLocations")}
                </SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={organizerFilter} onValueChange={setOrganizerFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.events.filters.organizer")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.events.filters.allOrganizers")}
                </SelectItem>
                {uniqueOrganizers.map((organizer) => (
                  <SelectItem key={organizer} value={organizer}>
                    {organizer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="rtl:text-right">
            {t("admin.events.title")} ({filteredEvents.length})
          </CardTitle>
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            <span className="text-sm text-muted-foreground">
              {t("admin.events.pagination.showing")} {startIndex + 1}-
              {Math.min(endIndex, filteredEvents.length)}{" "}
              {t("admin.events.pagination.of")} {filteredEvents.length}
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
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.event")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.organizer")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.dateTime")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.location")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.status")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.sales")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.revenue")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.events.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center event-image-container">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 event-image"
                        />
                        <div
                          className="min-w-0 flex-1 event-text"
                          dir={i18nInstance.language === "ar" ? "rtl" : "ltr"}
                        >
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {event.category}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium rtl:text-right">
                        {event.organizer}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium">
                          {format(parseISO(event.date), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.time}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right">{event.location}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium number-container">
                          {formatNumberForLocale(
                            event.ticketsSold,
                            i18nInstance.language
                          )}
                          /
                          {formatNumberForLocale(
                            event.totalTickets,
                            i18nInstance.language
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumberForLocale(
                            calculatePercentage(
                              event.ticketsSold,
                              event.totalTickets
                            ),
                            i18nInstance.language
                          ).replace(/\.\d+$/, "")}
                          %
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium number-container">
                          {formatCurrencyForLocale(
                            event.revenue,
                            i18nInstance.language
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.events.metrics.commission")}:{" "}
                          {formatCurrencyForLocale(
                            event.commission,
                            i18nInstance.language
                          )}
                        </p>
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
                          className="rtl:text-right"
                        >
                          <DropdownMenuLabel>
                            {t("admin.events.table.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewEvent(event)}
                          >
                            <Eye className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.events.actions.viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.events.actions.editEvent")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewAnalytics(event.id)}
                          >
                            <BarChart3 className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.events.actions.viewAnalytics")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManageUshers(event.id)}
                          >
                            <Users className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.events.actions.manageUshers")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManageTickets(event.id)}
                          >
                            <Ticket className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.events.actions.manageTickets")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.events.actions.deleteEvent")}
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
                {t("admin.events.pagination.showing")} {startIndex + 1}-
                {Math.min(endIndex, filteredEvents.length)}{" "}
                {t("admin.events.pagination.of")} {filteredEvents.length}{" "}
                {t("admin.events.pagination.results")}
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
                      {t("admin.events.pagination.first")}
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
                      {t("admin.events.pagination.last")}
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="rtl:text-right">
            <DialogTitle>{t("admin.events.dialogs.eventDetails")}</DialogTitle>
            <DialogDescription>
              {t("admin.events.dialogs.eventDetailsSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div
                  className="space-y-4"
                  dir={i18nInstance.language === "ar" ? "rtl" : "ltr"}
                >
                  <div>
                    <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                    <p className="text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
                    <div>
                      <p className="text-sm font-medium">
                        {t("admin.events.filters.organizer")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.organizer}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("admin.events.filters.category")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("admin.events.table.dateTime")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(selectedEvent.date), "MMM dd, yyyy")}{" "}
                        at {selectedEvent.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("admin.events.table.location")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rtl:flex-row-reverse rtl:space-x-reverse">
                    <Badge className={getStatusColor(selectedEvent.status)}>
                      {getStatusText(selectedEvent.status)}
                    </Badge>
                    <div className="flex items-center space-x-2 rtl:flex-row-reverse rtl:space-x-reverse">
                      <Switch
                        checked={selectedEvent.ticketTransferEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleTransfer(selectedEvent.id, checked)
                        }
                      />
                      <span className="text-sm">
                        {t("admin.events.actions.ticketTransfers")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rtl:space-x-reverse">
                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm">
                      {t("admin.events.metrics.ticketSales")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold number-container">
                      {selectedEvent.ticketsSold}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.metrics.ofSold", {
                        total: selectedEvent.totalTickets,
                      })}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs rtl:flex-row-reverse">
                        <span>{t("admin.events.metrics.progress")}</span>
                        <span>
                          {calculatePercentage(
                            selectedEvent.ticketsSold,
                            selectedEvent.totalTickets
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              selectedEvent.ticketsSold,
                              selectedEvent.totalTickets
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm">
                      {t("admin.events.metrics.revenue")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-green-600 number-container">
                      E£ {selectedEvent.revenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.metrics.commission")}: E£{" "}
                      {selectedEvent.commission.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm">
                      {t("admin.events.metrics.payout")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-blue-600 number-container">
                      E£ {selectedEvent.payout.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.metrics.pendingPayout")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              {t("admin.events.dialogs.close")}
            </Button>
            <Button onClick={() => handleEditEvent(selectedEvent!)}>
              {t("admin.events.actions.editEvent")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="rtl:text-right">
            <DialogTitle>{t("admin.events.dialogs.editEvent")}</DialogTitle>
            <DialogDescription>
              {t("admin.events.dialogs.editEventSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.form.eventTitle")}
                  </label>
                  <Input defaultValue={selectedEvent.title} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.form.category")}
                  </label>
                  <Select defaultValue={selectedEvent.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                      <SelectItem value="Entertainment">
                        Entertainment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.form.date")}
                  </label>
                  <Input type="date" defaultValue={selectedEvent.date} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.form.time")}
                  </label>
                  <Input type="time" defaultValue={selectedEvent.time} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.form.location")}
                  </label>
                  <Input defaultValue={selectedEvent.location} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.form.totalTickets")}
                  </label>
                  <Input
                    type="number"
                    defaultValue={selectedEvent.totalTickets}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.form.ticketLimit")}
                  </label>
                  <Input
                    type="number"
                    defaultValue={selectedEvent.ticketLimit}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:flex-row-reverse rtl:space-x-reverse">
                <Switch defaultChecked={selectedEvent.ticketTransferEnabled} />
                <span className="text-sm">
                  {t("admin.events.form.enableTicketTransfers")}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("admin.events.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveEventChanges}>
              {t("admin.events.dialogs.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="rtl:text-right">
            <DialogTitle>{t("admin.events.dialogs.addEvent")}</DialogTitle>
            <DialogDescription>
              {t("admin.events.dialogs.addEventSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.eventTitle")} *
                </label>
                <Input
                  value={newEvent.title}
                  onChange={(e) =>
                    handleNewEventChange("title", e.target.value)
                  }
                  placeholder={t("admin.events.form.enterEventTitle")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.category")} *
                </label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) =>
                    handleNewEventChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.events.form.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.organizer")} *
                </label>
                <Input
                  value={newEvent.organizer}
                  onChange={(e) =>
                    handleNewEventChange("organizer", e.target.value)
                  }
                  placeholder={t("admin.events.form.enterOrganizerName")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.date")} *
                </label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => handleNewEventChange("date", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.time")}
                </label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => handleNewEventChange("time", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.totalTickets")}
                </label>
                <Input
                  type="number"
                  value={newEvent.totalTickets}
                  onChange={(e) =>
                    handleNewEventChange(
                      "totalTickets",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.ticketLimit")}
                </label>
                <Input
                  type="number"
                  value={newEvent.ticketLimit}
                  onChange={(e) =>
                    handleNewEventChange(
                      "ticketLimit",
                      parseInt(e.target.value) || 1
                    )
                  }
                  placeholder="1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.location")} *
                </label>
                <Input
                  value={newEvent.location}
                  onChange={(e) =>
                    handleNewEventChange("location", e.target.value)
                  }
                  placeholder={t("admin.events.form.enterEventLocation")}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.events.form.description")}
                </label>
                <Input
                  value={newEvent.description}
                  onChange={(e) =>
                    handleNewEventChange("description", e.target.value)
                  }
                  placeholder={t("admin.events.form.enterEventDescription")}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:flex-row-reverse rtl:space-x-reverse">
              <Switch
                checked={newEvent.ticketTransferEnabled}
                onCheckedChange={(checked) =>
                  handleNewEventChange("ticketTransferEnabled", checked)
                }
              />
              <span className="text-sm">
                {t("admin.events.form.enableTicketTransfers")}
              </span>
            </div>
          </div>
          <DialogFooter className="rtl:flex-row-reverse">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("admin.events.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveNewEvent}>
              {t("admin.events.dialogs.createEvent")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={isAnalyticsDialogOpen}
        onOpenChange={setIsAnalyticsDialogOpen}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="rtl:text-right">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("admin.events.analytics.title")} -{" "}
              {selectedEventForAnalytics?.title}
            </DialogTitle>
            <DialogDescription>
              {t("admin.events.analytics.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedEventForAnalytics && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      {t("admin.events.analytics.ticketsSold")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold number-container">
                      {formatNumberForLocale(
                        selectedEventForAnalytics.ticketsSold,
                        i18nInstance.language
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.analytics.ofTotal", {
                        total: selectedEventForAnalytics.totalTickets,
                      })}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs rtl:flex-row-reverse">
                        <span>{t("admin.events.analytics.progress")}</span>
                        <span>
                          {calculatePercentage(
                            selectedEventForAnalytics.ticketsSold,
                            selectedEventForAnalytics.totalTickets
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${calculatePercentage(
                              selectedEventForAnalytics.ticketsSold,
                              selectedEventForAnalytics.totalTickets
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t("admin.events.analytics.revenue")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-green-600 number-container">
                      {formatCurrencyForLocale(
                        selectedEventForAnalytics.revenue,
                        i18nInstance.language
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.analytics.commission")}:{" "}
                      {formatCurrencyForLocale(
                        selectedEventForAnalytics.commission,
                        i18nInstance.language
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t("admin.events.analytics.ushers")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-blue-600 number-container">
                      {selectedEventForAnalytics.usheringAccounts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.analytics.activeUshers")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t("admin.events.analytics.conversion")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-purple-600 number-container">
                      {(
                        (selectedEventForAnalytics.ticketsSold /
                          selectedEventForAnalytics.totalTickets) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.analytics.salesRate")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm rtl:text-right">
                      {t("admin.events.analytics.salesTrend")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={[
                            { day: "Day 1", sales: 50 },
                            { day: "Day 2", sales: 120 },
                            { day: "Day 3", sales: 200 },
                            { day: "Day 4", sales: 180 },
                            { day: "Day 5", sales: 250 },
                            { day: "Day 6", sales: 300 },
                            {
                              day: "Day 7",
                              sales: selectedEventForAnalytics.ticketsSold,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip
                            formatter={(value: any) => [
                              formatNumberForLocale(
                                value,
                                i18nInstance.language
                              ),
                              "",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#8884d8"
                            strokeWidth={2}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm rtl:text-right">
                      {t("admin.events.analytics.revenueBreakdown")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              {
                                name: t("admin.events.analytics.payout"),
                                value: selectedEventForAnalytics.payout,
                                color: "#82ca9d",
                              },
                              {
                                name: t("admin.events.analytics.commission"),
                                value: selectedEventForAnalytics.commission,
                                color: "#8884d8",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              {
                                name: t("admin.events.analytics.payout"),
                                value: selectedEventForAnalytics.payout,
                                color: "#82ca9d",
                              },
                              {
                                name: t("admin.events.analytics.commission"),
                                value: selectedEventForAnalytics.commission,
                                color: "#8884d8",
                              },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => [
                              formatCurrencyForLocale(
                                value,
                                i18nInstance.language
                              ),
                              "",
                            ]}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.analytics.recentActivity")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: t("admin.events.analytics.activity.ticketSold"),
                        time: "2 hours ago",
                        user: "Ahmed Hassan",
                      },
                      {
                        action: t("admin.events.analytics.activity.ticketSold"),
                        time: "3 hours ago",
                        user: "Sarah Mohamed",
                      },
                      {
                        action: t(
                          "admin.events.analytics.activity.usherAssigned"
                        ),
                        time: "4 hours ago",
                        user: "Omar Usher",
                      },
                      {
                        action: t(
                          "admin.events.analytics.activity.ticketRefunded"
                        ),
                        time: "5 hours ago",
                        user: "Fatima Ali",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg rtl:flex-row-reverse"
                      >
                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{activity.action}</span>
                        </div>
                        <div className="text-xs text-muted-foreground rtl:text-right">
                          {activity.time} • {activity.user}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsAnalyticsDialogOpen(false)}
            >
              {t("admin.events.dialogs.close")}
            </Button>
            <Button
              onClick={() => {
                // Export analytics data
                toast({
                  title: t("admin.events.analytics.exportSuccess"),
                  description: t("admin.events.analytics.exportSuccessDesc"),
                });
              }}
            >
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.events.analytics.export")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usher Management Dialog */}
      <Dialog
        open={isUsherManagementDialogOpen}
        onOpenChange={setIsUsherManagementDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader className="rtl:text-right">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("admin.events.ushers.title")} - {selectedEventForUshers?.title}
            </DialogTitle>
            <DialogDescription>
              {t("admin.events.ushers.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedEventForUshers && (
            <div className="space-y-6">
              {/* Current Ushers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.ushers.currentUshers")} (
                    {selectedEventForUshers.usheringAccounts})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        id: "U001",
                        name: "Ahmed Usher",
                        email: "ahmed@ticketrunners.com",
                        status: "active",
                        assignedAreas: ["Gate A", "VIP Section"],
                        lastActive: "2 hours ago",
                      },
                      {
                        id: "U002",
                        name: "Omar Usher",
                        email: "omar@ticketrunners.com",
                        status: "active",
                        assignedAreas: ["Gate B", "General Section"],
                        lastActive: "1 hour ago",
                      },
                      {
                        id: "U003",
                        name: "Fatima Usher",
                        email: "fatima@ticketrunners.com",
                        status: "inactive",
                        assignedAreas: ["Gate C"],
                        lastActive: "3 days ago",
                      },
                    ].map((usher) => (
                      <div
                        key={usher.id}
                        className="flex items-center justify-between p-4 border rounded-lg rtl:flex-row-reverse"
                      >
                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="rtl:text-right">
                            <p className="font-medium">{usher.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {usher.email}
                            </p>
                            <div className="flex gap-1 mt-1 rtl:flex-row-reverse">
                              {usher.assignedAreas.map((area, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rtl:flex-row-reverse">
                          <Badge
                            className={
                              usher.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {usher.status === "active"
                              ? t("admin.events.ushers.active")
                              : t("admin.events.ushers.inactive")}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rtl:text-right"
                            >
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                {t("admin.events.ushers.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                {t("admin.events.ushers.viewActivity")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <UserMinus className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                {t("admin.events.ushers.remove")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add New Usher */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.ushers.addNew")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.name")}
                      </label>
                      <Input placeholder={t("admin.events.ushers.enterName")} />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.email")}
                      </label>
                      <Input
                        placeholder={t("admin.events.ushers.enterEmail")}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.assignedArea")}
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("admin.events.ushers.selectArea")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gate-a">Gate A</SelectItem>
                          <SelectItem value="gate-b">Gate B</SelectItem>
                          <SelectItem value="gate-c">Gate C</SelectItem>
                          <SelectItem value="vip-section">
                            VIP Section
                          </SelectItem>
                          <SelectItem value="general-section">
                            General Section
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {t("admin.events.ushers.addUsher")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsUsherManagementDialogOpen(false)}
            >
              {t("admin.events.dialogs.close")}
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: t("admin.events.ushers.saveSuccess"),
                  description: t("admin.events.ushers.saveSuccessDesc"),
                });
              }}
            >
              {t("admin.events.ushers.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Management Dialog */}
      <Dialog
        open={isTicketManagementDialogOpen}
        onOpenChange={setIsTicketManagementDialogOpen}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="rtl:text-right">
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {t("admin.events.tickets.title")} -{" "}
              {selectedEventForTickets?.title}
            </DialogTitle>
            <DialogDescription>
              {t("admin.events.tickets.subtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedEventForTickets && (
            <div className="space-y-6">
              {/* Ticket Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm">
                      {t("admin.events.tickets.totalTickets")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold number-container">
                      {formatNumberForLocale(
                        selectedEventForTickets.totalTickets,
                        i18nInstance.language
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm">
                      {t("admin.events.tickets.soldTickets")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-green-600 number-container">
                      {formatNumberForLocale(
                        selectedEventForTickets.ticketsSold,
                        i18nInstance.language
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm">
                      {t("admin.events.tickets.availableTickets")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-blue-600 number-container">
                      {formatNumberForLocale(
                        selectedEventForTickets.totalTickets -
                          selectedEventForTickets.ticketsSold,
                        i18nInstance.language
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 rtl:text-right">
                    <CardTitle className="text-sm">
                      {t("admin.events.tickets.revenue")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="rtl:text-right">
                    <div className="text-2xl font-bold text-purple-600 number-container">
                      {formatCurrencyForLocale(
                        selectedEventForTickets.revenue,
                        i18nInstance.language
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ticket Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.tickets.categories")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "VIP",
                        sold: 80,
                        total: 100,
                        price: 500,
                        color: "bg-purple-100 text-purple-800",
                      },
                      {
                        name: "Regular",
                        sold: 250,
                        total: 300,
                        price: 250,
                        color: "bg-blue-100 text-blue-800",
                      },
                      {
                        name: "Early Bird",
                        sold: 140,
                        total: 200,
                        price: 200,
                        color: "bg-green-100 text-green-800",
                      },
                    ].map((category) => (
                      <Card key={category.name} className="p-4">
                        <div className="flex items-center justify-between mb-3 rtl:flex-row-reverse">
                          <h4 className="font-medium">{category.name}</h4>
                          <Badge className={category.color}>
                            {formatCurrencyForLocale(
                              category.price,
                              i18nInstance.language
                            )}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm rtl:flex-row-reverse">
                            <span>{t("admin.events.tickets.sold")}</span>
                            <span>
                              {category.sold}/{category.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (category.sold / category.total) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground rtl:text-right">
                            {formatCurrencyForLocale(
                              category.sold * category.price,
                              i18nInstance.language
                            )}{" "}
                            {t("admin.events.tickets.revenue")}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Ticket Sales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.tickets.recentSales")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        id: "T001",
                        customer: "Ahmed Hassan",
                        category: "VIP",
                        price: 500,
                        time: "2 hours ago",
                        status: "valid",
                      },
                      {
                        id: "T002",
                        customer: "Sarah Mohamed",
                        category: "Regular",
                        price: 250,
                        time: "3 hours ago",
                        status: "used",
                      },
                      {
                        id: "T003",
                        customer: "Omar Ali",
                        category: "Early Bird",
                        price: 200,
                        time: "4 hours ago",
                        status: "valid",
                      },
                      {
                        id: "T004",
                        customer: "Fatima Ahmed",
                        category: "VIP",
                        price: 500,
                        time: "5 hours ago",
                        status: "refunded",
                      },
                    ].map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 border rounded-lg rtl:flex-row-reverse"
                      >
                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                          <QrCode className="h-5 w-5 text-gray-600" />
                          <div className="rtl:text-right">
                            <p className="font-medium">{ticket.customer}</p>
                            <p className="text-sm text-muted-foreground">
                              {ticket.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                          <Badge variant="outline">{ticket.category}</Badge>
                          <span className="font-medium">
                            {formatCurrencyForLocale(
                              ticket.price,
                              i18nInstance.language
                            )}
                          </span>
                          <Badge
                            className={
                              ticket.status === "valid"
                                ? "bg-green-100 text-green-800"
                                : ticket.status === "used"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {t(`admin.events.tickets.status.${ticket.status}`)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {ticket.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsTicketManagementDialogOpen(false)}
            >
              {t("admin.events.dialogs.close")}
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: t("admin.events.tickets.exportSuccess"),
                  description: t("admin.events.tickets.exportSuccessDesc"),
                });
              }}
            >
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.events.tickets.export")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagement;
