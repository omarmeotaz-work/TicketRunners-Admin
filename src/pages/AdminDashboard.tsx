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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  TrendingUp,
  DollarSign,
  Clock,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  EyeOff,
  Sun,
  Moon,
  LogOut,
  Download,
  FileText,
  Receipt,
  CreditCard,
  UserCheck,
  UserX,
  Shield,
  Settings,
  Plus,
  Edit,
  Trash2,
  Ban,
  RefreshCw,
  Key,
  QrCode,
  Database,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowUpDown,
  CalendarDays,
  Building2,
  Wallet,
  Target,
  Zap,
  Star,
  StarOff,
  Repeat,
  Clock3,
  CalendarX,
  UserCog,
  Crown,
  Users2,
  UserCheck2,
  UserX2,
  ActivitySquare,
  TrendingDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import i18n from "@/lib/i18n";
import { formatNumberForLocale, formatCurrencyForLocale } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import SystemLogs from "@/components/admin/SystemLogs";
import { ExportDialog } from "@/components/ui/export-dialog";
import { commonColumns, formatCurrency } from "@/lib/exportUtils";

import {
  LineChart,
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

// Import admin components
import EventsManagement from "@/components/admin/EventsManagement";
import TicketsManagement from "@/components/admin/TicketsManagement";
import NFCCardManagement from "@/components/admin/NFCCardManagement";
import CustomerManagement from "@/components/admin/CustomerManagement";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import VenueManagement from "@/components/admin/VenueManagement";

// Types
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "usher" | "support";
  status: "active" | "inactive";
  lastLogin: string;
  permissions: string[];
  createdAt: string;
}

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
};

type NFCCard = {
  id: string;
  serialNumber: string;
  customerId: string;
  customerName: string;
  status: "active" | "inactive" | "expired";
  issueDate: string;
  expiryDate: string;
  balance: number;
  lastUsed: string;
  usageCount: number;
};

type Event = {
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
};

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
};

type DashboardStats = {
  // Event Analytics
  totalEvents: number;
  totalTicketsSold: number;
  totalAttendees: number;

  // Financial Summary
  totalRevenues: number;
  cutCommissions: number;
  pendingPayouts: number;
  completedPayouts: number;
  cardSales: number;
  grossProfit: number;

  // User Summary
  totalVisitors: number;
  registeredUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recurrentUsers: number;

  // Card Summary
  totalCards: number;
  activeCards: number;
  inactiveCards: number;
  expiredCards: number;
};

