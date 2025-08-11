import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Share2,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  formatCurrencyForLocale,
  formatNumberForLocale,
  formatPercentageForLocale,
} from "@/lib/utils";
import i18n from "@/lib/i18n";

interface Owner {
  id: string;
  name: string;
  email: string;
  profitShare: number;
  currentBalance: number;
  isActive: boolean;
}

const ProfitShareManagement = () => {
  const { t } = useTranslation();

  // Sample data - in real app this would come from API
  const [owners, setOwners] = useState<Owner[]>([
    {
      id: "1",
      name: "Ahmed Hassan",
      email: "ahmed@ticketrunners.com",
      profitShare: 25.0,
      currentBalance: 450000,
      isActive: true,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@ticketrunners.com",
      profitShare: 20.0,
      currentBalance: 360000,
      isActive: true,
    },
    {
      id: "3",
      name: "Mohammed Al-Rashid",
      email: "mohammed@ticketrunners.com",
      profitShare: 15.0,
      currentBalance: 270000,
      isActive: true,
    },
    {
      id: "4",
      name: "Lisa Chen",
      email: "lisa@ticketrunners.com",
      profitShare: -5.0, // Negative due to early withdrawal
      currentBalance: -90000,
      isActive: true,
    },
  ]);

  const [editingOwner, setEditingOwner] = useState<string | null>(null);
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerShare, setNewOwnerShare] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [validationError, setValidationError] = useState("");

  const totalProfit = 1800000;
  const totalShareholders = owners.filter((owner) => owner.isActive).length;
  const totalDistributed = owners.reduce(
    (sum, owner) => sum + owner.currentBalance,
    0
  );
  const avgShare =
    totalShareholders > 0 ? totalDistributed / totalShareholders : 0;

  // Calculate total profit share percentage
  const totalProfitShare = owners.reduce(
    (sum, owner) => sum + owner.profitShare,
    0
  );

  // Real-time validation
  useEffect(() => {
    if (totalProfitShare > 100) {
      setValidationError("Total profit share cannot exceed 100%");
    } else if (totalProfitShare < 0) {
      setValidationError("Total profit share cannot be negative");
    } else {
      setValidationError("");
    }
  }, [totalProfitShare]);

  const handleProfitShareChange = (ownerId: string, newShare: number) => {
    setOwners((prev) =>
      prev.map((owner) =>
        owner.id === ownerId ? { ...owner, profitShare: newShare } : owner
      )
    );
  };

  const handleSaveChanges = (ownerId: string) => {
    setEditingOwner(null);
    // Here you would typically save to API
  };

  const handleCancelEdit = () => {
    setEditingOwner(null);
  };

  const handleAddOwner = () => {
    if (!newOwnerName || !newOwnerEmail || !newOwnerShare) {
      setValidationError("All fields are required");
      return;
    }

    const shareValue = parseFloat(newOwnerShare);
    if (isNaN(shareValue)) {
      setValidationError("Invalid profit share value");
      return;
    }

    const newTotal = totalProfitShare + shareValue;
    if (newTotal > 100) {
      setValidationError(
        "Adding this owner would exceed 100% total profit share"
      );
      return;
    }

    const newOwner: {
      id: string;
      name: string;
      email: string;
      profitShare: number;
      currentBalance: number;
      isActive: boolean;
    } = {
      id: Date.now().toString(),
      name: newOwnerName,
      email: newOwnerEmail,
      profitShare: shareValue,
      currentBalance: (shareValue / 100) * totalProfit,
      isActive: true,
    };

    setOwners((prev) => [...prev, newOwner]);
    setNewOwnerName("");
    setNewOwnerEmail("");
    setNewOwnerShare("");
    setShowAddForm(false);
    setValidationError("");
  };

  const handleRemoveOwner = (ownerId: string) => {
    setOwners((prev) => prev.filter((owner) => owner.id !== ownerId));
  };

  const handleToggleActive = (ownerId: string) => {
    setOwners((prev) =>
      prev.map((owner) =>
        owner.id === ownerId ? { ...owner, isActive: !owner.isActive } : owner
      )
    );
  };

  return (
    <div className="space-y-6" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rtl:flex-row-reverse">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold rtl:text-right ltr:text-left">
            {t("admin.dashboard.tabs.profitShare")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground rtl:text-right ltr:text-left">
            {t("admin.profitShare.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Owner
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rtl:space-x-reverse">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
            <div className="flex-1 rtl:text-right">
              <CardTitle className="text-sm font-medium">
                {t("admin.profitShare.stats.totalProfit")}
              </CardTitle>
            </div>
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold">
              {formatCurrencyForLocale(totalProfit, i18n.language)}
            </div>
            <p className="text-xs text-muted-foreground rtl:text-right">
              +15% {t("admin.profitShare.stats.fromLastPeriod")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
            <div className="flex-1 rtl:text-right">
              <CardTitle className="text-sm font-medium">
                {t("admin.profitShare.stats.shareholders")}
              </CardTitle>
            </div>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold">{totalShareholders}</div>
            <p className="text-xs text-muted-foreground rtl:text-right">
              {t("admin.profitShare.stats.activeShareholders")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
            <div className="flex-1 rtl:text-right">
              <CardTitle className="text-sm font-medium">
                {t("admin.profitShare.stats.totalDistributed")}
              </CardTitle>
            </div>
            <Share2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold">
              {formatCurrencyForLocale(totalDistributed, i18n.language)}
            </div>
            <p className="text-xs text-muted-foreground rtl:text-right">
              {((totalDistributed / totalProfit) * 100).toFixed(1)}%{" "}
              {t("admin.profitShare.stats.ofTotalProfit")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 rtl:flex-row-reverse">
            <div className="flex-1 rtl:text-right">
              <CardTitle className="text-sm font-medium">
                {t("admin.profitShare.stats.avgShare")}
              </CardTitle>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="rtl:text-right">
            <div className="text-2xl font-bold">
              {formatCurrencyForLocale(avgShare, i18n.language)}
            </div>
            <p className="text-xs text-muted-foreground rtl:text-right">
              {t("admin.profitShare.stats.perShareholder")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Total Profit Share Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
            <Share2 className="h-5 w-5" />
            Total Profit Share Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {totalProfitShare.toFixed(1)}%
              </div>
              <div className="flex items-center gap-2">
                {totalProfitShare === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : totalProfitShare > 100 ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {totalProfitShare === 100
                    ? "Perfect allocation"
                    : totalProfitShare > 100
                    ? "Exceeds 100%"
                    : `${(100 - totalProfitShare).toFixed(1)}% remaining`}
                </span>
              </div>
            </div>
            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  totalProfitShare === 100
                    ? "bg-green-500"
                    : totalProfitShare > 100
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(totalProfitShare, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Owner Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Owner</CardTitle>
            <CardDescription>
              Add a new owner with their profit share percentage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="Enter owner name"
                />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="ownerShare">Profit Share (%)</Label>
                <Input
                  id="ownerShare"
                  type="number"
                  step="0.1"
                  value={newOwnerShare}
                  onChange={(e) => setNewOwnerShare(e.target.value)}
                  placeholder="Enter percentage"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddOwner}>Add Owner</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Owners List */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Share Owners</CardTitle>
          <CardDescription>
            Manage profit share percentages for each owner. Total cannot exceed
            100%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {owners.map((owner) => (
              <div
                key={owner.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{owner.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {owner.email}
                      </p>
                    </div>
                    <Badge variant={owner.isActive ? "default" : "secondary"}>
                      {owner.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {owner.profitShare < 0 && (
                      <Badge variant="destructive">Overdrawn</Badge>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Current Balance:{" "}
                    {formatCurrencyForLocale(
                      owner.currentBalance,
                      i18n.language
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {editingOwner === owner.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={owner.profitShare}
                        onChange={(e) =>
                          handleProfitShareChange(
                            owner.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20"
                      />
                      <span className="text-sm">%</span>
                      <Button
                        size="sm"
                        onClick={() => handleSaveChanges(owner.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{owner.profitShare}%</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingOwner(owner.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(owner.id)}
                  >
                    {owner.isActive ? "Deactivate" : "Activate"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveOwner(owner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitShareManagement;
