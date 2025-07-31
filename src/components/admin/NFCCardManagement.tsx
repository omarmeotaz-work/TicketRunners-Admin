import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CreditCard,
  MoreHorizontal,
  Key,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  CalendarX,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO, isAfter } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { formatCurrencyForLocale } from "@/lib/utils";
import { ExportDialog } from "@/components/ui/export-dialog";
import { commonColumns } from "@/lib/exportUtils";

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
  cardType: "standard" | "premium" | "vip";
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  hasCard: boolean;
};

const NFCCardManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isGenerateKeyDialogOpen, setIsGenerateKeyDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(10);

  // Get date locale based on current language
  const getDateLocale = () => {
    return i18n.language === "ar" ? ar : enUS;
  };

  // Mock NFC cards data
  const nfcCards = useMemo(
    (): NFCCard[] => [
      {
        id: "1",
        serialNumber: "NFC-001-2025",
        customerId: "C001",
        customerName: t("admin.tickets.nfc.mock.customer.ahmedHassan"),
        status: "active",
        issueDate: "2025-01-15",
        expiryDate: "2026-01-15",
        balance: 500,
        lastUsed: "2025-08-15T10:30:00",
        usageCount: 25,
        cardType: "premium",
      },
      {
        id: "2",
        serialNumber: "NFC-002-2025",
        customerId: "C002",
        customerName: t("admin.tickets.nfc.mock.customer.sarahMohamed"),
        status: "active",
        issueDate: "2025-02-20",
        expiryDate: "2026-02-20",
        balance: 300,
        lastUsed: "2025-08-14T15:45:00",
        usageCount: 18,
        cardType: "standard",
      },
      {
        id: "3",
        serialNumber: "NFC-003-2025",
        customerId: "C003",
        customerName: t("admin.tickets.nfc.mock.customer.omarAli"),
        status: "inactive",
        issueDate: "2025-03-10",
        expiryDate: "2026-03-10",
        balance: 0,
        lastUsed: "2025-07-20T09:15:00",
        usageCount: 5,
        cardType: "standard",
      },
      {
        id: "4",
        serialNumber: "NFC-004-2025",
        customerId: "C004",
        customerName: t("admin.tickets.nfc.mock.customer.fatimaAhmed"),
        status: "expired",
        issueDate: "2024-06-15",
        expiryDate: "2025-06-15",
        balance: 0,
        lastUsed: "2025-05-30T14:20:00",
        usageCount: 12,
        cardType: "vip",
      },
      {
        id: "5",
        serialNumber: "NFC-005-2025",
        customerId: "C005",
        customerName: t("admin.tickets.nfc.mock.customer.youssefIbrahim"),
        status: "active",
        issueDate: "2025-04-05",
        expiryDate: "2026-04-05",
        balance: 750,
        lastUsed: "2025-08-16T11:00:00",
        usageCount: 32,
        cardType: "vip",
      },
      {
        id: "6",
        serialNumber: "NFC-006-2025",
        customerId: "C006",
        customerName: t("admin.tickets.nfc.mock.customer.nourHassan"),
        status: "active",
        issueDate: "2025-05-10",
        expiryDate: "2026-05-10",
        balance: 200,
        lastUsed: "2025-08-17T14:30:00",
        usageCount: 8,
        cardType: "standard",
      },
      {
        id: "7",
        serialNumber: "NFC-007-2025",
        customerId: "C007",
        customerName: t("admin.tickets.nfc.mock.customer.mariamAli"),
        status: "inactive",
        issueDate: "2025-06-15",
        expiryDate: "2026-06-15",
        balance: 0,
        lastUsed: "2025-07-25T16:45:00",
        usageCount: 15,
        cardType: "premium",
      },
      {
        id: "8",
        serialNumber: "NFC-008-2025",
        customerId: "C008",
        customerName: "Karim Hassan",
        status: "active",
        issueDate: "2025-07-01",
        expiryDate: "2026-07-01",
        balance: 400,
        lastUsed: "2025-08-18T09:15:00",
        usageCount: 22,
        cardType: "vip",
      },
      {
        id: "9",
        serialNumber: "NFC-009-2025",
        customerId: "C009",
        customerName: "Layla Ahmed",
        status: "expired",
        issueDate: "2024-08-20",
        expiryDate: "2025-08-20",
        balance: 0,
        lastUsed: "2025-07-10T12:20:00",
        usageCount: 6,
        cardType: "standard",
      },
      {
        id: "10",
        serialNumber: "NFC-010-2025",
        customerId: "C010",
        customerName: "Hassan Ali",
        status: "active",
        issueDate: "2025-08-05",
        expiryDate: "2026-08-05",
        balance: 300,
        lastUsed: "2025-08-19T10:30:00",
        usageCount: 18,
        cardType: "premium",
      },
      {
        id: "11",
        serialNumber: "NFC-011-2025",
        customerId: "C011",
        customerName: "Nour Ibrahim",
        status: "active",
        issueDate: "2025-08-12",
        expiryDate: "2026-08-12",
        balance: 150,
        lastUsed: "2025-08-20T15:45:00",
        usageCount: 12,
        cardType: "standard",
      },
      {
        id: "12",
        serialNumber: "NFC-012-2025",
        customerId: "C012",
        customerName: "Amira Mohamed",
        status: "inactive",
        issueDate: "2025-08-18",
        expiryDate: "2026-08-18",
        balance: 0,
        lastUsed: "2025-08-15T11:00:00",
        usageCount: 4,
        cardType: "vip",
      },
      {
        id: "13",
        serialNumber: "NFC-013-2025",
        customerId: "C013",
        customerName: "Omar Khalil",
        status: "active",
        issueDate: "2025-08-25",
        expiryDate: "2026-08-25",
        balance: 600,
        lastUsed: "2025-08-21T13:20:00",
        usageCount: 28,
        cardType: "premium",
      },
      {
        id: "14",
        serialNumber: "NFC-014-2025",
        customerId: "C014",
        customerName: "Fatima Hassan",
        status: "active",
        issueDate: "2025-09-01",
        expiryDate: "2026-09-01",
        balance: 250,
        lastUsed: "2025-08-22T16:10:00",
        usageCount: 14,
        cardType: "standard",
      },
      {
        id: "15",
        serialNumber: "NFC-015-2025",
        customerId: "C015",
        customerName: "Youssef Ali",
        status: "expired",
        issueDate: "2024-09-10",
        expiryDate: "2025-09-10",
        balance: 0,
        lastUsed: "2025-08-05T09:30:00",
        usageCount: 9,
        cardType: "vip",
      },
    ],
    [t]
  );

  // Mock customers data
  const customers = useMemo(
    (): Customer[] => [
      {
        id: "C001",
        name: t("admin.tickets.nfc.mock.customer.ahmedHassan"),
        email: "ahmed@example.com",
        phone: "+20 10 1234 5678",
        hasCard: true,
      },
      {
        id: "C002",
        name: t("admin.tickets.nfc.mock.customer.sarahMohamed"),
        email: "sarah@example.com",
        phone: "+20 10 2345 6789",
        hasCard: true,
      },
      {
        id: "C003",
        name: t("admin.tickets.nfc.mock.customer.omarAli"),
        email: "omar@example.com",
        phone: "+20 10 3456 7890",
        hasCard: true,
      },
      {
        id: "C004",
        name: t("admin.tickets.nfc.mock.customer.fatimaAhmed"),
        email: "fatima@example.com",
        phone: "+20 10 4567 8901",
        hasCard: true,
      },
      {
        id: "C005",
        name: t("admin.tickets.nfc.mock.customer.youssefIbrahim"),
        email: "youssef@example.com",
        phone: "+20 10 5678 9012",
        hasCard: true,
      },
      {
        id: "C006",
        name: t("admin.tickets.nfc.mock.customer.nourHassan"),
        email: "nour@example.com",
        phone: "+20 10 6789 0123",
        hasCard: false,
      },
      {
        id: "C007",
        name: t("admin.tickets.nfc.mock.customer.mariamAli"),
        email: "mariam@example.com",
        phone: "+20 10 7890 1234",
        hasCard: false,
      },
    ],
    [t]
  );

  // Filter cards based on search and filters
  const filteredCards = useMemo(() => {
    return nfcCards.filter((card) => {
      const matchesSearch =
        card.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || card.status === statusFilter;
      const matchesCustomer =
        customerFilter === "all" || card.customerId === customerFilter;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [nfcCards, searchTerm, statusFilter, customerFilter]);

  // Get unique customers for filter
  const uniqueCustomers = useMemo(() => {
    return customers.filter((customer) => customer.hasCard);
  }, [customers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const paginatedCards = filteredCards.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, customerFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("admin.tickets.nfc.status.active");
      case "inactive":
        return t("admin.tickets.nfc.status.inactive");
      case "expired":
        return t("admin.tickets.nfc.status.expired");
      default:
        return status;
    }
  };

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case "vip":
        return "bg-purple-100 text-purple-800";
      case "premium":
        return "bg-blue-100 text-blue-800";
      case "standard":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCardTypeText = (type: string) => {
    switch (type) {
      case "vip":
        return t("admin.tickets.nfc.cardTypes.vip");
      case "premium":
        return t("admin.tickets.nfc.cardTypes.premium");
      case "standard":
        return t("admin.tickets.nfc.cardTypes.standard");
      default:
        return type;
    }
  };

  const isExpired = (expiryDate: string) => {
    return isAfter(new Date(), parseISO(expiryDate));
  };

  const handleEditCard = (card: NFCCard) => {
    setSelectedCard(card);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    toast({
      title: t("admin.tickets.nfc.toast.cardDeleted"),
      description: t("admin.tickets.nfc.toast.cardDeletedDesc"),
    });
  };

  const handleExportCards = () => {
    toast({
      title: t("admin.tickets.nfc.toast.exportSuccess"),
      description: t("admin.tickets.nfc.toast.exportSuccessDesc"),
    });
  };

  const handleGenerateKey = (cardId: string) => {
    setIsGenerateKeyDialogOpen(true);
    toast({
      title: t("admin.tickets.nfc.toast.keyGenerated"),
      description: t("admin.tickets.nfc.toast.keyGeneratedDesc"),
    });
  };

  const handleDeactivateCard = (cardId: string) => {
    toast({
      title: t("admin.tickets.nfc.toast.cardDeactivated"),
      description: t("admin.tickets.nfc.toast.cardDeactivatedDesc"),
    });
  };

  const handleReactivateCard = (cardId: string) => {
    toast({
      title: t("admin.tickets.nfc.toast.cardReactivated"),
      description: t("admin.tickets.nfc.toast.cardReactivatedDesc"),
    });
  };

  const handleAssignCard = () => {
    toast({
      title: t("admin.tickets.nfc.toast.cardAssigned"),
      description: t("admin.tickets.nfc.toast.cardAssignedDesc"),
    });
    setIsAssignDialogOpen(false);
  };

  const handleCopyKey = () => {
    toast({
      title: t("admin.tickets.nfc.toast.keyCopied"),
      description: t("admin.tickets.nfc.toast.keyCopiedDesc"),
    });
    setIsGenerateKeyDialogOpen(false);
  };

  const handleSaveCardChanges = () => {
    toast({
      title: t("admin.tickets.nfc.toast.cardUpdated"),
      description: t("admin.tickets.nfc.toast.cardUpdatedDesc"),
    });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.tickets.nfc.title")}
          </h2>
          <p className="text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.tickets.nfc.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDialog
            data={filteredCards}
            columns={commonColumns.nfcCards}
            title={t("admin.tickets.nfc.title")}
            subtitle={t("admin.tickets.nfc.subtitle")}
            filename="nfc-cards"
            filters={{
              search: searchTerm,
              status: statusFilter,
              customer: customerFilter,
            }}
            onExport={(format) => {
              toast({
                title: t("admin.tickets.nfc.toast.exportSuccess"),
                description: t("admin.tickets.nfc.toast.exportSuccessDesc"),
              });
            }}
          >
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.tickets.nfc.actions.export")}
            </Button>
          </ExportDialog>
          <Button onClick={() => setIsAssignDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.tickets.nfc.actions.assignCard")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
            <Filter className="h-5 w-5" />
            {t("admin.tickets.nfc.filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
              <Input
                placeholder={t("admin.tickets.nfc.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.tickets.nfc.filters.status")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.tickets.nfc.filters.allStatus")}
                </SelectItem>
                <SelectItem value="active">
                  {t("admin.tickets.nfc.status.active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("admin.tickets.nfc.status.inactive")}
                </SelectItem>
                <SelectItem value="expired">
                  {t("admin.tickets.nfc.status.expired")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.tickets.nfc.filters.customer")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.tickets.nfc.filters.allCustomers")}
                </SelectItem>
                {uniqueCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* NFC Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle className="rtl:text-right ltr:text-left">
            {t("admin.tickets.nfc.table.cards")} ({filteredCards.length})
          </CardTitle>
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            <span className="text-sm text-muted-foreground">
              {t("admin.tickets.nfc.pagination.showing")} {startIndex + 1}-
              {Math.min(endIndex, filteredCards.length)}{" "}
              {t("admin.tickets.nfc.pagination.of")} {filteredCards.length}
            </span>
            <Select
              value={cardsPerPage.toString()}
              onValueChange={(value) => setCardsPerPage(parseInt(value))}
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
                    {t("admin.tickets.nfc.table.serialNumber")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.nfc.table.customer")}
                  </TableHead>

                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.nfc.table.status")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.nfc.table.issueDate")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.nfc.table.expiryDate")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.nfc.table.balance")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.nfc.table.usage")}
                  </TableHead>
                  <TableHead className="rtl:text-right">
                    {t("admin.tickets.nfc.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium">{card.serialNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.tickets.nfc.table.id")}: {card.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium">{card.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.tickets.nfc.table.id")}: {card.customerId}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(card.status)}>
                        {getStatusText(card.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right">
                        {format(parseISO(card.issueDate), "MMM dd, yyyy", {
                          locale: getDateLocale(),
                        })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="text-sm">
                          {format(parseISO(card.expiryDate), "MMM dd, yyyy", {
                            locale: getDateLocale(),
                          })}
                        </p>
                        {isExpired(card.expiryDate) && (
                          <p className="text-xs text-red-600">
                            {t("admin.tickets.nfc.table.expired")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium rtl:text-right">
                        {formatCurrencyForLocale(card.balance, i18n.language)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right">
                        <p className="font-medium">{card.usageCount}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.tickets.nfc.table.lastUsed")}:{" "}
                          {card.lastUsed
                            ? format(parseISO(card.lastUsed), "MMM dd", {
                                locale: getDateLocale(),
                              })
                            : t("admin.tickets.nfc.table.never")}
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t("admin.tickets.nfc.table.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditCard(card)}
                          >
                            <Edit className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.tickets.nfc.actions.editCard")}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleGenerateKey(card.id)}
                          >
                            <Key className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.tickets.nfc.actions.generateKey")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {card.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivateCard(card.id)}
                              className="text-yellow-600"
                            >
                              <UserX className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                              {t("admin.tickets.nfc.actions.deactivateCard")}
                            </DropdownMenuItem>
                          )}
                          {card.status === "inactive" && (
                            <DropdownMenuItem
                              onClick={() => handleReactivateCard(card.id)}
                              className="text-green-600"
                            >
                              <UserCheck className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                              {t("admin.tickets.nfc.actions.reactivateCard")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                            {t("admin.tickets.nfc.actions.deleteCard")}
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
                {t("admin.tickets.nfc.pagination.showing")} {startIndex + 1}-
                {Math.min(endIndex, filteredCards.length)}{" "}
                {t("admin.tickets.nfc.pagination.of")} {filteredCards.length}{" "}
                {t("admin.tickets.nfc.pagination.results")}
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
                      {t("admin.tickets.nfc.pagination.first")}
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
                      {t("admin.tickets.nfc.pagination.last")}
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.stats.totalCards")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold">{nfcCards.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.stats.activeCards")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold text-green-600">
              {nfcCards.filter((card) => card.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.stats.inactiveCards")}
            </CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold text-yellow-600">
              {nfcCards.filter((card) => card.status === "inactive").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.stats.expiredCards")}
            </CardTitle>
            <CalendarX className="h-4 w-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold text-red-600">
              {nfcCards.filter((card) => card.status === "expired").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Card Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.dialogs.editCard")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.dialogs.editCardSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.nfc.form.serialNumber")}
                  </label>
                  <Input defaultValue={selectedCard.serialNumber} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.nfc.form.customer")}
                  </label>
                  <Select defaultValue={selectedCard.customerId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.nfc.form.cardType")}
                  </label>
                  <Select defaultValue={selectedCard.cardType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        {t("admin.tickets.nfc.cardTypes.standard")}
                      </SelectItem>
                      <SelectItem value="premium">
                        {t("admin.tickets.nfc.cardTypes.premium")}
                      </SelectItem>
                      <SelectItem value="vip">
                        {t("admin.tickets.nfc.cardTypes.vip")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.nfc.form.status")}
                  </label>
                  <Select defaultValue={selectedCard.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("admin.tickets.nfc.status.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("admin.tickets.nfc.status.inactive")}
                      </SelectItem>
                      <SelectItem value="expired">
                        {t("admin.tickets.nfc.status.expired")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.nfc.form.issueDate")}
                  </label>
                  <Input type="date" defaultValue={selectedCard.issueDate} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.nfc.form.expiryDate")}
                  </label>
                  <Input type="date" defaultValue={selectedCard.expiryDate} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right">
                    {t("admin.tickets.nfc.form.balance")}
                  </label>
                  <Input type="number" defaultValue={selectedCard.balance} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("admin.tickets.nfc.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveCardChanges}>
              {t("admin.tickets.nfc.dialogs.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Card Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.dialogs.assignCard")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.dialogs.assignCardSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rtl:space-x-reverse">
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.nfc.form.customer")}
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.tickets.nfc.form.selectCustomer")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {customers
                      .filter((customer) => !customer.hasCard)
                      .map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.nfc.form.cardType")}
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.tickets.nfc.form.selectType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      {t("admin.tickets.nfc.cardTypes.standard")}
                    </SelectItem>
                    <SelectItem value="premium">
                      {t("admin.tickets.nfc.cardTypes.premium")}
                    </SelectItem>
                    <SelectItem value="vip">
                      {t("admin.tickets.nfc.cardTypes.vip")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.nfc.form.initialBalance")}
                </label>
                <Input
                  type="number"
                  placeholder={t("admin.tickets.nfc.form.zero")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right">
                  {t("admin.tickets.nfc.form.expiryPeriod")}
                </label>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      {t("admin.tickets.nfc.form.oneYear")}
                    </SelectItem>
                    <SelectItem value="2">
                      {t("admin.tickets.nfc.form.twoYears")}
                    </SelectItem>
                    <SelectItem value="3">
                      {t("admin.tickets.nfc.form.threeYears")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              {t("admin.tickets.nfc.dialogs.cancel")}
            </Button>
            <Button onClick={handleAssignCard}>
              {t("admin.tickets.nfc.dialogs.assignCardButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Key Dialog */}
      <Dialog
        open={isGenerateKeyDialogOpen}
        onOpenChange={setIsGenerateKeyDialogOpen}
      >
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.dialogs.generateKey")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.tickets.nfc.dialogs.generateKeySubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2 rtl:text-right">
                {t("admin.tickets.nfc.dialogs.generatedKey")}:
              </p>
              <p className="font-mono text-lg bg-white p-2 rounded border rtl:text-right">
                NFC-KEY-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-2 rtl:text-right">
                {t("admin.tickets.nfc.dialogs.keyNote")}
              </p>
            </div>
          </div>
          <DialogFooter className="rtl:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => setIsGenerateKeyDialogOpen(false)}
            >
              {t("admin.tickets.nfc.dialogs.close")}
            </Button>
            <Button onClick={handleCopyKey}>
              {t("admin.tickets.nfc.dialogs.copyKey")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFCCardManagement;
