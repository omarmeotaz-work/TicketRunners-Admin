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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { formatNumberForLocale, formatPhoneNumberForLocale } from "@/lib/utils";
import { ExportDialog } from "@/components/ui/export-dialog";
import { commonColumns } from "@/lib/exportUtils";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "usher" | "support";
  status: "active" | "inactive";
  lastLogin: string;
  permissions: string[];
  createdAt: string;
  profileImage?: string;
  fullName: string;
  phone?: string;
};

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
};

type UserActivity = {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "warning";
};

const AdminUserManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingRolePermissions, setEditingRolePermissions] = useState<
    string[]
  >([]);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [editingRoleDescription, setEditingRoleDescription] = useState("");

  // Mock user activity data
  const userActivities: UserActivity[] = [
    {
      id: "1",
      action: "Login",
      description: "User logged in successfully",
      timestamp: "2025-08-16T14:30:00",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
    },
    {
      id: "2",
      action: "View Event",
      description: "Viewed event details for 'Summer Concert 2025'",
      timestamp: "2025-08-16T14:25:00",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
    },
    {
      id: "3",
      action: "Edit Ticket",
      description: "Modified ticket #TKT-2025-001",
      timestamp: "2025-08-16T14:20:00",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
    },
    {
      id: "4",
      action: "Failed Login",
      description: "Incorrect password attempt",
      timestamp: "2025-08-16T14:15:00",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "failed",
    },
    {
      id: "5",
      action: "Export Report",
      description: "Exported user activity report",
      timestamp: "2025-08-16T14:10:00",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
    },
    {
      id: "6",
      action: "Permission Change",
      description: "Updated user permissions",
      timestamp: "2025-08-16T14:05:00",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "warning",
    },
  ];

  // Mock admin users data
  const adminUsers: AdminUser[] = [
    {
      id: "A001",
      username: "admin",
      email: "admin@ticketrunners.com",
      fullName: "System Administrator",
      role: "super_admin",
      status: "active",
      lastLogin: "2025-08-16T10:30:00",
      permissions: ["all"],
      createdAt: "2024-01-01",
      profileImage: "/public/Portrait_Placeholder.png",
    },
    {
      id: "A002",
      username: "manager",
      email: "manager@ticketrunners.com",
      fullName: "Event Manager",
      role: "admin",
      status: "active",
      lastLogin: "2025-08-15T15:45:00",
      permissions: [
        "events_manage",
        "tickets_manage",
        "customers_view",
        "reports_view",
      ],
      createdAt: "2024-02-15",
      profileImage: "/public/Portrait_Placeholder.png",
    },
    {
      id: "A003",
      username: "usher1",
      email: "usher1@ticketrunners.com",
      fullName: "Ahmed Usher",
      role: "usher",
      status: "active",
      lastLogin: "2025-08-16T09:15:00",
      permissions: ["checkin_manage", "tickets_view"],
      createdAt: "2024-03-10",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 1234 5678",
    },
    {
      id: "A004",
      username: "support1",
      email: "support1@ticketrunners.com",
      fullName: "Sarah Support",
      role: "support",
      status: "inactive",
      lastLogin: "2025-07-20T14:20:00",
      permissions: ["customers_manage", "tickets_view", "reports_view"],
      createdAt: "2024-04-05",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 2345 6789",
    },
    {
      id: "A005",
      username: "usher2",
      email: "usher2@ticketrunners.com",
      fullName: "Omar Usher",
      role: "usher",
      status: "active",
      lastLogin: "2025-08-16T11:00:00",
      permissions: ["checkin_manage", "tickets_view"],
      createdAt: "2024-05-12",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 3456 7890",
    },
    {
      id: "A006",
      username: "admin2",
      email: "admin2@ticketrunners.com",
      fullName: "Fatima Admin",
      role: "admin",
      status: "active",
      lastLogin: "2025-08-16T08:30:00",
      permissions: [
        "events_manage",
        "tickets_manage",
        "customers_view",
        "reports_view",
      ],
      createdAt: "2024-06-01",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 4567 8901",
    },
    {
      id: "A007",
      username: "usher3",
      email: "usher3@ticketrunners.com",
      fullName: "Hassan Usher",
      role: "usher",
      status: "active",
      lastLogin: "2025-08-16T12:15:00",
      permissions: ["checkin_manage", "tickets_view"],
      createdAt: "2024-06-15",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 5678 9012",
    },
    {
      id: "A008",
      username: "support2",
      email: "support2@ticketrunners.com",
      fullName: "Layla Support",
      role: "support",
      status: "active",
      lastLogin: "2025-08-16T07:45:00",
      permissions: ["customers_manage", "tickets_view", "reports_view"],
      createdAt: "2024-07-01",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 6789 0123",
    },
    {
      id: "A009",
      username: "usher4",
      email: "usher4@ticketrunners.com",
      fullName: "Youssef Usher",
      role: "usher",
      status: "inactive",
      lastLogin: "2025-07-25T16:20:00",
      permissions: ["checkin_manage", "tickets_view"],
      createdAt: "2024-07-20",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 7890 1234",
    },
    {
      id: "A010",
      username: "admin3",
      email: "admin3@ticketrunners.com",
      fullName: "Nour Admin",
      role: "admin",
      status: "active",
      lastLogin: "2025-08-16T09:00:00",
      permissions: [
        "events_manage",
        "tickets_manage",
        "customers_view",
        "reports_view",
      ],
      createdAt: "2024-08-01",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 8901 2345",
    },
    {
      id: "A011",
      username: "usher5",
      email: "usher5@ticketrunners.com",
      fullName: "Mariam Usher",
      role: "usher",
      status: "active",
      lastLogin: "2025-08-16T13:30:00",
      permissions: ["checkin_manage", "tickets_view"],
      createdAt: "2024-08-15",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 9012 3456",
    },
    {
      id: "A012",
      username: "support3",
      email: "support3@ticketrunners.com",
      fullName: "Karim Support",
      role: "support",
      status: "active",
      lastLogin: "2025-08-16T10:15:00",
      permissions: ["customers_manage", "tickets_view", "reports_view"],
      createdAt: "2024-09-01",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 0123 4567",
    },
    {
      id: "A013",
      username: "usher6",
      email: "usher6@ticketrunners.com",
      fullName: "Aisha Usher",
      role: "usher",
      status: "active",
      lastLogin: "2025-08-16T11:45:00",
      permissions: ["checkin_manage", "tickets_view"],
      createdAt: "2024-09-15",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 1234 5678",
    },
    {
      id: "A014",
      username: "admin4",
      email: "admin4@ticketrunners.com",
      fullName: "Ziad Admin",
      role: "admin",
      status: "inactive",
      lastLogin: "2025-07-30T14:10:00",
      permissions: [
        "events_manage",
        "tickets_manage",
        "customers_view",
        "reports_view",
      ],
      createdAt: "2024-10-01",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 2345 6789",
    },
    {
      id: "A015",
      username: "usher7",
      email: "usher7@ticketrunners.com",
      fullName: "Dalia Usher",
      role: "usher",
      status: "active",
      lastLogin: "2025-08-16T08:45:00",
      permissions: ["checkin_manage", "tickets_view"],
      createdAt: "2024-10-15",
      profileImage: "/public/Portrait_Placeholder.png",
      phone: "+20 10 3456 7890",
    },
  ];

  // Mock roles data
  const roles: Role[] = [
    {
      id: "super_admin",
      name: "Super Admin",
      description: "Full system access with all permissions",
      permissions: ["all"],
      userCount: 1,
    },
    {
      id: "admin",
      name: "Administrator",
      description: "Manage events, tickets, and view reports",
      permissions: [
        "events_manage",
        "tickets_manage",
        "customers_view",
        "reports_view",
      ],
      userCount: 1,
    },
    {
      id: "usher",
      name: "Usher",
      description: "Check-in tickets and view ticket information",
      permissions: ["checkin_manage", "tickets_view"],
      userCount: 2,
    },
    {
      id: "support",
      name: "Support",
      description: "Manage customers and view reports",
      permissions: ["customers_manage", "tickets_view", "reports_view"],
      userCount: 1,
    },
  ];

  // Mock permissions data
  const permissions: Permission[] = [
    {
      id: "all",
      name: "All Permissions",
      description: "Full system access",
      category: "System",
    },
    {
      id: "events_manage",
      name: "Manage Events",
      description: "Create, edit, and delete events",
      category: "Events",
    },
    {
      id: "tickets_manage",
      name: "Manage Tickets",
      description: "Create, edit, and manage tickets",
      category: "Tickets",
    },
    {
      id: "customers_manage",
      name: "Manage Customers",
      description: "View and manage customer accounts",
      category: "Customers",
    },
    {
      id: "checkin_manage",
      name: "Manage Check-ins",
      description: "Check-in tickets and view check-in logs",
      category: "Check-ins",
    },
    {
      id: "reports_view",
      name: "View Reports",
      description: "Access to analytics and reports",
      category: "Reports",
    },
    {
      id: "tickets_view",
      name: "View Tickets",
      description: "View ticket information",
      category: "Tickets",
    },
  ];

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return adminUsers.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [adminUsers, searchTerm, roleFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "usher":
        return "bg-green-100 text-green-800";
      case "support":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "super_admin":
        return t("admin.users.roles.superAdmin");
      case "admin":
        return t("admin.users.roles.administrator");
      case "usher":
        return t("admin.users.roles.usher");
      case "support":
        return t("admin.users.roles.support");
      default:
        return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("admin.users.status.active");
      case "inactive":
        return t("admin.users.status.inactive");
      default:
        return status;
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleDeleteUser = (userId: string) => {
    toast({
      title: t("admin.users.toast.userDeleted"),
      description: t("admin.users.toast.userDeletedDesc"),
    });
  };

  const handleExportUsers = () => {
    toast({
      title: t("admin.users.toast.exportSuccess"),
      description: t("admin.users.toast.exportSuccessDesc"),
    });
  };

  const handleDeactivateUser = (userId: string) => {
    toast({
      title: t("admin.users.toast.userDeactivated"),
      description: t("admin.users.toast.userDeactivatedDesc"),
    });
  };

  const handleReactivateUser = (userId: string) => {
    toast({
      title: t("admin.users.toast.userReactivated"),
      description: t("admin.users.toast.userReactivatedDesc"),
    });
  };

  const handleForcePasswordReset = (userId: string) => {
    toast({
      title: t("admin.users.toast.passwordReset"),
      description: t("admin.users.toast.passwordResetDesc"),
    });
  };

  const handleViewActivity = (userId: string) => {
    const user = adminUsers.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsActivityDialogOpen(true);
    }
  };

  const handleManagePermissions = (userId: string) => {
    const user = adminUsers.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setSelectedPermissions([...user.permissions]);
      setIsPermissionsDialogOpen(true);
    }
  };

  const handleAddUser = () => {
    toast({
      title: t("admin.users.toast.userAdded"),
      description: t("admin.users.toast.userAddedDesc"),
    });
    setIsAddDialogOpen(false);
  };

  const handleEditRoles = () => {
    // This will now open the role editing interface
    setIsRoleDialogOpen(false);
    // For now, we'll edit the first role as an example
    const firstRole = roles[0];
    setEditingRole(firstRole);
    setEditingRoleName(firstRole.name);
    setEditingRoleDescription(firstRole.description);
    setEditingRolePermissions([...firstRole.permissions]);
    setIsEditRoleDialogOpen(true);
  };

  const handleEditSpecificRole = (role: Role) => {
    setEditingRole(role);
    setEditingRoleName(role.name);
    setEditingRoleDescription(role.description);
    setEditingRolePermissions([...role.permissions]);
    setIsEditRoleDialogOpen(true);
  };

  const handleSaveRoleChanges = () => {
    if (editingRole) {
      // In a real app, this would update the role in the database
      // For now, we'll update our local roles array
      const updatedRoles = roles.map((role) =>
        role.id === editingRole.id
          ? {
              ...role,
              name: editingRoleName,
              description: editingRoleDescription,
              permissions: editingRolePermissions,
            }
          : role
      );

      // Update the roles array (in a real app, this would be done through state management)
      console.log("Updated roles:", updatedRoles);

      toast({
        title: t("admin.users.toast.roleUpdated"),
        description: t("admin.users.toast.roleUpdatedDesc"),
      });

      setIsEditRoleDialogOpen(false);
      setEditingRole(null);
      setEditingRoleName("");
      setEditingRoleDescription("");
      setEditingRolePermissions([]);
    }
  };

  const handleRolePermissionToggle = (permissionId: string) => {
    setEditingRolePermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSaveUserChanges = () => {
    toast({
      title: t("admin.users.toast.userUpdated"),
      description: t("admin.users.toast.userUpdatedDesc"),
    });
    setIsEditDialogOpen(false);
  };

  const getPermissionsForRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.permissions : [];
  };

  const getPermissionName = (permissionId: string) => {
    const permission = permissions.find((p) => p.id === permissionId);
    return permission ? permission.name : permissionId;
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

  // Format phone number for current locale
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

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSavePermissions = () => {
    if (selectedUser) {
      // In a real app, this would update the user's permissions in the database
      toast({
        title: t("admin.users.toast.permissionsUpdated"),
        description: t("admin.users.toast.permissionsUpdatedDesc"),
      });
      setIsPermissionsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.users.title")}
          </h2>
          <p className="text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.users.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsRoleDialogOpen(true)}>
            <Shield className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.users.actions.manageRoles")}
          </Button>
          <ExportDialog
            data={filteredUsers}
            columns={commonColumns.users}
            title={t("admin.users.title")}
            subtitle={t("admin.users.subtitle")}
            filename="admin-users"
            filters={{
              search: searchTerm,
              role: roleFilter,
              status: statusFilter,
            }}
            onExport={(format) => {
              toast({
                title: t("admin.users.toast.exportSuccess"),
                description: t("admin.users.toast.exportSuccessDesc"),
              });
            }}
          >
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.users.actions.export")}
            </Button>
          </ExportDialog>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("admin.users.actions.addUser")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:text-right ltr:text-left">
            <Filter className="h-5 w-5" />
            {t("admin.users.filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
              <Input
                placeholder={t("admin.users.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.users.filters.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.users.filters.allRoles")}
                </SelectItem>
                <SelectItem value="super_admin">
                  {t("admin.users.filters.superAdmin")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("admin.users.filters.administrator")}
                </SelectItem>
                <SelectItem value="usher">
                  {t("admin.users.filters.usher")}
                </SelectItem>
                <SelectItem value="support">
                  {t("admin.users.filters.support")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.users.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.users.filters.allStatus")}
                </SelectItem>
                <SelectItem value="active">
                  {t("admin.users.filters.active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("admin.users.filters.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="rtl:text-right ltr:text-left">
            {t("admin.users.table.user")} (
            {formatNumberForLocale(filteredUsers.length, i18n.language)})
          </CardTitle>
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            <span className="text-sm text-muted-foreground">
              {t("admin.users.pagination.showing")} {startIndex + 1}-
              {Math.min(endIndex, filteredUsers.length)}{" "}
              {t("admin.users.pagination.of")} {filteredUsers.length}{" "}
              {t("admin.users.pagination.results")}
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
                    {t("admin.users.table.user")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.users.table.contact")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.users.table.role")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.users.table.status")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.users.table.created")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.users.table.lastLogin")}
                  </TableHead>
                  <TableHead className="rtl:text-right ltr:text-left">
                    {t("admin.users.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img
                          src={
                            user.profileImage ||
                            "/public/Portrait_Placeholder.png"
                          }
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="rtl:text-right ltr:text-left">
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="rtl:text-right ltr:text-left">
                        <p className="text-sm">{user.email}</p>
                        {user.phone && (
                          <p
                            className="text-sm text-muted-foreground"
                            dir="ltr"
                          >
                            {formatPhone(user.phone)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusText(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right ltr:text-left">
                        {formatDateForLocale(user.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm rtl:text-right ltr:text-left">
                        {user.lastLogin
                          ? formatDateTimeForLocale(user.lastLogin)
                          : t("admin.users.details.never")}
                      </p>
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
                            {t("admin.users.table.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.users.actions.viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.users.actions.editUser")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewActivity(user.id)}
                          >
                            <Activity className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.users.actions.viewActivity")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManagePermissions(user.id)}
                          >
                            <Shield className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.users.actions.managePermissions")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivateUser(user.id)}
                              className="text-yellow-600"
                            >
                              <UserX className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                              {t("admin.users.actions.deactivate")}
                            </DropdownMenuItem>
                          )}
                          {user.status === "inactive" && (
                            <DropdownMenuItem
                              onClick={() => handleReactivateUser(user.id)}
                              className="text-green-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                              {t("admin.users.actions.reactivate")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleForcePasswordReset(user.id)}
                            className="text-blue-600"
                          >
                            <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.users.actions.forcePasswordReset")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {t("admin.users.actions.deleteUser")}
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
                {t("admin.users.pagination.showing")} {startIndex + 1}-
                {Math.min(endIndex, filteredUsers.length)}{" "}
                {t("admin.users.pagination.of")} {filteredUsers.length}{" "}
                {t("admin.users.pagination.results")}
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
                      {t("admin.users.pagination.first")}
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
                      {t("admin.users.pagination.last")}
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.userDetails")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.userDetailsSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="text-center">
                    <img
                      src={
                        selectedUser.profileImage ||
                        "/public/Portrait_Placeholder.png"
                      }
                      alt={selectedUser.fullName}
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold rtl:text-right ltr:text-left">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-muted-foreground rtl:text-right ltr:text-left">
                      @{selectedUser.username}
                    </p>
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {getRoleText(selectedUser.role)}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.status)}>
                      {getStatusText(selectedUser.status)}
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.users.form.email")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                    {selectedUser.phone && (
                      <div className="rtl:text-right ltr:text-left">
                        <p className="text-sm font-medium">
                          {t("admin.users.form.phone")}
                        </p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {formatPhone(selectedUser.phone)}
                        </p>
                      </div>
                    )}
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.users.details.createdDate")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateForLocale(selectedUser.createdAt)}
                      </p>
                    </div>
                    <div className="rtl:text-right ltr:text-left">
                      <p className="text-sm font-medium">
                        {t("admin.users.details.lastLogin")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.lastLogin
                          ? formatDateTimeForLocale(selectedUser.lastLogin)
                          : t("admin.users.details.never")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-lg font-semibold mb-4 rtl:text-right ltr:text-left">
                  {t("admin.users.details.permissions")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedUser.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded rtl:space-x-reverse"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm rtl:text-right ltr:text-left">
                        {getPermissionName(permission)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetails(false)}>
              {t("admin.users.dialogs.close")}
            </Button>
            <Button onClick={() => handleEditUser(selectedUser!)}>
              {t("admin.users.actions.editUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.editUser")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.editUserSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.fullName")}
                  </label>
                  <Input defaultValue={selectedUser.fullName} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.username")}
                  </label>
                  <Input defaultValue={selectedUser.username} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.email")}
                  </label>
                  <Input type="email" defaultValue={selectedUser.email} />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.phone")}
                  </label>
                  <Input defaultValue={selectedUser.phone || ""} dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.role")}
                  </label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        {t("admin.users.roles.superAdmin")}
                      </SelectItem>
                      <SelectItem value="admin">
                        {t("admin.users.roles.administrator")}
                      </SelectItem>
                      <SelectItem value="usher">
                        {t("admin.users.roles.usher")}
                      </SelectItem>
                      <SelectItem value="support">
                        {t("admin.users.roles.support")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.status")}
                  </label>
                  <Select defaultValue={selectedUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("admin.users.status.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("admin.users.status.inactive")}
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
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("admin.users.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveUserChanges}>
              {t("admin.users.dialogs.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.addUser")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.addUserSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.users.form.fullName")}
                </label>
                <Input
                  placeholder={t("admin.users.form.fullNamePlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.users.form.username")}
                </label>
                <Input
                  placeholder={t("admin.users.form.usernamePlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.users.form.email")}
                </label>
                <Input
                  type="email"
                  placeholder={t("admin.users.form.emailPlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.users.form.phone")}
                </label>
                <Input
                  placeholder={t("admin.users.form.phonePlaceholder")}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.users.form.role")}
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.users.form.selectRole")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">
                      {t("admin.users.roles.superAdmin")}
                    </SelectItem>
                    <SelectItem value="admin">
                      {t("admin.users.roles.administrator")}
                    </SelectItem>
                    <SelectItem value="usher">
                      {t("admin.users.roles.usher")}
                    </SelectItem>
                    <SelectItem value="support">
                      {t("admin.users.roles.support")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium rtl:text-right ltr:text-left">
                  {t("admin.users.form.password")}
                </label>
                <Input
                  type="password"
                  placeholder={t("admin.users.form.passwordPlaceholder")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("admin.users.dialogs.cancel")}
            </Button>
            <Button onClick={handleAddUser}>
              {t("admin.users.dialogs.addUserButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-4xl rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.manageRoles")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.manageRolesSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="rtl:text-right ltr:text-left">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <CardDescription className="rtl:text-right ltr:text-left">
                          {role.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge className={getRoleColor(role.id)}>
                          {formatNumberForLocale(role.userCount, i18n.language)}{" "}
                          {t("admin.users.table.user")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSpecificRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium rtl:text-right ltr:text-left">
                        {t("admin.users.details.permissions")}:
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {role.permissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center space-x-2 rtl:space-x-reverse"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs rtl:text-right ltr:text-left">
                              {getPermissionName(permission)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              {t("admin.users.dialogs.close")}
            </Button>
            <Button onClick={handleEditRoles}>
              {t("admin.users.dialogs.editRoles")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.editRole")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {editingRole &&
                `${t("admin.users.dialogs.editRoleSubtitle")} ${
                  editingRole.name
                }`}
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Role Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.roleName")}
                  </label>
                  <Input
                    value={editingRoleName}
                    onChange={(e) => setEditingRoleName(e.target.value)}
                    placeholder={t("admin.users.form.roleNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium rtl:text-right ltr:text-left">
                    {t("admin.users.form.roleDescription")}
                  </label>
                  <Input
                    value={editingRoleDescription}
                    onChange={(e) => setEditingRoleDescription(e.target.value)}
                    placeholder={t(
                      "admin.users.form.roleDescriptionPlaceholder"
                    )}
                  />
                </div>
              </div>

              {/* Role Permissions */}
              <div>
                <h4 className="text-lg font-semibold mb-4 rtl:text-right ltr:text-left">
                  {t("admin.users.permissions.rolePermissions")}
                </h4>
                <p className="text-sm text-muted-foreground mb-4 rtl:text-right ltr:text-left">
                  {t("admin.users.permissions.rolePermissionsDesc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg rtl:space-x-reverse"
                    >
                      <button
                        onClick={() =>
                          handleRolePermissionToggle(permission.id)
                        }
                        className="flex items-center space-x-3 flex-1 rtl:space-x-reverse"
                      >
                        {editingRolePermissions.includes(permission.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="rtl:text-right ltr:text-left">
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {permission.category}
                          </Badge>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permission Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2 rtl:text-right ltr:text-left">
                  {t("admin.users.permissions.roleSummary")}
                </h5>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <span className="text-sm text-muted-foreground">
                    {t("admin.users.permissions.selected")}:{" "}
                    {editingRolePermissions.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("admin.users.permissions.total")}: {permissions.length}
                  </span>
                </div>
                {editingRolePermissions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium rtl:text-right ltr:text-left">
                      {t("admin.users.permissions.selectedPermissions")}:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editingRolePermissions.map((permissionId) => (
                        <Badge
                          key={permissionId}
                          variant="secondary"
                          className="text-xs"
                        >
                          {getPermissionName(permissionId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditRoleDialogOpen(false);
                setEditingRole(null);
                setEditingRoleName("");
                setEditingRoleDescription("");
                setEditingRolePermissions([]);
              }}
            >
              {t("admin.users.dialogs.cancel")}
            </Button>
            <Button onClick={handleSaveRoleChanges}>
              {t("admin.users.dialogs.saveRoleChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Activity Dialog */}
      <Dialog
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.userActivity")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {selectedUser &&
                `${t("admin.users.dialogs.userActivitySubtitle")} ${
                  selectedUser.fullName
                }`}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* User Info Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg rtl:space-x-reverse">
                <img
                  src={
                    selectedUser.profileImage ||
                    "/public/Portrait_Placeholder.png"
                  }
                  alt={selectedUser.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="rtl:text-right ltr:text-left">
                  <h3 className="font-semibold">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    @{selectedUser.username}
                  </p>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {getRoleText(selectedUser.role)}
                  </Badge>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold rtl:text-right ltr:text-left">
                  {t("admin.users.activity.recentActivity")}
                </h4>
                <div className="space-y-3">
                  {userActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg rtl:space-x-reverse"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActivityStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 rtl:text-right ltr:text-left">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{activity.action}</h5>
                          <Badge
                            className={getActivityStatusColor(activity.status)}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground rtl:space-x-reverse">
                          <span className="flex items-center space-x-1 rtl:space-x-reverse">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDateTimeForLocale(activity.timestamp)}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1 rtl:space-x-reverse">
                            <User className="h-3 w-3" />
                            <span>{activity.ipAddress}</span>
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {activity.userAgent}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">4</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.users.activity.successful")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold">1</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.users.activity.failed")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold">1</p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.users.activity.warnings")}
                        </p>
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
              onClick={() => setIsActivityDialogOpen(false)}
            >
              {t("admin.users.dialogs.close")}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("admin.users.activity.exportActivity")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rtl:text-right ltr:text-left">
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left">
              {t("admin.users.dialogs.managePermissions")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left">
              {selectedUser &&
                `${t("admin.users.dialogs.managePermissionsSubtitle")} ${
                  selectedUser.fullName
                }`}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* User Info Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg rtl:space-x-reverse">
                <img
                  src={
                    selectedUser.profileImage ||
                    "/public/Portrait_Placeholder.png"
                  }
                  alt={selectedUser.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="rtl:text-right ltr:text-left">
                  <h3 className="font-semibold">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    @{selectedUser.username}
                  </p>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {getRoleText(selectedUser.role)}
                  </Badge>
                </div>
              </div>

              {/* Current Role Permissions */}
              <div>
                <h4 className="text-lg font-semibold mb-4 rtl:text-right ltr:text-left">
                  {t("admin.users.permissions.currentRole")}:{" "}
                  {getRoleText(selectedUser.role)}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                  {getPermissionsForRole(selectedUser.role).map(
                    (permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2 p-2 bg-blue-50 rounded rtl:space-x-reverse"
                      >
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm rtl:text-right ltr:text-left">
                          {getPermissionName(permission)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Custom Permissions */}
              <div>
                <h4 className="text-lg font-semibold mb-4 rtl:text-right ltr:text-left">
                  {t("admin.users.permissions.customPermissions")}
                </h4>
                <p className="text-sm text-muted-foreground mb-4 rtl:text-right ltr:text-left">
                  {t("admin.users.permissions.customPermissionsDesc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg rtl:space-x-reverse"
                    >
                      <button
                        onClick={() => handlePermissionToggle(permission.id)}
                        className="flex items-center space-x-3 flex-1 rtl:space-x-reverse"
                      >
                        {selectedPermissions.includes(permission.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="rtl:text-right ltr:text-left">
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {permission.category}
                          </Badge>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permission Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2 rtl:text-right ltr:text-left">
                  {t("admin.users.permissions.summary")}
                </h5>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <span className="text-sm text-muted-foreground">
                    {t("admin.users.permissions.selected")}:{" "}
                    {selectedPermissions.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("admin.users.permissions.total")}: {permissions.length}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionsDialogOpen(false)}
            >
              {t("admin.users.dialogs.cancel")}
            </Button>
            <Button onClick={handleSavePermissions}>
              {t("admin.users.dialogs.savePermissions")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