const AdminDashboard: React.FC = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const language = i18nInstance.language === "ar" ? "العربية" : "English";

  // Get date locale based on current language
  const getDateLocale = () => {
    return i18nInstance.language === "ar" ? ar : enUS;
  };

  // Format date for current locale
  const formatDateForLocale = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "PPP", { locale: getDateLocale() });
  };

  // Dynamic chart data that updates with language changes
  const [chartData, setChartData] = useState({
    revenueData: [] as Array<{
      month: string;
      revenue: number;
      commission: number;
      payout: number;
    }>,
    userGrowthData: [] as Array<{
      month: string;
      visitors: number;
      registered: number;
      active: number;
    }>,
    cardStatusData: [] as Array<{ name: string; value: number; color: string }>,
    eventCategoryData: [] as Array<{
      name: string;
      value: number;
      color: string;
    }>,
  });

  // Update chart data when language changes
  useEffect(() => {
    const revenueData = [
      {
        month: t("admin.dashboard.stats.months.jan"),
        revenue: 45000,
        commission: 4500,
        payout: 40500,
      },
      {
        month: t("admin.dashboard.stats.months.feb"),
        revenue: 52000,
        commission: 5200,
        payout: 46800,
      },
      {
        month: t("admin.dashboard.stats.months.mar"),
        revenue: 48000,
        commission: 4800,
        payout: 43200,
      },
      {
        month: t("admin.dashboard.stats.months.apr"),
        revenue: 61000,
        commission: 6100,
        payout: 54900,
      },
      {
        month: t("admin.dashboard.stats.months.may"),
        revenue: 55000,
        commission: 5500,
        payout: 49500,
      },
      {
        month: t("admin.dashboard.stats.months.jun"),
        revenue: 67000,
        commission: 6700,
        payout: 60300,
      },
    ];

    const userGrowthData = [
      {
        month: t("admin.dashboard.stats.months.jan"),
        visitors: 1200,
        registered: 180,
        active: 150,
      },
      {
        month: t("admin.dashboard.stats.months.feb"),
        visitors: 1400,
        registered: 220,
        active: 190,
      },
      {
        month: t("admin.dashboard.stats.months.mar"),
        visitors: 1300,
        registered: 200,
        active: 170,
      },
      {
        month: t("admin.dashboard.stats.months.apr"),
        visitors: 1600,
        registered: 280,
        active: 240,
      },
      {
        month: t("admin.dashboard.stats.months.may"),
        visitors: 1500,
        registered: 250,
        active: 220,
      },
      {
        month: t("admin.dashboard.stats.months.jun"),
        visitors: 1800,
        registered: 320,
        active: 280,
      },
    ];

    const cardStatusData = [
      {
        name: t("admin.dashboard.stats.labels.activeCards"),
        value: 450,
        color: "#10b981",
      },
      {
        name: t("admin.dashboard.stats.labels.inactiveCards"),
        value: 120,
        color: "#6b7280",
      },
      {
        name: t("admin.dashboard.stats.labels.expiredCards"),
        value: 80,
        color: "#ef4444",
      },
    ];

    const eventCategoryData = [
      {
        name: t("admin.dashboard.stats.labels.music"),
        value: 35,
        color: "#3b82f6",
      },
      {
        name: t("admin.dashboard.stats.labels.technology"),
        value: 25,
        color: "#8b5cf6",
      },
      {
        name: t("admin.dashboard.stats.labels.art"),
        value: 20,
        color: "#f59e0b",
      },
      {
        name: t("admin.dashboard.stats.labels.sports"),
        value: 15,
        color: "#10b981",
      },
      {
        name: t("admin.dashboard.stats.labels.other"),
        value: 5,
        color: "#6b7280",
      },
    ];

    setChartData({
      revenueData,
      userGrowthData,
      cardStatusData,
      eventCategoryData,
    });
  }, [t, i18nInstance.language]);

  useEffect(() => {
    if (localStorage.getItem("admin_authenticated") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const storedLang = localStorage.getItem("appLanguage");
    if (storedLang) {
      i18nInstance.changeLanguage(storedLang);
    }
  }, [i18nInstance]);

  const toggleLanguage = () => {
    const newLang = i18nInstance.language === "ar" ? "en" : "ar";
    i18nInstance.changeLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
    toast({
      title: t("admin.dashboard.actions.logout"),
      description: t("admin.dashboard.actions.logoutSuccess"),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    navigate("/login");
    toast({
      title: t("admin.dashboard.actions.logout"),
      description: t("admin.dashboard.actions.logoutSuccess"),
    });
  };

  // Mock dashboard statistics
  const dashboardStats: DashboardStats = {
    // Event Analytics
    totalEvents: 156,
    totalTicketsSold: 12450,
    totalAttendees: 11800,

    // Financial Summary
    totalRevenues: 3280000,
    cutCommissions: 328000,
    pendingPayouts: 450000,
    completedPayouts: 2502000,
    cardSales: 125000,
    grossProfit: 2952000,

    // User Summary
    totalVisitors: 45000,
    registeredUsers: 8500,
    activeUsers: 7200,
    inactiveUsers: 1300,
    recurrentUsers: 3800,

    // Card Summary
    totalCards: 650,
    activeCards: 450,
    inactiveCards: 120,
    expiredCards: 80,
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div
      className="min-h-screen bg-gradient-dark"
      dir={i18nInstance.language === "ar" ? "rtl" : "ltr"}
    >
      <style>
        {`
          .rtl-label {
            text-align: right !important;
            direction: rtl !important;
          }
          .ltr-label {
            text-align: left !important;
            direction: ltr !important;
          }
          /* RTL Chart Styles */
          [dir="rtl"] .recharts-wrapper {
            direction: rtl;
          }
          [dir="rtl"] .recharts-cartesian-axis-tick-value {
            text-anchor: start !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-legend-item-text {
            text-align: right !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-tooltip-wrapper {
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-tooltip-content {
            text-align: right !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-pie-label-text {
            text-anchor: middle !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-legend-wrapper {
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-legend-item {
            direction: rtl !important;
          }
          /* Chart container RTL */
          [dir="rtl"] .chart-container {
            direction: rtl;
          }
          /* Additional RTL chart styles */
          [dir="rtl"] .recharts-cartesian-axis-tick {
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-cartesian-axis-line {
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-cartesian-grid-horizontal line {
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-cartesian-grid-vertical line {
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-tooltip-cursor {
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-default-tooltip {
            text-align: right !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-tooltip-item {
            text-align: right !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-tooltip-item-list {
            text-align: right !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-legend-item-text {
            text-align: right !important;
            direction: rtl !important;
          }
          [dir="rtl"] .recharts-legend-item {
            flex-direction: row-reverse !important;
          }
          [dir="rtl"] .recharts-legend-item .recharts-legend-icon {
            margin-left: 8px !important;
            margin-right: 0 !important;
          }
          /* Arabic number formatting */
          [dir="rtl"] .arabic-number {
            font-family: 'Arial', sans-serif;
            direction: ltr;
            unicode-bidi: bidi-override;
          }
          /* RTL number containers */
          [dir="rtl"] .number-container {
            direction: ltr;
            text-align: right;
          }
          /* RTL date formatting */
          [dir="rtl"] .date-container {
            direction: ltr;
            text-align: right;
          }
          /* RTL currency formatting */
          [dir="rtl"] .currency-container {
            direction: ltr;
            text-align: right;
          }
        `}
      </style>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-8 flex-shrink-0 rtl:space-x-reverse">
              <img
                src={isDark ? "/ticket-logo.png" : "/ticket-logo-secondary.png"}
                alt={t("footer.logoAlt")}
                className="h-10 w-auto sm:h-12 md:h-14"
              />
              <div className="hidden sm:block rtl:mr-6 ltr:ml-6">
                <span className="text-lg font-bold text-foreground">
                  {t("admin.dashboard.title")}
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-x-2 ltr:flex-row rtl:flex-row-reverse">
              <div className="flex items-center gap-2 rtl:flex-row-reverse">
                <Sun className="h-4 w-4 text-foreground" />
                <Switch
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-primary"
                />
                <Moon className="h-4 w-4 text-foreground" />
              </div>
              <Button
                variant="header"
                size="icon"
                onClick={toggleLanguage}
                className="rtl:flex-row-reverse"
              >
                <span className="text-xs rtl:ml-0 ltr:ml-1 text-foreground">
                  {language}
                </span>
              </Button>
              <Button variant="header" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-foreground" />
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2 rtl:flex-row-reverse">
              <Button
                variant="header"
                size="icon"
                onClick={toggleLanguage}
                className="rtl:flex-row-reverse"
              >
                <span className="text-xs text-foreground">{language}</span>
              </Button>
              <Button variant="header" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 rtl:text-right">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            {t("admin.dashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="dashboard"
          className="space-y-6"
        >
          <TabsList className="flex w-full rtl:flex-row-reverse">
            <TabsTrigger value="dashboard" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.dashboard")}
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.events")}
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.venues")}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.tickets")}
            </TabsTrigger>
            <TabsTrigger value="nfc" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.nfc")}
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.customers")}
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.admins")}
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex-1 rtl:text-right">
              {t("admin.dashboard.logs.title")}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 rtl:text-right">
              {t("admin.dashboard.tabs.analytics")}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Header with Export */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
                  {t("admin.dashboard.tabs.dashboard")}
                </h2>
                <p className="text-muted-foreground rtl:text-right ltr:text-left">
                  {t("admin.dashboard.subtitle")}
                </p>
              </div>
              <ExportDialog
                data={[
                  // Event Analytics
                  {
                    metric: t("admin.dashboard.stats.totalEvents"),
                    value: dashboardStats.totalEvents,
                    category: "Event Analytics",
                  },
                  {
                    metric: t("admin.dashboard.stats.ticketsSold"),
                    value: dashboardStats.totalTicketsSold,
                    category: "Event Analytics",
                  },
                  {
                    metric: t("admin.dashboard.stats.totalAttendees"),
                    value: dashboardStats.totalAttendees,
                    category: "Event Analytics",
                  },
                  // Financial Summary
                  {
                    metric: t("admin.dashboard.stats.totalRevenue"),
                    value: dashboardStats.totalRevenues,
                    category: "Financial Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.commission"),
                    value: dashboardStats.cutCommissions,
                    category: "Financial Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.pendingPayouts"),
                    value: dashboardStats.pendingPayouts,
                    category: "Financial Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.completedPayouts"),
                    value: dashboardStats.completedPayouts,
                    category: "Financial Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.cardSales"),
                    value: dashboardStats.cardSales,
                    category: "Financial Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.grossProfit"),
                    value: dashboardStats.grossProfit,
                    category: "Financial Summary",
                  },
                  // User Summary
                  {
                    metric: t("admin.dashboard.stats.totalVisitors"),
                    value: dashboardStats.totalVisitors,
                    category: "User Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.registeredUsers"),
                    value: dashboardStats.registeredUsers,
                    category: "User Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.activeUsers"),
                    value: dashboardStats.activeUsers,
                    category: "User Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.inactiveUsers"),
                    value: dashboardStats.inactiveUsers,
                    category: "User Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.recurrentUsers"),
                    value: dashboardStats.recurrentUsers,
                    category: "User Summary",
                  },
                  // Card Summary
                  {
                    metric: t("admin.dashboard.stats.totalCards"),
                    value: dashboardStats.totalCards,
                    category: "Card Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.activeCards"),
                    value: dashboardStats.activeCards,
                    category: "Card Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.inactiveCards"),
                    value: dashboardStats.inactiveCards,
                    category: "Card Summary",
                  },
                  {
                    metric: t("admin.dashboard.stats.expiredCards"),
                    value: dashboardStats.expiredCards,
                    category: "Card Summary",
                  },
                ]}
                columns={commonColumns.dashboardStats}
                title={t("admin.dashboard.tabs.dashboard")}
                subtitle={t("admin.dashboard.subtitle")}
                filename="dashboard-stats"
              >
                <Button className="flex items-center gap-2 rtl:flex-row-reverse">
                  <Download className="h-4 w-4" />
                  {t("admin.export.title")}
                </Button>
              </ExportDialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rtl:space-x-reverse">
              {/* Event Analytics */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
                  <div className="flex-1 rtl:text-right">
                    <CardTitle className="text-sm font-medium">
                      {t("admin.dashboard.stats.totalEvents")}
                    </CardTitle>
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="text-2xl font-bold number-container">
                    {formatNumberForLocale(
                      dashboardStats.totalEvents,
                      i18nInstance.language
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground rtl:text-right">
                    +12% {t("admin.dashboard.stats.fromLastMonth")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
                  <div className="flex-1 rtl:text-right">
                    <CardTitle className="text-sm font-medium">
                      {t("admin.dashboard.stats.ticketsSold")}
                    </CardTitle>
                  </div>
                  <Ticket className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="text-2xl font-bold number-container">
                    {formatNumberForLocale(
                      dashboardStats.totalTicketsSold,
                      i18nInstance.language
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground rtl:text-right">
                    +8% {t("admin.dashboard.stats.fromLastMonth")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
                  <div className="flex-1 rtl:text-right">
                    <CardTitle className="text-sm font-medium">
                      {t("admin.dashboard.stats.totalRevenue")}
                    </CardTitle>
                  </div>
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="text-2xl font-bold currency-container">
                    {formatCurrencyForLocale(
                      dashboardStats.totalRevenues,
                      i18nInstance.language
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground rtl:text-right">
                    +15% {t("admin.dashboard.stats.fromLastMonth")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
                  <div className="flex-1 rtl:text-right">
                    <CardTitle className="text-sm font-medium">
                      {t("admin.dashboard.stats.registeredUsers")}
                    </CardTitle>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="text-2xl font-bold number-container">
                    {formatNumberForLocale(
                      dashboardStats.registeredUsers,
                      i18nInstance.language
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground rtl:text-right">
                    +5% {t("admin.dashboard.stats.fromLastMonth")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Statistics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rtl:space-x-reverse">
              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                    <DollarSign className="h-5 w-5" />
                    {t("admin.dashboard.stats.financialSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 rtl:text-right">
                  <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
                    <div className="text-center p-3 bg-green-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-green-600 currency-container">
                        {formatCurrencyForLocale(
                          dashboardStats.totalRevenues,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.totalRevenue")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-blue-600 currency-container">
                        {formatCurrencyForLocale(
                          dashboardStats.cutCommissions,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.commission")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-yellow-600 currency-container">
                        {formatCurrencyForLocale(
                          dashboardStats.pendingPayouts,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.pendingPayouts")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-purple-600 currency-container">
                        {formatCurrencyForLocale(
                          dashboardStats.cardSales,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.cardSales")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                    <Users className="h-5 w-5" />
                    {t("admin.dashboard.stats.userSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 rtl:text-right">
                  <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
                    <div className="text-center p-3 bg-blue-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-blue-600 number-container">
                        {formatNumberForLocale(
                          dashboardStats.totalVisitors,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.totalVisitors")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-green-600 number-container">
                        {formatNumberForLocale(
                          dashboardStats.activeUsers,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.activeUsers")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-orange-600 number-container">
                        {formatNumberForLocale(
                          dashboardStats.recurrentUsers,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.recurrentUsers")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg rtl:text-right">
                      <p className="text-xl font-bold text-red-600 number-container">
                        {formatNumberForLocale(
                          dashboardStats.inactiveUsers,
                          i18nInstance.language
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.dashboard.stats.inactiveUsers")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Management Tab */}
          <TabsContent value="events" className="space-y-6">
            <EventsManagement />
          </TabsContent>

          {/* Venues Management Tab */}
          <TabsContent value="venues" className="space-y-6">
            <VenueManagement />
          </TabsContent>

          {/* Tickets Management Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <TicketsManagement />
          </TabsContent>

          {/* NFC Card Management Tab */}
          <TabsContent value="nfc" className="space-y-6">
            <NFCCardManagement />
          </TabsContent>

          {/* Customer Management Tab */}
          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement />
          </TabsContent>

          {/* Admin User Management Tab */}
          <TabsContent value="admins" className="space-y-6">
            <AdminUserManagement />
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <SystemLogs />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Header with Export */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
                  {t("admin.dashboard.tabs.analytics")}
                </h2>
                <p className="text-muted-foreground rtl:text-right ltr:text-left">
                  {t("admin.dashboard.analytics.subtitle")}
                </p>
              </div>
              <div className="flex gap-2 rtl:flex-row-reverse">
                {/* Revenue Data Export */}
                <ExportDialog
                  data={chartData.revenueData}
                  columns={commonColumns.analyticsRevenue}
                  title={t("admin.dashboard.stats.revenueOverview")}
                  subtitle={t("admin.dashboard.analytics.subtitle")}
                  filename="revenue-analytics"
                  pdfOnly={true}
                >
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rtl:flex-row-reverse"
                  >
                    <TrendingUp className="h-4 w-4" />
                    {t("admin.dashboard.stats.revenueOverview")}
                  </Button>
                </ExportDialog>

                {/* User Growth Data Export */}
                <ExportDialog
                  data={chartData.userGrowthData}
                  columns={commonColumns.analyticsUserGrowth}
                  title={t("admin.dashboard.stats.userGrowth")}
                  subtitle={t("admin.dashboard.analytics.subtitle")}
                  filename="user-growth-analytics"
                  pdfOnly={true}
                >
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rtl:flex-row-reverse"
                  >
                    <Users className="h-4 w-4" />
                    {t("admin.dashboard.stats.userGrowth")}
                  </Button>
                </ExportDialog>

                {/* Card Status Data Export */}
                <ExportDialog
                  data={chartData.cardStatusData.map((item) => ({
                    ...item,
                    percentage: `${(
                      (item.value /
                        chartData.cardStatusData.reduce(
                          (sum, card) => sum + card.value,
                          0
                        )) *
                      100
                    ).toFixed(1)}%`,
                  }))}
                  columns={commonColumns.analyticsCardStatus}
                  title={t("admin.dashboard.stats.nfcCardStatus")}
                  subtitle={t("admin.dashboard.analytics.subtitle")}
                  filename="card-status-analytics"
                  pdfOnly={true}
                >
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rtl:flex-row-reverse"
                  >
                    <CreditCard className="h-4 w-4" />
                    {t("admin.dashboard.stats.nfcCardStatus")}
                  </Button>
                </ExportDialog>

                {/* Event Categories Data Export */}
                <ExportDialog
                  data={chartData.eventCategoryData.map((item) => ({
                    ...item,
                    percentage: `${(
                      (item.value /
                        chartData.eventCategoryData.reduce(
                          (sum, cat) => sum + cat.value,
                          0
                        )) *
                      100
                    ).toFixed(1)}%`,
                  }))}
                  columns={commonColumns.analyticsEventCategories}
                  title={t("admin.dashboard.stats.eventCategories")}
                  subtitle={t("admin.dashboard.analytics.subtitle")}
                  filename="event-categories-analytics"
                  pdfOnly={true}
                >
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rtl:flex-row-reverse"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {t("admin.dashboard.stats.eventCategories")}
                  </Button>
                </ExportDialog>

                {/* Combined Analytics Export */}
                <ExportDialog
                  data={[
                    // Revenue data
                    ...chartData.revenueData.map((item) => ({
                      ...item,
                      category: "Revenue Data",
                    })),
                    // User growth data
                    ...chartData.userGrowthData.map((item) => ({
                      ...item,
                      category: "User Growth Data",
                    })),
                    // Card status data
                    ...chartData.cardStatusData.map((item) => ({
                      ...item,
                      percentage: `${(
                        (item.value /
                          chartData.cardStatusData.reduce(
                            (sum, card) => sum + card.value,
                            0
                          )) *
                        100
                      ).toFixed(1)}%`,
                      category: "Card Status Data",
                    })),
                    // Event categories data
                    ...chartData.eventCategoryData.map((item) => ({
                      ...item,
                      percentage: `${(
                        (item.value /
                          chartData.eventCategoryData.reduce(
                            (sum, cat) => sum + cat.value,
                            0
                          )) *
                        100
                      ).toFixed(1)}%`,
                      category: "Event Categories Data",
                    })),
                  ]}
                  columns={[
                    { header: "Category", key: "category", width: 30 },
                    { header: "Name/Month", key: "name", width: 30 },
                    { header: "Value", key: "value", width: 25 },
                    {
                      header: "Revenue",
                      key: "revenue",
                      width: 25,
                      formatter: formatCurrency,
                    },
                    {
                      header: "Commission",
                      key: "commission",
                      width: 25,
                      formatter: formatCurrency,
                    },
                    { header: "Visitors", key: "visitors", width: 20 },
                    { header: "Registered", key: "registered", width: 20 },
                    { header: "Active", key: "active", width: 20 },
                    { header: "Percentage", key: "percentage", width: 20 },
                  ]}
                  title={t("admin.dashboard.tabs.analytics")}
                  subtitle={t("admin.dashboard.analytics.subtitle")}
                  filename="complete-analytics"
                >
                  <Button className="flex items-center gap-2 rtl:flex-row-reverse">
                    <Download className="h-4 w-4" />
                    {t("admin.export.title")}
                  </Button>
                </ExportDialog>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rtl:space-x-reverse">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                    <TrendingUp className="h-5 w-5" />
                    {t("admin.dashboard.stats.revenueOverview")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: any) => [
                            formatCurrencyForLocale(
                              value,
                              i18nInstance.language
                            ),
                            "",
                          ]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name={t("admin.dashboard.stats.labels.revenue")}
                        />
                        <Area
                          type="monotone"
                          dataKey="commission"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name={t("admin.dashboard.stats.labels.commission")}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                    <Users className="h-5 w-5" />
                    {t("admin.dashboard.stats.userGrowth")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: any) => [
                            formatNumberForLocale(value, i18nInstance.language),
                            "",
                          ]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="visitors"
                          stroke="#8884d8"
                          name={t("admin.dashboard.stats.labels.visitors")}
                        />
                        <Line
                          type="monotone"
                          dataKey="registered"
                          stroke="#82ca9d"
                          name={t("admin.dashboard.stats.labels.registered")}
                        />
                        <Line
                          type="monotone"
                          dataKey="active"
                          stroke="#ffc658"
                          name={t("admin.dashboard.stats.labels.active")}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NFC Cards and Event Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rtl:space-x-reverse">
              {/* NFC Card Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                    <CreditCard className="h-5 w-5" />
                    {t("admin.dashboard.stats.nfcCardStatus")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={chartData.cardStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.cardStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [
                            formatNumberForLocale(value, i18nInstance.language),
                            "",
                          ]}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    {/* Custom Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4 rtl:flex-row-reverse">
                      {chartData.cardStatusData.map((entry, index) => (
                        <div
                          key={`legend-${index}`}
                          className="flex items-center gap-2 rtl:flex-row-reverse"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {entry.name} (
                            {formatNumberForLocale(
                              entry.value,
                              i18nInstance.language
                            )}
                            )
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                    <BarChart3 className="h-5 w-5" />
                    {t("admin.dashboard.stats.eventCategories")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="rtl:text-right">
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.eventCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: any) => [
                            formatNumberForLocale(value, i18nInstance.language),
                            "",
                          ]}
                        />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
