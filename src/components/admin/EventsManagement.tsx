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
  ResponsivePagination,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { formatNumberForLocale, formatCurrencyForLocale } from "@/lib/utils";
import i18n from "@/lib/i18n";
import { ExportDialog } from "@/components/ui/export-dialog";
import { commonColumns } from "@/lib/exportUtils";
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
  commissionRate: {
    type: "percentage" | "flat";
    value: number;
  };
  transferFee: {
    type: "percentage" | "flat";
    value: number;
  };
  ticketTransferEnabled: boolean;
  ticketLimit: number;
  usheringAccounts: number;
  imageUrl: string;
  description: string;
  gallery?: GalleryImage[];
}

interface GalleryImage {
  id: string;
  url: string;
  order: number;
  isThumbnail: boolean;
  alt?: string;
}

interface VenueSection {
  id: string;
  name: string;
  capacity: number;
  price: number;
  color: string;
  description: string;
  isActive: boolean;
}

interface VenueLayout {
  id: string;
  name: string;
  description: string;
  sections: VenueSection[];
  totalCapacity: number;
  imageUrl?: string;
  gateOpeningTime?: string;
  gateClosingTime?: string;
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
    commissionRate: {
      type: "percentage" as "percentage" | "flat",
      value: 10,
    },
    transferFee: {
      type: "percentage" as "percentage" | "flat",
      value: 5,
    },
    imageUrl: "",
    gallery: [] as GalleryImage[],
  });

  // Edit event state for new features
  const [editEventData, setEditEventData] = useState({
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
    commissionRate: {
      type: "percentage" as "percentage" | "flat",
      value: 10,
    },
    transferFee: {
      type: "percentage" as "percentage" | "flat",
      value: 5,
    },
    imageUrl: "",
    termsAndConditions: "",
    gallery: [] as GalleryImage[],
    venueLayouts: [
      {
        id: "1",
        name: "Main Hall Layout",
        description: "Standard layout for the main event hall",
        totalCapacity: 500,
        imageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
        gateOpeningTime: "17:00",
        gateClosingTime: "23:00",
        sections: [
          {
            id: "1",
            name: "VIP Section",
            capacity: 100,
            price: 500,
            color: "#8B5CF6",
            description: "Premium seating with exclusive benefits",
            isActive: true,
          },
          {
            id: "2",
            name: "Regular Section",
            capacity: 300,
            price: 250,
            color: "#3B82F6",
            description: "Standard seating arrangement",
            isActive: true,
          },
          {
            id: "3",
            name: "Early Bird Section",
            capacity: 100,
            price: 200,
            color: "#10B981",
            description: "Limited time discounted seating",
            isActive: true,
          },
        ],
      },
    ] as VenueLayout[],
    ticketCategories: [
      {
        id: "1",
        name: "VIP",
        price: 500,
        totalTickets: 100,
        soldTickets: 0,
        description: "Premium seating with exclusive benefits",
      },
      {
        id: "2",
        name: "Regular",
        price: 250,
        totalTickets: 300,
        soldTickets: 0,
        description: "Standard seating",
      },
      {
        id: "3",
        name: "Early Bird",
        price: 200,
        totalTickets: 200,
        soldTickets: 0,
        description: "Limited time discounted tickets",
      },
    ],
    discounts: [
      {
        id: "1",
        name: "Student Discount",
        type: "percentage",
        value: 20,
        code: "STUDENT20",
        validFrom: "",
        validTo: "",
        maxUses: 100,
        usedCount: 0,
        applicableCategories: ["Regular", "Early Bird"],
      },
      {
        id: "2",
        name: "Group Discount",
        type: "percentage",
        value: 15,
        code: "GROUP15",
        validFrom: "",
        validTo: "",
        maxUses: 50,
        usedCount: 0,
        applicableCategories: ["VIP", "Regular"],
        minQuantity: 5,
      },
    ],
  });

  // Usher management state
  const [ushers, setUshers] = useState([
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
  ]);

  const [newUsher, setNewUsher] = useState({
    name: "",
    email: "",
    assignedArea: "",
  });

  const [selectedUsher, setSelectedUsher] = useState<any>(null);
  const [isEditUsherDialogOpen, setIsEditUsherDialogOpen] = useState(false);
  const [isViewUsherActivityDialogOpen, setIsViewUsherActivityDialogOpen] =
    useState(false);

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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 5,
      },
      ticketTransferEnabled: true,
      ticketLimit: 5,
      usheringAccounts: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "flat",
        value: 25,
      },
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 3,
      },
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1501281669025-7ec9d6aec993?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "flat",
        value: 15,
      },
      ticketTransferEnabled: false,
      ticketLimit: 3,
      usheringAccounts: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 8,
      },
      ticketTransferEnabled: true,
      ticketLimit: 6,
      usheringAccounts: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "flat",
        value: 20,
      },
      ticketTransferEnabled: false,
      ticketLimit: 3,
      usheringAccounts: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 4,
      },
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "flat",
        value: 30,
      },
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 6,
      },
      ticketTransferEnabled: true,
      ticketLimit: 3,
      usheringAccounts: 6,
      imageUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 5,
      },
      ticketTransferEnabled: false,
      ticketLimit: 5,
      usheringAccounts: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 5,
      },
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 3,
      },
      ticketTransferEnabled: false,
      ticketLimit: 1,
      usheringAccounts: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 5,
      },
      ticketTransferEnabled: true,
      ticketLimit: 6,
      usheringAccounts: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 3,
      },
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      ticketTransferEnabled: true,
      ticketLimit: 2,
      usheringAccounts: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 5,
      },
      ticketTransferEnabled: false,
      ticketLimit: 3,
      usheringAccounts: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 5,
      },
      ticketTransferEnabled: true,
      ticketLimit: 4,
      usheringAccounts: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      ticketTransferEnabled: true,
      ticketLimit: 8,
      usheringAccounts: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 3,
      },
      ticketTransferEnabled: false,
      ticketLimit: 2,
      usheringAccounts: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
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
    setEditEventData({
      title: event.title,
      organizer: event.organizer,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      totalTickets: event.totalTickets,
      ticketLimit: event.ticketLimit,
      description: event.description,
      ticketTransferEnabled: event.ticketTransferEnabled,
      commissionRate: event.commissionRate,
      transferFee: event.transferFee,
      imageUrl: event.imageUrl,
      termsAndConditions: "",
      gallery: event.gallery || [],
      venueLayouts: [
        {
          id: "1",
          name: "Main Hall Layout",
          description:
            "Standard layout for the main event hall with multiple sections",
          totalCapacity: 500,
          imageUrl:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
          gateOpeningTime: "17:00",
          gateClosingTime: "23:00",
          sections: [
            {
              id: "1",
              name: "VIP Section",
              capacity: 100,
              price: 500,
              color: "#8B5CF6",
              description:
                "Premium seating with exclusive benefits and dedicated service",
              isActive: true,
            },
            {
              id: "2",
              name: "Regular Section",
              capacity: 300,
              price: 250,
              color: "#3B82F6",
              description: "Standard seating arrangement with good view",
              isActive: true,
            },
            {
              id: "3",
              name: "Early Bird Section",
              capacity: 100,
              price: 200,
              color: "#10B981",
              description:
                "Limited time discounted seating with basic amenities",
              isActive: true,
            },
          ],
        },
        {
          id: "2",
          name: "Outdoor Arena Layout",
          description: "Open-air venue layout for outdoor events",
          totalCapacity: 800,
          imageUrl:
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
          gateOpeningTime: "18:00",
          gateClosingTime: "22:30",
          sections: [
            {
              id: "4",
              name: "Premium Boxes",
              capacity: 50,
              price: 800,
              color: "#DC2626",
              description:
                "Private boxes with premium amenities and exclusive access",
              isActive: true,
            },
            {
              id: "5",
              name: "General Admission",
              capacity: 750,
              price: 150,
              color: "#F59E0B",
              description:
                "General admission with standing room and basic seating",
              isActive: true,
            },
          ],
        },
      ] as VenueLayout[],
      ticketCategories: [
        {
          id: "1",
          name: "VIP",
          price: 500,
          totalTickets: 100,
          soldTickets: 0,
          description: "Premium seating with exclusive benefits",
        },
        {
          id: "2",
          name: "Regular",
          price: 250,
          totalTickets: 300,
          soldTickets: 0,
          description: "Standard seating",
        },
        {
          id: "3",
          name: "Early Bird",
          price: 200,
          totalTickets: 200,
          soldTickets: 0,
          description: "Limited time discounted tickets",
        },
      ],
      discounts: [
        {
          id: "1",
          name: "Student Discount",
          type: "percentage",
          value: 20,
          code: "STUDENT20",
          validFrom: "",
          validTo: "",
          maxUses: 100,
          usedCount: 0,
          applicableCategories: ["Regular", "Early Bird"],
        },
        {
          id: "2",
          name: "Group Discount",
          type: "percentage",
          value: 15,
          code: "GROUP15",
          validFrom: "",
          validTo: "",
          maxUses: 50,
          usedCount: 0,
          applicableCategories: ["VIP", "Regular"],
          minQuantity: 5,
        },
      ],
    });
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
    // Validate required fields
    if (
      !editEventData.title ||
      !editEventData.organizer ||
      !editEventData.date ||
      !editEventData.location ||
      !editEventData.category
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Title, Organizer, Date, Location, Category)",
        variant: "destructive",
      });
      return;
    }

    // Validate ticket categories
    const hasValidCategories = editEventData.ticketCategories.some(
      (cat) => cat.name && cat.price > 0 && cat.totalTickets > 0
    );
    if (!hasValidCategories) {
      toast({
        title: "Validation Error",
        description:
          "Please add at least one valid ticket category with name, price, and total tickets",
        variant: "destructive",
      });
      return;
    }

    // Validate discounts
    const hasInvalidDiscounts = editEventData.discounts.some(
      (discount) =>
        discount.name &&
        (!discount.code || discount.value <= 0 || discount.maxUses <= 0)
    );
    if (hasInvalidDiscounts) {
      toast({
        title: "Validation Error",
        description:
          "Please ensure all discounts have valid codes, values, and usage limits",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("admin.events.toast.saveEventChanges"),
      description: t("admin.events.toast.saveEventChangesDesc"),
    });
    setIsEditDialogOpen(false);
  };

  // New handlers for enhanced edit features
  const handleEditEventDataChange = (field: string, value: any) => {
    setEditEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddGalleryImage = (imageUrl: string) => {
    // Basic URL validation
    if (!imageUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    // Check if URL is already in gallery
    if (editEventData.gallery.some((image) => image.url === imageUrl)) {
      toast({
        title: "Duplicate Image",
        description: "This image is already in the gallery",
        variant: "destructive",
      });
      return;
    }

    setEditEventData((prev) => {
      const newOrder = prev.gallery.length;
      const isFirstImage = prev.gallery.length === 0;

      return {
        ...prev,
        gallery: [
          ...prev.gallery,
          {
            id: Date.now().toString(),
            url: imageUrl,
            order: newOrder,
            isThumbnail: isFirstImage, // First image becomes thumbnail automatically
          },
        ],
      };
    });

    toast({
      title: "Image Added",
      description: "Image has been added to the gallery",
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    setEditEventData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSetThumbnail = (imageId: string) => {
    setEditEventData((prev) => ({
      ...prev,
      gallery: prev.gallery.map((image) => ({
        ...image,
        isThumbnail: image.id === imageId,
      })),
    }));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    setEditEventData((prev) => {
      const newGallery = [...prev.gallery];
      const [movedImage] = newGallery.splice(fromIndex, 1);
      newGallery.splice(toIndex, 0, movedImage);

      // Update order numbers and ensure first image is thumbnail if no thumbnail exists
      const updatedGallery = newGallery.map((image, index) => ({
        ...image,
        order: index,
      }));

      // If no thumbnail is set, make the first image the thumbnail
      const hasThumbnail = updatedGallery.some((img) => img.isThumbnail);
      if (!hasThumbnail && updatedGallery.length > 0) {
        updatedGallery[0].isThumbnail = true;
      }

      return {
        ...prev,
        gallery: updatedGallery,
      };
    });
  };

  const handleReorderGallery = (newOrder: GalleryImage[]) => {
    setEditEventData((prev) => {
      const updatedGallery = newOrder.map((image, index) => ({
        ...image,
        order: index,
      }));

      // If no thumbnail is set, make the first image the thumbnail
      const hasThumbnail = updatedGallery.some((img) => img.isThumbnail);
      if (!hasThumbnail && updatedGallery.length > 0) {
        updatedGallery[0].isThumbnail = true;
      }

      return {
        ...prev,
        gallery: updatedGallery,
      };
    });
  };

  const handleUpdateImageAlt = (imageId: string, alt: string) => {
    setEditEventData((prev) => ({
      ...prev,
      gallery: prev.gallery.map((image) =>
        image.id === imageId ? { ...image, alt } : image
      ),
    }));
  };

  const handleSetMainEventImage = (imageId: string) => {
    const image = editEventData.gallery.find((img) => img.id === imageId);
    if (image) {
      setEditEventData((prev) => ({
        ...prev,
        imageUrl: image.url, // Update the main event image
      }));
      toast({
        title: "Main Event Image Updated",
        description: "The main event image has been updated from the gallery",
      });
    }
  };

  const handleAddTicketCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      totalTickets: 0,
      soldTickets: 0,
      description: "",
    };
    setEditEventData((prev) => ({
      ...prev,
      ticketCategories: [...prev.ticketCategories, newCategory],
    }));
  };

  const handleUpdateTicketCategory = (
    index: number,
    field: string,
    value: any
  ) => {
    setEditEventData((prev) => ({
      ...prev,
      ticketCategories: prev.ticketCategories.map((category, i) =>
        i === index ? { ...category, [field]: value } : category
      ),
    }));
  };

  const handleRemoveTicketCategory = (index: number) => {
    setEditEventData((prev) => ({
      ...prev,
      ticketCategories: prev.ticketCategories.filter((_, i) => i !== index),
    }));
  };

  const handleAddDiscount = () => {
    const generateDiscountCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newDiscount = {
      id: Date.now().toString(),
      name: "",
      type: "percentage",
      value: 0,
      code: generateDiscountCode(),
      validFrom: "",
      validTo: "",
      maxUses: 100,
      usedCount: 0,
      applicableCategories: [],
    };
    setEditEventData((prev) => ({
      ...prev,
      discounts: [...prev.discounts, newDiscount],
    }));
  };

  const handleUpdateDiscount = (index: number, field: string, value: any) => {
    setEditEventData((prev) => ({
      ...prev,
      discounts: prev.discounts.map((discount, i) =>
        i === index ? { ...discount, [field]: value } : discount
      ),
    }));
  };

  const handleRemoveDiscount = (index: number) => {
    setEditEventData((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index),
    }));
  };

  // Venue layout handlers
  const handleAddVenueLayout = () => {
    const newLayout: VenueLayout = {
      id: Date.now().toString(),
      name: "",
      description: "",
      sections: [],
      totalCapacity: 0,
      imageUrl: "",
      gateOpeningTime: "",
      gateClosingTime: "",
    };
    setEditEventData((prev) => ({
      ...prev,
      venueLayouts: [...prev.venueLayouts, newLayout],
    }));
  };

  const handleUpdateVenueLayout = (
    index: number,
    field: string,
    value: any
  ) => {
    setEditEventData((prev) => ({
      ...prev,
      venueLayouts: prev.venueLayouts.map((layout, i) =>
        i === index ? { ...layout, [field]: value } : layout
      ),
    }));
  };

  const handleRemoveVenueLayout = (index: number) => {
    setEditEventData((prev) => ({
      ...prev,
      venueLayouts: prev.venueLayouts.filter((_, i) => i !== index),
    }));
  };

  const handleAddVenueSection = (layoutIndex: number) => {
    const newSection: VenueSection = {
      id: Date.now().toString(),
      name: "",
      capacity: 0,
      price: 0,
      color: "#3B82F6",
      description: "",
      isActive: true,
    };
    setEditEventData((prev) => ({
      ...prev,
      venueLayouts: prev.venueLayouts.map((layout, i) =>
        i === layoutIndex
          ? { ...layout, sections: [...layout.sections, newSection] }
          : layout
      ),
    }));
  };

  const handleUpdateVenueSection = (
    layoutIndex: number,
    sectionIndex: number,
    field: string,
    value: any
  ) => {
    setEditEventData((prev) => ({
      ...prev,
      venueLayouts: prev.venueLayouts.map((layout, i) =>
        i === layoutIndex
          ? {
              ...layout,
              sections: layout.sections.map((section, j) =>
                j === sectionIndex ? { ...section, [field]: value } : section
              ),
            }
          : layout
      ),
    }));
  };

  const handleRemoveVenueSection = (
    layoutIndex: number,
    sectionIndex: number
  ) => {
    setEditEventData((prev) => ({
      ...prev,
      venueLayouts: prev.venueLayouts.map((layout, i) =>
        i === layoutIndex
          ? {
              ...layout,
              sections: layout.sections.filter((_, j) => j !== sectionIndex),
            }
          : layout
      ),
    }));
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
      commissionRate: {
        type: "percentage",
        value: 10,
      },
      transferFee: {
        type: "percentage",
        value: 5,
      },
      ticketTransferEnabled: newEvent.ticketTransferEnabled,
      ticketLimit: newEvent.ticketLimit,
      usheringAccounts: 0,
      imageUrl: "/public/placeholderLogo.png",
      description: newEvent.description,
      gallery: [],
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
      commissionRate: {
        type: "percentage" as "percentage" | "flat",
        value: 10,
      },
      transferFee: {
        type: "percentage" as "percentage" | "flat",
        value: 5,
      },
      imageUrl: "",
      gallery: [],
    });
    setIsAddDialogOpen(false);
  };

  const handleNewEventChange = (
    field: string,
    value:
      | string
      | number
      | boolean
      | { type: "percentage" | "flat"; value: number }
  ) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Gallery management functions for new event
  const handleAddNewEventGalleryImage = (imageUrl: string) => {
    // Basic URL validation
    if (!imageUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    // Check if URL is already in gallery
    if (newEvent.gallery.some((image) => image.url === imageUrl)) {
      toast({
        title: "Duplicate Image",
        description: "This image is already in the gallery",
        variant: "destructive",
      });
      return;
    }

    setNewEvent((prev) => {
      const newOrder = prev.gallery.length;
      const isFirstImage = prev.gallery.length === 0;

      return {
        ...prev,
        gallery: [
          ...prev.gallery,
          {
            id: Date.now().toString(),
            url: imageUrl,
            order: newOrder,
            isThumbnail: isFirstImage, // First image becomes thumbnail automatically
          },
        ],
      };
    });

    toast({
      title: "Image Added",
      description: "Image has been added to the gallery",
    });
  };

  const handleRemoveNewEventGalleryImage = (index: number) => {
    setNewEvent((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSetNewEventThumbnail = (imageId: string) => {
    setNewEvent((prev) => ({
      ...prev,
      gallery: prev.gallery.map((image) => ({
        ...image,
        isThumbnail: image.id === imageId,
      })),
    }));
  };

  const handleSetNewEventMainImage = (imageId: string) => {
    const image = newEvent.gallery.find((img) => img.id === imageId);
    if (image) {
      setNewEvent((prev) => ({
        ...prev,
        imageUrl: image.url,
      }));
      toast({
        title: "Main Event Image Updated",
        description: "The main event image has been updated from the gallery",
      });
    }
  };

  // Usher management handlers
  const handleNewUsherChange = (field: string, value: string) => {
    setNewUsher((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddUsher = () => {
    if (!newUsher.name || !newUsher.email || !newUsher.assignedArea) {
      toast({
        title: t("admin.events.ushers.validationError"),
        description: t("admin.events.ushers.validationErrorDesc"),
        variant: "destructive",
      });
      return;
    }

    const newUsherObj = {
      id: `U${Date.now()}`,
      name: newUsher.name,
      email: newUsher.email,
      status: "active",
      assignedAreas: [newUsher.assignedArea],
      lastActive: "Just now",
    };

    setUshers((prev) => [...prev, newUsherObj]);
    setNewUsher({ name: "", email: "", assignedArea: "" });

    toast({
      title: t("admin.events.ushers.addSuccess"),
      description: t("admin.events.ushers.addSuccessDesc"),
    });
  };

  const handleEditUsher = (usher: any) => {
    setSelectedUsher(usher);
    setIsEditUsherDialogOpen(true);
  };

  const handleViewUsherActivity = (usher: any) => {
    setSelectedUsher(usher);
    setIsViewUsherActivityDialogOpen(true);
  };

  const handleRemoveUsher = (usherId: string) => {
    setUshers((prev) => prev.filter((usher) => usher.id !== usherId));
    toast({
      title: t("admin.events.ushers.removeSuccess"),
      description: t("admin.events.ushers.removeSuccessDesc"),
    });
  };

  const handleSaveUsherChanges = () => {
    if (selectedUsher) {
      setUshers((prev) =>
        prev.map((usher) =>
          usher.id === selectedUsher.id ? selectedUsher : usher
        )
      );
      setIsEditUsherDialogOpen(false);
      setSelectedUsher(null);
      toast({
        title: t("admin.events.ushers.editSuccess"),
        description: t("admin.events.ushers.editSuccessDesc"),
      });
    }
  };

  const handleSaveUsherManagementChanges = () => {
    toast({
      title: t("admin.events.ushers.saveSuccess"),
      description: t("admin.events.ushers.saveSuccessDesc"),
    });
    setIsUsherManagementDialogOpen(false);
  };

  const calculatePercentage = (sold: number, total: number) => {
    return total > 0 ? (sold / total) * 100 : 0;
  };

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.events.title")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.events.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <ExportDialog
            data={filteredEvents}
            columns={commonColumns.events}
            title={t("admin.events.title")}
            subtitle={t("admin.events.subtitle")}
            filename="events"
            filters={{
              search: searchTerm,
              status: statusFilter,
              category: categoryFilter,
              location: locationFilter,
              organizer: organizerFilter,
            }}
            onExport={(format) => {
              toast({
                title: t("admin.events.toast.exportSuccess"),
                description: t("admin.events.toast.exportSuccessDesc"),
              });
            }}
          >
            <Button variant="outline" className="text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 rtl:ml-1 sm:rtl:ml-2 rtl:mr-0" />
              <span className="hidden sm:inline">
                {t("admin.dashboard.actions.export")}
              </span>
              <span className="sm:hidden">Export</span>
            </Button>
          </ExportDialog>
          <Button onClick={handleAddEvent} className="text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 rtl:ml-1 sm:rtl:ml-2 rtl:mr-0" />
            <span className="hidden sm:inline">
              {t("admin.dashboard.actions.addEvent")}
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
                        <p className="text-xs text-muted-foreground">
                          Rate:{" "}
                          {event.commissionRate.type === "percentage"
                            ? `${event.commissionRate.value}%`
                            : `E£${event.commissionRate.value}`}
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
          <ResponsivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showInfo={true}
            infoText={`${t("admin.events.pagination.showing")} ${
              startIndex + 1
            }-${Math.min(endIndex, filteredEvents.length)} ${t(
              "admin.events.pagination.of"
            )} ${filteredEvents.length} ${t(
              "admin.events.pagination.results"
            )}`}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredEvents.length}
            itemsPerPage={itemsPerPage}
            className="mt-4"
          />
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
                      {formatNumberForLocale(
                        selectedEvent.ticketsSold,
                        i18n.language
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.metrics.ofSold", {
                        total: formatNumberForLocale(
                          selectedEvent.totalTickets,
                          i18n.language
                        ),
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
                      {formatCurrencyForLocale(
                        selectedEvent.revenue,
                        i18n.language
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.events.metrics.commission")}:{" "}
                      {formatCurrencyForLocale(
                        selectedEvent.commission,
                        i18n.language
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rate:{" "}
                      {selectedEvent.commissionRate.type === "percentage"
                        ? `${selectedEvent.commissionRate.value}%`
                        : `${formatCurrencyForLocale(
                            selectedEvent.commissionRate.value,
                            i18n.language
                          )} per ticket`}
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
                      {formatCurrencyForLocale(
                        selectedEvent.payout,
                        i18n.language
                      )}
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="rtl:text-right">
            <DialogTitle>{t("admin.events.dialogs.editEvent")}</DialogTitle>
            <DialogDescription>
              {t("admin.events.dialogs.editEventSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <>
              {/* Summary Card */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Event Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {editEventData.gallery.length}
                      </div>
                      <div className="text-muted-foreground">
                        Gallery Images
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">
                        {editEventData.venueLayouts.length}
                      </div>
                      <div className="text-muted-foreground">Venue Layouts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">
                        {editEventData.ticketCategories.length}
                      </div>
                      <div className="text-muted-foreground">
                        Ticket Categories
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">
                        {editEventData.discounts.length}
                      </div>
                      <div className="text-muted-foreground">
                        Active Discounts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">
                        {editEventData.termsAndConditions ? "✓" : "✗"}
                      </div>
                      <div className="text-muted-foreground">
                        Terms & Conditions
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="gallery">
                    Gallery ({editEventData.gallery.length})
                  </TabsTrigger>
                  <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                  <TabsTrigger value="venue">
                    Venue Layouts ({editEventData.venueLayouts.length})
                  </TabsTrigger>
                  <TabsTrigger value="tickets">
                    Ticket Categories ({editEventData.ticketCategories.length})
                  </TabsTrigger>
                  <TabsTrigger value="discounts">
                    Discounts ({editEventData.discounts.length})
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.eventTitle")}
                      </label>
                      <Input
                        value={editEventData.title}
                        onChange={(e) =>
                          handleEditEventDataChange("title", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.organizer")}
                      </label>
                      <Input
                        value={editEventData.organizer}
                        onChange={(e) =>
                          handleEditEventDataChange("organizer", e.target.value)
                        }
                        placeholder="Enter organizer name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.category")}
                      </label>
                      <Select
                        value={editEventData.category}
                        onValueChange={(value) =>
                          handleEditEventDataChange("category", value)
                        }
                      >
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
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.date")}
                      </label>
                      <Input
                        type="date"
                        value={editEventData.date}
                        onChange={(e) =>
                          handleEditEventDataChange("date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.time")}
                      </label>
                      <Input
                        type="time"
                        value={editEventData.time}
                        onChange={(e) =>
                          handleEditEventDataChange("time", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.location")}
                      </label>
                      <Input
                        value={editEventData.location}
                        onChange={(e) =>
                          handleEditEventDataChange("location", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.totalTickets")}
                      </label>
                      <Input
                        type="number"
                        value={editEventData.totalTickets}
                        onChange={(e) =>
                          handleEditEventDataChange(
                            "totalTickets",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.ticketLimit")}
                      </label>
                      <Input
                        type="number"
                        value={editEventData.ticketLimit}
                        onChange={(e) =>
                          handleEditEventDataChange(
                            "ticketLimit",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.form.description")}
                      </label>
                      <Textarea
                        value={editEventData.description}
                        onChange={(e) =>
                          handleEditEventDataChange(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Enter event description..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:flex-row-reverse rtl:space-x-reverse">
                    <Switch
                      checked={editEventData.ticketTransferEnabled}
                      onCheckedChange={(checked) =>
                        handleEditEventDataChange(
                          "ticketTransferEnabled",
                          checked
                        )
                      }
                    />
                    <span className="text-sm">
                      {t("admin.events.form.enableTicketTransfers")}
                    </span>
                  </div>

                  {/* Commission Rate Configuration */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3 rtl:text-right">
                      Commission Rate Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium rtl:text-right">
                          Commission Type
                        </label>
                        <Select
                          value={editEventData.commissionRate.type}
                          onValueChange={(value) =>
                            handleEditEventDataChange("commissionRate", {
                              ...editEventData.commissionRate,
                              type: value as "percentage" | "flat",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage (%)
                            </SelectItem>
                            <SelectItem value="flat">Flat Fee (E£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium rtl:text-right">
                          Commission Value
                        </label>
                        <Input
                          type="number"
                          value={editEventData.commissionRate.value}
                          onChange={(e) =>
                            handleEditEventDataChange("commissionRate", {
                              ...editEventData.commissionRate,
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder={
                            editEventData.commissionRate.type === "percentage"
                              ? "10"
                              : "50"
                          }
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="text-sm text-muted-foreground">
                          {editEventData.commissionRate.type ===
                          "percentage" ? (
                            <span>
                              Commission: {editEventData.commissionRate.value}%
                              of ticket price
                            </span>
                          ) : (
                            <span>
                              Commission: E£{editEventData.commissionRate.value}{" "}
                              per ticket
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-800">
                        <strong>Commission Calculation:</strong>
                        {editEventData.commissionRate.type === "percentage" ? (
                          <span>
                            {" "}
                            {editEventData.commissionRate.value}% of total
                            revenue
                          </span>
                        ) : (
                          <span>
                            {" "}
                            E£{editEventData.commissionRate.value} × number of
                            tickets sold
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Fee Configuration */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3 rtl:text-right">
                      Transfer Fee Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium rtl:text-right">
                          Transfer Fee Type
                        </label>
                        <Select
                          value={editEventData.transferFee.type}
                          onValueChange={(value) =>
                            handleEditEventDataChange("transferFee", {
                              ...editEventData.transferFee,
                              type: value as "percentage" | "flat",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage (%)
                            </SelectItem>
                            <SelectItem value="flat">Flat Fee (E£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium rtl:text-right">
                          Transfer Fee Value
                        </label>
                        <Input
                          type="number"
                          value={editEventData.transferFee.value}
                          onChange={(e) =>
                            handleEditEventDataChange("transferFee", {
                              ...editEventData.transferFee,
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder={
                            editEventData.transferFee.type === "percentage"
                              ? "5"
                              : "25"
                          }
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="text-sm text-muted-foreground">
                          {editEventData.transferFee.type === "percentage" ? (
                            <span>
                              Transfer Fee: {editEventData.transferFee.value}%
                              of ticket price
                            </span>
                          ) : (
                            <span>
                              Transfer Fee: E£{editEventData.transferFee.value}{" "}
                              per transfer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-xs text-orange-800">
                        <strong>Transfer Fee Calculation:</strong>
                        {editEventData.transferFee.type === "percentage" ? (
                          <span>
                            {" "}
                            {editEventData.transferFee.value}% of ticket price
                            when transferred
                          </span>
                        ) : (
                          <span>
                            {" "}
                            E£{editEventData.transferFee.value} per ticket
                            transfer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 rtl:text-right">
                      Event Gallery
                    </h3>

                    {/* Add Image Section */}
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-sm">Add New Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium rtl:text-right">
                              Image URL
                            </label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    const input = e.target as HTMLInputElement;
                                    if (input.value.trim()) {
                                      handleAddGalleryImage(input.value.trim());
                                      input.value = "";
                                    }
                                  }
                                }}
                              />
                              <Button
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                  if (input && input.value.trim()) {
                                    handleAddGalleryImage(input.value.trim());
                                    input.value = "";
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>

                          {/* Sample Image URLs for testing */}
                          <div>
                            <label className="text-sm font-medium rtl:text-right">
                              Quick Add Sample Images
                            </label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {[
                                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
                                "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
                                "https://images.unsplash.com/photo-1501281669025-7ec9d6aec993?w=400&h=300&fit=crop",
                                "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
                              ].map((url, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddGalleryImage(url)}
                                >
                                  Sample {index + 1}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gallery Display */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium rtl:text-right">
                          Gallery Images ({editEventData.gallery.length})
                        </h4>
                        {editEventData.gallery.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Sort gallery by order
                                const sortedGallery = [
                                  ...editEventData.gallery,
                                ].sort((a, b) => a.order - b.order);
                                handleReorderGallery(sortedGallery);
                              }}
                            >
                              Sort by Order
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditEventDataChange("gallery", [])
                              }
                              className="text-red-600"
                            >
                              Clear All
                            </Button>
                          </div>
                        )}
                      </div>

                      {editEventData.gallery.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>No images in gallery yet</p>
                          <p className="text-sm">
                            Add images using the form above
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Gallery Instructions */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-blue-600 mt-1">
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">
                                  Gallery Management Tips:
                                </p>
                                <ul className="space-y-1 text-xs">
                                  <li>• Drag images to reorder them</li>
                                  <li>
                                    • Click the star icon to set an image as
                                    thumbnail
                                  </li>
                                  <li>
                                    • The first image will be used as the main
                                    event image
                                  </li>
                                  <li>
                                    • Use the number badges to see the display
                                    order
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Gallery Grid with Drag & Drop */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {editEventData.gallery
                              .sort((a, b) => a.order - b.order)
                              .map((image, index) => (
                                <div
                                  key={image.id}
                                  className="relative group cursor-move"
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                      "text/plain",
                                      image.id
                                    );
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const draggedId =
                                      e.dataTransfer.getData("text/plain");
                                    const draggedIndex =
                                      editEventData.gallery.findIndex(
                                        (img) => img.id === draggedId
                                      );
                                    const targetIndex =
                                      editEventData.gallery.findIndex(
                                        (img) => img.id === image.id
                                      );
                                    if (
                                      draggedIndex !== -1 &&
                                      targetIndex !== -1 &&
                                      draggedIndex !== targetIndex
                                    ) {
                                      handleMoveImage(
                                        draggedIndex,
                                        targetIndex
                                      );
                                    }
                                  }}
                                >
                                  <img
                                    src={image.url}
                                    alt={
                                      image.alt || `Gallery image ${index + 1}`
                                    }
                                    className={`w-full h-32 object-cover rounded-lg border ${
                                      image.isThumbnail
                                        ? "ring-2 ring-yellow-400"
                                        : ""
                                    }`}
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "https://via.placeholder.com/400x300?text=Image+Error";
                                    }}
                                  />

                                  {/* Order Badge */}
                                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                    #{image.order + 1}
                                  </div>

                                  {/* Status Badges - Positioned to avoid overlap */}
                                  <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                                    {/* Thumbnail Badge */}
                                    {image.isThumbnail && (
                                      <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                        ★ Thumbnail
                                      </div>
                                    )}

                                    {/* Main Event Image Badge */}
                                    {editEventData.imageUrl === image.url && (
                                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                        🏠 Main
                                      </div>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetThumbnail(image.id);
                                      }}
                                      className={`bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:bg-yellow-100 border ${
                                        image.isThumbnail
                                          ? "bg-yellow-100 text-yellow-700"
                                          : ""
                                      }`}
                                      title={
                                        image.isThumbnail
                                          ? "Current thumbnail"
                                          : "Set as thumbnail"
                                      }
                                    >
                                      ★
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetMainEventImage(image.id);
                                      }}
                                      className={`bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-100 border ${
                                        editEventData.imageUrl === image.url
                                          ? "bg-blue-100 text-blue-700"
                                          : ""
                                      }`}
                                      title={
                                        editEventData.imageUrl === image.url
                                          ? "Current main image"
                                          : "Set as main event image"
                                      }
                                    >
                                      🏠
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const imageIndex =
                                          editEventData.gallery.findIndex(
                                            (img) => img.id === image.id
                                          );
                                        if (imageIndex !== -1) {
                                          handleRemoveGalleryImage(imageIndex);
                                        }
                                      }}
                                      className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                      title="Remove image"
                                    >
                                      ×
                                    </button>
                                  </div>

                                  {/* Image Info on Hover */}
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity max-w-[calc(100%-4rem)]">
                                    {image.alt || `Image ${index + 1}`}
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Gallery Summary */}
                          {editEventData.gallery.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                  <p>
                                    <strong>Total Images:</strong>{" "}
                                    {editEventData.gallery.length}
                                  </p>
                                  <p>
                                    <strong>Thumbnail:</strong>{" "}
                                    {editEventData.gallery.find(
                                      (img) => img.isThumbnail
                                    )?.alt || "Not set"}
                                  </p>
                                  <p>
                                    <strong>Main Event Image:</strong>{" "}
                                    {editEventData.gallery.find(
                                      (img) =>
                                        img.url === editEventData.imageUrl
                                    )?.alt || "Not set"}
                                  </p>
                                  <p>
                                    <strong>Display Order:</strong>{" "}
                                    {editEventData.gallery
                                      .sort((a, b) => a.order - b.order)
                                      .map((img, idx) => `#${idx + 1}`)
                                      .join(" → ")}
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <p>Drag to reorder • Click ★ for thumbnail</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Terms & Conditions Tab */}
                <TabsContent value="terms" className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold rtl:text-right">
                        Terms & Conditions
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const sampleTerms = `1. Event Terms and Conditions

By purchasing a ticket for this event, you agree to the following terms:

2. Entry Requirements
- Valid ID required for entry
- No refunds or exchanges
- Event may be cancelled due to weather or other circumstances

3. Behavior
- Respectful behavior expected
- No recording without permission
- Security reserves the right to remove attendees

4. Liability
- Event organizers are not responsible for personal injury
- Attendees participate at their own risk

5. Photography
- Event photography may be used for promotional purposes
- By attending, you consent to being photographed

6. Refund Policy
- No refunds unless event is cancelled
- In case of cancellation, full refunds will be issued

7. Contact Information
For questions about this event, please contact the organizer.`;
                            handleEditEventDataChange(
                              "termsAndConditions",
                              sampleTerms
                            );
                          }}
                        >
                          Load Sample
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEditEventDataChange("termsAndConditions", "")
                          }
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={editEventData.termsAndConditions}
                      onChange={(e) =>
                        handleEditEventDataChange(
                          "termsAndConditions",
                          e.target.value
                        )
                      }
                      placeholder="Enter event terms and conditions..."
                      className="min-h-[300px]"
                    />
                    {editEventData.termsAndConditions && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2 rtl:text-right">
                          Preview:
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">
                            {editEventData.termsAndConditions}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Ticket Categories Tab */}
                <TabsContent value="tickets" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold rtl:text-right">
                      Ticket Categories & Pricing
                    </h3>
                    <Button onClick={handleAddTicketCategory} size="sm">
                      <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      Add Category
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {editEventData.ticketCategories.map((category, index) => (
                      <Card key={category.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <Input
                              placeholder="Category name"
                              value={category.name}
                              onChange={(e) =>
                                handleUpdateTicketCategory(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="max-w-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveTicketCategory(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Price
                              </label>
                              <Input
                                type="number"
                                value={category.price}
                                onChange={(e) =>
                                  handleUpdateTicketCategory(
                                    index,
                                    "price",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Total Tickets
                              </label>
                              <Input
                                type="number"
                                value={category.totalTickets}
                                onChange={(e) =>
                                  handleUpdateTicketCategory(
                                    index,
                                    "totalTickets",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Sold Tickets
                              </label>
                              <Input
                                type="number"
                                value={category.soldTickets}
                                onChange={(e) =>
                                  handleUpdateTicketCategory(
                                    index,
                                    "soldTickets",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-sm font-medium rtl:text-right">
                                Description
                              </label>
                              <Textarea
                                value={category.description}
                                onChange={(e) =>
                                  handleUpdateTicketCategory(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Category description..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Venue Layouts Tab */}
                <TabsContent value="venue" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold rtl:text-right">
                      Venue Layouts & Seating
                    </h3>
                    <Button onClick={handleAddVenueLayout} size="sm">
                      <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      Add Layout
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {editEventData.venueLayouts.map((layout, layoutIndex) => (
                      <Card key={layout.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <Input
                                placeholder="Layout name"
                                value={layout.name}
                                onChange={(e) =>
                                  handleUpdateVenueLayout(
                                    layoutIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="max-w-xs mb-2"
                              />
                              <Textarea
                                placeholder="Layout description"
                                value={layout.description}
                                onChange={(e) =>
                                  handleUpdateVenueLayout(
                                    layoutIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleAddVenueSection(layoutIndex)
                                }
                              >
                                <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                                Add Section
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleRemoveVenueLayout(layoutIndex)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Layout Image URL
                              </label>
                              <Input
                                placeholder="Enter layout image URL"
                                value={layout.imageUrl || ""}
                                onChange={(e) =>
                                  handleUpdateVenueLayout(
                                    layoutIndex,
                                    "imageUrl",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Total Capacity
                              </label>
                              <Input
                                type="number"
                                value={layout.totalCapacity}
                                onChange={(e) =>
                                  handleUpdateVenueLayout(
                                    layoutIndex,
                                    "totalCapacity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Gate Times */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Gate Opening Time
                              </label>
                              <Input
                                type="time"
                                value={layout.gateOpeningTime || ""}
                                onChange={(e) =>
                                  handleUpdateVenueLayout(
                                    layoutIndex,
                                    "gateOpeningTime",
                                    e.target.value
                                  )
                                }
                                placeholder="18:00"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Time when gates open for entry
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Gate Closing Time
                              </label>
                              <Input
                                type="time"
                                value={layout.gateClosingTime || ""}
                                onChange={(e) =>
                                  handleUpdateVenueLayout(
                                    layoutIndex,
                                    "gateClosingTime",
                                    e.target.value
                                  )
                                }
                                placeholder="22:00"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Time when gates close for entry
                              </p>
                            </div>
                          </div>

                          {/* Quick Gate Time Presets */}
                          <div className="mb-4">
                            <label className="text-sm font-medium rtl:text-right">
                              Quick Gate Time Presets
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {[
                                {
                                  name: "Evening Event",
                                  open: "18:00",
                                  close: "22:00",
                                },
                                {
                                  name: "Afternoon Event",
                                  open: "14:00",
                                  close: "18:00",
                                },
                                {
                                  name: "Late Night",
                                  open: "20:00",
                                  close: "02:00",
                                },
                                {
                                  name: "All Day",
                                  open: "09:00",
                                  close: "17:00",
                                },
                              ].map((preset, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleUpdateVenueLayout(
                                      layoutIndex,
                                      "gateOpeningTime",
                                      preset.open
                                    );
                                    handleUpdateVenueLayout(
                                      layoutIndex,
                                      "gateClosingTime",
                                      preset.close
                                    );
                                  }}
                                >
                                  {preset.name}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Gate Times Summary */}
                          {(layout.gateOpeningTime ||
                            layout.gateClosingTime) && (
                            <div className="mb-4">
                              <label className="text-sm font-medium rtl:text-right">
                                Gate Schedule
                              </label>
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">
                                      Opening:
                                    </span>
                                    <span className="text-sm text-blue-600">
                                      {layout.gateOpeningTime || "Not set"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm font-medium">
                                      Closing:
                                    </span>
                                    <span className="text-sm text-red-600">
                                      {layout.gateClosingTime || "Not set"}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  ⚠️ Attendees must arrive before gate closing
                                  time
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Layout Preview */}
                          {layout.imageUrl && (
                            <div className="mb-4">
                              <label className="text-sm font-medium rtl:text-right">
                                Layout Preview
                              </label>
                              <div className="mt-2">
                                <img
                                  src={layout.imageUrl}
                                  alt={layout.name}
                                  className="w-full h-48 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://via.placeholder.com/400x300?text=Layout+Image";
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Sample Layout Images */}
                          {!layout.imageUrl && (
                            <div className="mb-4">
                              <label className="text-sm font-medium rtl:text-right">
                                Quick Add Sample Layout Images
                              </label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {[
                                  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
                                  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
                                  "https://images.unsplash.com/photo-1501281669025-7ec9d6aec993?w=400&h=300&fit=crop",
                                  "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
                                ].map((url, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateVenueLayout(
                                        layoutIndex,
                                        "imageUrl",
                                        url
                                      )
                                    }
                                  >
                                    Sample {index + 1}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sections */}
                          <div>
                            <h4 className="text-md font-medium mb-3 rtl:text-right">
                              Venue Sections ({layout.sections.length})
                            </h4>
                            <div className="space-y-3">
                              {layout.sections.map((section, sectionIndex) => (
                                <Card key={section.id} className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <label className="text-sm font-medium rtl:text-right">
                                            Section Name
                                          </label>
                                          <Input
                                            value={section.name}
                                            onChange={(e) =>
                                              handleUpdateVenueSection(
                                                layoutIndex,
                                                sectionIndex,
                                                "name",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Section name"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium rtl:text-right">
                                            Capacity
                                          </label>
                                          <Input
                                            type="number"
                                            value={section.capacity}
                                            onChange={(e) =>
                                              handleUpdateVenueSection(
                                                layoutIndex,
                                                sectionIndex,
                                                "capacity",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            placeholder="0"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium rtl:text-right">
                                            Price
                                          </label>
                                          <Input
                                            type="number"
                                            value={section.price}
                                            onChange={(e) =>
                                              handleUpdateVenueSection(
                                                layoutIndex,
                                                sectionIndex,
                                                "price",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            placeholder="0"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                        <div>
                                          <label className="text-sm font-medium rtl:text-right">
                                            Color
                                          </label>
                                          <div className="flex gap-2 items-center">
                                            <input
                                              type="color"
                                              value={section.color}
                                              onChange={(e) =>
                                                handleUpdateVenueSection(
                                                  layoutIndex,
                                                  sectionIndex,
                                                  "color",
                                                  e.target.value
                                                )
                                              }
                                              className="w-10 h-10 rounded border"
                                            />
                                            <Input
                                              value={section.color}
                                              onChange={(e) =>
                                                handleUpdateVenueSection(
                                                  layoutIndex,
                                                  sectionIndex,
                                                  "color",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="#3B82F6"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium rtl:text-right">
                                            Status
                                          </label>
                                          <div className="flex items-center space-x-2 rtl:flex-row-reverse rtl:space-x-reverse">
                                            <Switch
                                              checked={section.isActive}
                                              onCheckedChange={(checked) =>
                                                handleUpdateVenueSection(
                                                  layoutIndex,
                                                  sectionIndex,
                                                  "isActive",
                                                  checked
                                                )
                                              }
                                            />
                                            <span className="text-sm">
                                              {section.isActive
                                                ? "Active"
                                                : "Inactive"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-3">
                                        <label className="text-sm font-medium rtl:text-right">
                                          Description
                                        </label>
                                        <Textarea
                                          value={section.description}
                                          onChange={(e) =>
                                            handleUpdateVenueSection(
                                              layoutIndex,
                                              sectionIndex,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Section description..."
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveVenueSection(
                                          layoutIndex,
                                          sectionIndex
                                        )
                                      }
                                      className="text-red-600 ml-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Discounts Tab */}
                <TabsContent value="discounts" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold rtl:text-right">
                      Discounts & Promotions
                    </h3>
                    <Button onClick={handleAddDiscount} size="sm">
                      <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      Add Discount
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {editEventData.discounts.map((discount, index) => (
                      <Card key={discount.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <Input
                              placeholder="Discount name"
                              value={discount.name}
                              onChange={(e) =>
                                handleUpdateDiscount(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="max-w-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveDiscount(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Discount Type
                              </label>
                              <Select
                                value={discount.type}
                                onValueChange={(value) =>
                                  handleUpdateDiscount(index, "type", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    Percentage
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    Fixed Amount
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Value
                              </label>
                              <Input
                                type="number"
                                value={discount.value}
                                onChange={(e) =>
                                  handleUpdateDiscount(
                                    index,
                                    "value",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Discount Code
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  value={discount.code}
                                  onChange={(e) =>
                                    handleUpdateDiscount(
                                      index,
                                      "code",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., STUDENT20"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const chars =
                                      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                                    let result = "";
                                    for (let i = 0; i < 8; i++) {
                                      result += chars.charAt(
                                        Math.floor(Math.random() * chars.length)
                                      );
                                    }
                                    handleUpdateDiscount(index, "code", result);
                                  }}
                                  title="Generate new code"
                                >
                                  🔄
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Max Uses
                              </label>
                              <Input
                                type="number"
                                value={discount.maxUses}
                                onChange={(e) =>
                                  handleUpdateDiscount(
                                    index,
                                    "maxUses",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Valid From
                              </label>
                              <Input
                                type="date"
                                value={discount.validFrom}
                                onChange={(e) =>
                                  handleUpdateDiscount(
                                    index,
                                    "validFrom",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium rtl:text-right">
                                Valid To
                              </label>
                              <Input
                                type="date"
                                value={discount.validTo}
                                onChange={(e) =>
                                  handleUpdateDiscount(
                                    index,
                                    "validTo",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium rtl:text-right">
                                Applicable Categories
                              </label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {editEventData.ticketCategories.map(
                                  (category) => (
                                    <label
                                      key={category.id}
                                      className="flex items-center space-x-2 rtl:flex-row-reverse rtl:space-x-reverse"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={discount.applicableCategories.includes(
                                          category.name
                                        )}
                                        onChange={(e) => {
                                          const currentCategories =
                                            discount.applicableCategories;
                                          if (e.target.checked) {
                                            handleUpdateDiscount(
                                              index,
                                              "applicableCategories",
                                              [
                                                ...currentCategories,
                                                category.name,
                                              ]
                                            );
                                          } else {
                                            handleUpdateDiscount(
                                              index,
                                              "applicableCategories",
                                              currentCategories.filter(
                                                (cat) => cat !== category.name
                                              )
                                            );
                                          }
                                        }}
                                      />
                                      <span className="text-sm">
                                        {category.name}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            </div>
                            {discount.type === "percentage" && (
                              <div>
                                <label className="text-sm font-medium rtl:text-right">
                                  Minimum Quantity (for group discounts)
                                </label>
                                <Input
                                  type="number"
                                  value={discount.minQuantity || 0}
                                  onChange={(e) =>
                                    handleUpdateDiscount(
                                      index,
                                      "minQuantity",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

            {/* Commission Rate Configuration */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 rtl:text-right">
                Commission Rate Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    Commission Type
                  </label>
                  <Select
                    value={newEvent.commissionRate.type}
                    onValueChange={(value) =>
                      handleNewEventChange("commissionRate", {
                        ...newEvent.commissionRate,
                        type: value as "percentage" | "flat",
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
                    Commission Value
                  </label>
                  <Input
                    type="number"
                    value={newEvent.commissionRate.value}
                    onChange={(e) =>
                      handleNewEventChange("commissionRate", {
                        ...newEvent.commissionRate,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder={
                      newEvent.commissionRate.type === "percentage"
                        ? "10"
                        : "50"
                    }
                  />
                </div>
              </div>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-800">
                  <strong>Commission Calculation:</strong>
                  {newEvent.commissionRate.type === "percentage" ? (
                    <span>
                      {" "}
                      {newEvent.commissionRate.value}% of total revenue
                    </span>
                  ) : (
                    <span>
                      {" "}
                      E£{newEvent.commissionRate.value} × number of tickets sold
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Transfer Fee Configuration */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 rtl:text-right">
                Transfer Fee Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    Transfer Fee Type
                  </label>
                  <Select
                    value={newEvent.transferFee.type}
                    onValueChange={(value) =>
                      handleNewEventChange("transferFee", {
                        ...newEvent.transferFee,
                        type: value as "percentage" | "flat",
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
                    Transfer Fee Value
                  </label>
                  <Input
                    type="number"
                    value={newEvent.transferFee.value}
                    onChange={(e) =>
                      handleNewEventChange("transferFee", {
                        ...newEvent.transferFee,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder={
                      newEvent.transferFee.type === "percentage" ? "5" : "25"
                    }
                  />
                </div>
              </div>
              <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-800">
                  <strong>Transfer Fee Calculation:</strong>
                  {newEvent.transferFee.type === "percentage" ? (
                    <span>
                      {" "}
                      {newEvent.transferFee.value}% of ticket price when
                      transferred
                    </span>
                  ) : (
                    <span>
                      {" "}
                      E£{newEvent.transferFee.value} per ticket transfer
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Event Gallery */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 rtl:text-right">
                Event Gallery
              </h4>

              {/* Add Image Section */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Add New Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        Image URL
                      </label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                handleAddNewEventGalleryImage(
                                  input.value.trim()
                                );
                                input.value = "";
                              }
                            }
                          }}
                        />
                        <Button
                          onClick={(e) => {
                            const input = e.currentTarget
                              .previousElementSibling as HTMLInputElement;
                            if (input && input.value.trim()) {
                              handleAddNewEventGalleryImage(input.value.trim());
                              input.value = "";
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Sample Image URLs for testing */}
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        Quick Add Sample Images
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {[
                          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
                          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
                          "https://images.unsplash.com/photo-1501281669025-7ec9d6aec993?w=400&h=300&fit=crop",
                          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
                        ].map((url, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddNewEventGalleryImage(url)}
                          >
                            Sample {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Display */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium rtl:text-right">
                    Gallery Images ({newEvent.gallery.length})
                  </h4>
                  {newEvent.gallery.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const sortedGallery = [...newEvent.gallery].sort(
                            (a, b) => a.order - b.order
                          );
                          setNewEvent((prev) => ({
                            ...prev,
                            gallery: sortedGallery.map((image, index) => ({
                              ...image,
                              order: index,
                            })),
                          }));
                        }}
                      >
                        Sort by Order
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setNewEvent((prev) => ({ ...prev, gallery: [] }))
                        }
                        className="text-red-600"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                {newEvent.gallery.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No images in gallery yet</p>
                    <p className="text-sm">Add images using the form above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Gallery Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-1">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">
                            Gallery Management Tips:
                          </p>
                          <ul className="space-y-1 text-xs">
                            <li>
                              • Click the star icon to set an image as thumbnail
                            </li>
                            <li>
                              • Click the house icon to set an image as main
                              event image
                            </li>
                            <li>
                              • The first image will be used as the main event
                              image
                            </li>
                            <li>
                              • Use the number badges to see the display order
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {newEvent.gallery
                        .sort((a, b) => a.order - b.order)
                        .map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.alt || `Gallery image ${index + 1}`}
                              className={`w-full h-32 object-cover rounded-lg border ${
                                image.isThumbnail
                                  ? "ring-2 ring-yellow-400"
                                  : ""
                              }`}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/400x300?text=Image+Error";
                              }}
                            />

                            {/* Order Badge */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              #{image.order + 1}
                            </div>

                            {/* Status Badges - Positioned to avoid overlap */}
                            <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                              {/* Thumbnail Badge */}
                              {image.isThumbnail && (
                                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                  ★ Thumbnail
                                </div>
                              )}

                              {/* Main Event Image Badge */}
                              {newEvent.imageUrl === image.url && (
                                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                  🏠 Main
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetNewEventThumbnail(image.id);
                                }}
                                className={`bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:bg-yellow-100 border ${
                                  image.isThumbnail
                                    ? "bg-yellow-100 text-yellow-700"
                                    : ""
                                }`}
                                title={
                                  image.isThumbnail
                                    ? "Current thumbnail"
                                    : "Set as thumbnail"
                                }
                              >
                                ★
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetNewEventMainImage(image.id);
                                }}
                                className={`bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-100 border ${
                                  newEvent.imageUrl === image.url
                                    ? "bg-blue-100 text-blue-700"
                                    : ""
                                }`}
                                title={
                                  newEvent.imageUrl === image.url
                                    ? "Current main image"
                                    : "Set as main event image"
                                }
                              >
                                🏠
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const imageIndex = newEvent.gallery.findIndex(
                                    (img) => img.id === image.id
                                  );
                                  if (imageIndex !== -1) {
                                    handleRemoveNewEventGalleryImage(
                                      imageIndex
                                    );
                                  }
                                }}
                                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>

                            {/* Image Info on Hover */}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity max-w-[calc(100%-4rem)]">
                              {image.alt || `Image ${index + 1}`}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Gallery Summary */}
                    {newEvent.gallery.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <p>
                              <strong>Total Images:</strong>{" "}
                              {newEvent.gallery.length}
                            </p>
                            <p>
                              <strong>Thumbnail:</strong>{" "}
                              {newEvent.gallery.find((img) => img.isThumbnail)
                                ?.alt || "Not set"}
                            </p>
                            <p>
                              <strong>Main Event Image:</strong>{" "}
                              {newEvent.gallery.find(
                                (img) => img.url === newEvent.imageUrl
                              )?.alt || "Not set"}
                            </p>
                            <p>
                              <strong>Display Order:</strong>{" "}
                              {newEvent.gallery
                                .sort((a, b) => a.order - b.order)
                                .map((img, idx) => `#${idx + 1}`)
                                .join(" → ")}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            <p>
                              Click ★ for thumbnail • Click 🏠 for main image
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                    <p className="text-xs text-muted-foreground">
                      Rate:{" "}
                      {selectedEventForAnalytics.commissionRate.type ===
                      "percentage"
                        ? `${selectedEventForAnalytics.commissionRate.value}%`
                        : `E£${selectedEventForAnalytics.commissionRate.value} per ticket`}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    {ushers.map((usher) => (
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
                              <DropdownMenuItem
                                onClick={() => handleEditUsher(usher)}
                              >
                                <Edit className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                {t("admin.events.ushers.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleViewUsherActivity(usher)}
                              >
                                <Activity className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                {t("admin.events.ushers.viewActivity")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleRemoveUsher(usher.id)}
                              >
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
                      <Input
                        placeholder={t("admin.events.ushers.enterName")}
                        value={newUsher.name}
                        onChange={(e) =>
                          handleNewUsherChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.email")}
                      </label>
                      <Input
                        placeholder={t("admin.events.ushers.enterEmail")}
                        value={newUsher.email}
                        onChange={(e) =>
                          handleNewUsherChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.assignedArea")}
                      </label>
                      <Select
                        value={newUsher.assignedArea}
                        onValueChange={(value) =>
                          handleNewUsherChange("assignedArea", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("admin.events.ushers.selectArea")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gate A">Gate A</SelectItem>
                          <SelectItem value="Gate B">Gate B</SelectItem>
                          <SelectItem value="Gate C">Gate C</SelectItem>
                          <SelectItem value="VIP Section">
                            VIP Section
                          </SelectItem>
                          <SelectItem value="General Section">
                            General Section
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={handleAddUsher}>
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
            <Button onClick={handleSaveUsherManagementChanges}>
              {t("admin.events.ushers.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Usher Dialog */}
      <Dialog
        open={isEditUsherDialogOpen}
        onOpenChange={setIsEditUsherDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader className="rtl:text-right">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {t("admin.events.ushers.editUsher")} - {selectedUsher?.name}
            </DialogTitle>
            <DialogDescription>
              {t("admin.events.ushers.editUsherSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedUsher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.ushers.name")}
                  </label>
                  <Input
                    value={selectedUsher.name}
                    onChange={(e) =>
                      setSelectedUsher({
                        ...selectedUsher,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.ushers.email")}
                  </label>
                  <Input
                    value={selectedUsher.email}
                    onChange={(e) =>
                      setSelectedUsher({
                        ...selectedUsher,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.ushers.status")}
                  </label>
                  <Select
                    value={selectedUsher.status}
                    onValueChange={(value) =>
                      setSelectedUsher({ ...selectedUsher, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("admin.events.ushers.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("admin.events.ushers.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.events.ushers.assignedAreas")}
                  </label>
                  <Select
                    value={selectedUsher.assignedAreas[0] || ""}
                    onValueChange={(value) =>
                      setSelectedUsher({
                        ...selectedUsher,
                        assignedAreas: [value],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("admin.events.ushers.selectArea")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gate A">Gate A</SelectItem>
                      <SelectItem value="Gate B">Gate B</SelectItem>
                      <SelectItem value="Gate C">Gate C</SelectItem>
                      <SelectItem value="VIP Section">VIP Section</SelectItem>
                      <SelectItem value="General Section">
                        General Section
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
              onClick={() => setIsEditUsherDialogOpen(false)}
            >
              {t("admin.events.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveUsherChanges}>
              {t("admin.events.dialogs.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Usher Activity Dialog */}
      <Dialog
        open={isViewUsherActivityDialogOpen}
        onOpenChange={setIsViewUsherActivityDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="rtl:text-right">
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("admin.events.ushers.usherActivity")} - {selectedUsher?.name}
            </DialogTitle>
            <DialogDescription>
              {t("admin.events.ushers.usherActivitySubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedUsher && (
            <div className="space-y-6">
              {/* Usher Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.ushers.usherInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.name")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUsher.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.email")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUsher.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium rtl:text-right">
                        {t("admin.events.ushers.status")}
                      </p>
                      <Badge
                        className={
                          selectedUsher.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedUsher.status === "active"
                          ? t("admin.events.ushers.active")
                          : t("admin.events.ushers.inactive")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.ushers.recentActivity")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: t("admin.events.ushers.activity.ticketScanned"),
                        time: "2 hours ago",
                        details: "VIP Section - Ticket #12345",
                      },
                      {
                        action: t("admin.events.ushers.activity.guestAssisted"),
                        time: "3 hours ago",
                        details: "Gate A - Customer inquiry",
                      },
                      {
                        action: t("admin.events.ushers.activity.ticketScanned"),
                        time: "4 hours ago",
                        details: "VIP Section - Ticket #12344",
                      },
                      {
                        action: t("admin.events.ushers.activity.areaPatrolled"),
                        time: "5 hours ago",
                        details: "VIP Section - Security check",
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
                          {activity.time} • {activity.details}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm rtl:text-right">
                    {t("admin.events.ushers.performanceStats")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        156
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.events.ushers.ticketsScanned")}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">23</div>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.events.ushers.guestsAssisted")}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        8.5h
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.events.ushers.activeTime")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsViewUsherActivityDialogOpen(false)}
            >
              {t("admin.events.dialogs.close")}
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: t("admin.events.ushers.exportSuccess"),
                  description: t("admin.events.ushers.exportSuccessDesc"),
                });
              }}
            >
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.events.ushers.exportActivity")}
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
