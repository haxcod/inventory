import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Select } from "../components/ui/Select";
import type { SelectOption } from "../components/ui/Select";
import type { Payment } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useConfirmations } from "../hooks/useConfirmations";
import { useAuth, usePayments } from "../hooks/useStores";
import { apiService } from "../lib/api";
import { hasPermission, PERMISSIONS } from "../lib/permissions";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { payments, fetchPayments, isLoading, error, createPayment: storeCreatePayment, removePayment } = usePayments();
  const { confirmDelete, showError } = useConfirmations();
  
  // Permission checks
  const canDeletePayment = hasPermission(user, PERMISSIONS.PAYMENTS_DELETE);
  const canEditPayment = hasPermission(user, PERMISSIONS.PAYMENTS_EDIT);
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentMethod: "cash" as "cash" | "card" | "upi" | "bank_transfer",
    paymentType: "credit" as "credit" | "debit",
    description: "",
    reference: "",
    customer: "",
    notes: "",
  });

  // Load data using the same pattern as other pages
  useEffect(() => {
    console.log('🔍 PaymentsPage useEffect - payments.length:', payments.length);
    
    // Only fetch payments if we don't have payments yet
    if (payments.length === 0) {
      console.log('📥 Fetching payments...');
      fetchPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments.length]); // fetchPayments is stable from Zustand

  // Create payment function using Zustand store
  const createPayment = useCallback(async (paymentData: Partial<Payment>) => {
    try {
      setIsCreatingPayment(true);
      // Use store method which handles API call and state update
      await storeCreatePayment(paymentData);
      setShowNewPayment(false);
      setNewPayment({
        amount: "",
        paymentMethod: "cash",
        paymentType: "credit",
        description: "",
        reference: "",
        customer: "",
        notes: "",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating payment';
      console.error('Payment creation error:', errorMessage);
      showError(errorMessage);
    } finally {
      setIsCreatingPayment(false);
    }
  }, [storeCreatePayment, showError]);

  // Delete payment function using Zustand store
  const deletePayment = useCallback(async (paymentId: string) => {
    try {
      setIsDeletingPayment(true);
      // Use store method which handles API call and state update
      await removePayment(paymentId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting payment';
      console.error('Payment deletion error:', errorMessage);
    } finally {
      setIsDeletingPayment(false);
    }
  }, [removePayment]);
  const [editPayment, setEditPayment] = useState({
    amount: "",
    paymentMethod: "cash" as "cash" | "card" | "upi" | "bank_transfer",
    paymentType: "credit" as "credit" | "debit",
    description: "",
    reference: "",
    customer: "",
    notes: "",
  });

  const paymentMethodOptions: SelectOption[] = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  const paymentTypeOptions: SelectOption[] = [
    { value: "credit", label: "Credit (Money In)" },
    { value: "debit", label: "Debit (Money Out)" },
  ];

  const typeFilterOptions: SelectOption[] = [
    { value: "all", label: "All Types" },
    { value: "credit", label: "Credits Only" },
    { value: "debit", label: "Debits Only" },
  ];

  const methodFilterOptions: SelectOption[] = [
    { value: "all", label: "All Methods" },
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];


  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showNewPayment || showEditPayment || showPaymentDetails) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showNewPayment, showEditPayment, showPaymentDetails]);

  const filteredPayments = useMemo(() => {
    return (Array.isArray(payments) ? payments : []).filter((payment) => {
      const matchesSearch =
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" || payment.paymentType === typeFilter;
      const matchesMethod =
        methodFilter === "all" || payment.paymentMethod === methodFilter;

      return matchesSearch && matchesType && matchesMethod;
    });
  }, [payments, searchTerm, typeFilter, methodFilter]);

  // Memoize stats calculations to prevent unnecessary re-renders
  const stats = useMemo(() => {
    const safePayments = Array.isArray(payments) ? payments : [];
    return {
      totalAmount: safePayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ),
      totalPayments: safePayments.length,
      creditAmount: safePayments
        .filter((p) => p.paymentType === "credit")
        .reduce((sum, p) => sum + p.amount, 0),
      debitAmount: safePayments
        .filter((p) => p.paymentType === "debit")
        .reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments]);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCardIcon className="h-5 w-5" />;
      case "upi":
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case "cash":
        return <BanknotesIcon className="h-5 w-5" />;
      case "bank_transfer":
        return <BuildingLibraryIcon className="h-5 w-5" />;
      default:
        return <BanknotesIcon className="h-5 w-5" />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    return type === "credit" ? "text-green-600" : "text-red-600";
  };

  const handleCreatePayment = async () => {
    if (!user) {
      showError("User not authenticated");
      return;
    }

    const paymentData = {
      ...newPayment,
      amount: parseFloat(newPayment.amount),
      branch: "main", // You might want to get this from branches API
      createdBy: user._id,
    };

    await createPayment(paymentData);

    // Reset form on success
    setNewPayment({
      amount: "",
      paymentMethod: "cash",
      paymentType: "credit",
      description: "",
      reference: "",
      customer: "",
      notes: "",
    });
    setShowNewPayment(false);
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleClosePaymentDetails = () => {
    setSelectedPayment(null);
    setShowPaymentDetails(false);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setEditPayment({
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType,
      description: payment.description,
      reference: payment.reference || "",
      customer: payment.customer || "",
      notes: payment.notes || "",
    });
    setShowEditPayment(true);
  };

  const handleCloseEditPayment = () => {
    setEditingPayment(null);
    setShowEditPayment(false);
    setEditPayment({
      amount: "",
      paymentMethod: "cash",
      paymentType: "credit",
      description: "",
      reference: "",
      customer: "",
      notes: "",
    });
  };

  const handleUpdatePayment = async () => {
    try {
      if (!editingPayment) return;

      // Real API call
      const paymentData = {
        amount: parseFloat(editPayment.amount),
        paymentMethod: editPayment.paymentMethod,
        paymentType: editPayment.paymentType,
        description: editPayment.description,
        reference: editPayment.reference,
        customer: editPayment.customer,
        notes: editPayment.notes,
      };

      const response = await apiService.payments.update(
        editingPayment._id,
        paymentData
      );
      if (response.data.success) {
        // Payment updated successfully - the list will refresh automatically via API hooks
      } else {
        throw new Error(response.data.message || "Failed to update payment");
      }

      setShowEditPayment(false);
      setEditingPayment(null);
      setEditPayment({
        amount: "",
        paymentMethod: "cash",
        paymentType: "credit",
        description: "",
        reference: "",
        customer: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    const payment = (Array.isArray(payments) ? payments : []).find(
      (p) => p._id === paymentId
    );
    const paymentName = payment
      ? `${payment.customer} - ${formatCurrency(payment.amount)}`
      : "this payment";

    confirmDelete(paymentName, async () => {
      await deletePayment(paymentId);
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div
            className="animate-spin rounded-full h-16 w-16"
            style={{ borderBottom: "2px solid hsl(var(--primary))" }}
          ></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Payments
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <Button
                onClick={() => fetchPayments()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading if no data yet
  if (isLoading || !payments) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div
            className="animate-spin rounded-full h-16 w-16"
            style={{ borderBottom: "2px solid hsl(var(--primary))" }}
          ></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Payment Management
              </h1>
              <p className="mt-2 text-emerald-100 dark:text-gray-300 text-sm sm:text-base">
                Track and manage all payment transactions
              </p>
            </div>
            <Button
              onClick={() => setShowNewPayment(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-emerald-400 w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                    <BanknotesIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Payments
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {stats.totalPayments}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      ₹
                    </span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Amount
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(stats.totalAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      +
                    </span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Credits
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(stats.creditAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      -
                    </span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Debits
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(stats.debitAmount)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Payment Modal */}
        {showNewPayment && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNewPayment(false);
              }
            }}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-black">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <PlusIcon className="h-5 w-5 text-emerald-600" />
                    Create New Payment
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewPayment(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <CardDescription className="text-muted-foreground">
                  Record a new payment transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="amount"
                      className="text-sm font-semibold text-foreground"
                    >
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="Enter amount"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="paymentMethod"
                      className="text-sm font-semibold text-foreground"
                    >
                      Payment Method
                    </Label>
                    <Select
                      id="paymentMethod"
                      options={paymentMethodOptions}
                      value={newPayment.paymentMethod}
                      onChange={(value) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          paymentMethod: value as
                            | "cash"
                            | "card"
                            | "upi"
                            | "bank_transfer",
                        }))
                      }
                      placeholder="Select payment method"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="paymentType"
                      className="text-sm font-semibold text-foreground"
                    >
                      Payment Type
                    </Label>
                    <Select
                      id="paymentType"
                      options={paymentTypeOptions}
                      value={newPayment.paymentType}
                      onChange={(value) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          paymentType: value as "credit" | "debit",
                        }))
                      }
                      placeholder="Select payment type"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="customer"
                      className="text-sm font-semibold text-foreground"
                    >
                      Customer
                    </Label>
                    <Input
                      id="customer"
                      value={newPayment.customer}
                      onChange={(e) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          customer: e.target.value,
                        }))
                      }
                      placeholder="Enter customer name"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-foreground"
                    >
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newPayment.description}
                      onChange={(e) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter payment description"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="reference"
                      className="text-sm font-semibold text-foreground"
                    >
                      Reference
                    </Label>
                    <Input
                      id="reference"
                      value={newPayment.reference}
                      onChange={(e) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          reference: e.target.value,
                        }))
                      }
                      placeholder="Transaction reference"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="notes"
                      className="text-sm font-semibold text-foreground"
                    >
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      value={newPayment.notes}
                      onChange={(e) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Additional notes"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPayment(false)}
                    className="border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePayment}
                    disabled={isCreatingPayment}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {isCreatingPayment ? "Creating..." : "Create Payment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label
                  htmlFor="search"
                  className="text-sm font-semibold text-foreground"
                >
                  Search Payments
                </Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by description, customer, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    className="pl-12"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="type"
                  className="text-sm font-semibold text-foreground"
                >
                  Type
                </Label>
                <Select
                  id="type"
                  options={typeFilterOptions}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="Select type"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="method"
                  className="text-sm font-semibold text-foreground"
                >
                  Method
                </Label>
                <Select
                  id="method"
                  options={methodFilterOptions}
                  value={methodFilter}
                  onChange={setMethodFilter}
                  placeholder="Select method"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card
              key={payment._id}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            payment.paymentMethod === "cash"
                              ? "bg-green-100 text-green-600"
                              : payment.paymentMethod === "card"
                              ? "bg-blue-100 text-blue-600"
                              : payment.paymentMethod === "upi"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </div>
                        <span className="capitalize font-semibold text-foreground">
                          {payment.paymentMethod.replace("_", " ")}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.paymentType === "credit"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {payment.paymentType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      {payment.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        <strong>Customer:</strong> {payment.customer}
                      </span>
                      <span>
                        <strong>Ref:</strong> {payment.reference}
                      </span>
                      <span>
                        <strong>Date:</strong> {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${getPaymentTypeColor(
                        payment.paymentType
                      )}`}
                    >
                      {payment.paymentType === "credit" ? "+" : "-"}
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => handleViewPayment(payment)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {canEditPayment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={() => handleEditPayment(payment)}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {canDeletePayment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeletePayment(payment._id)}
                      disabled={isDeletingPayment}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      {isDeletingPayment ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <BanknotesIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? "No payments found" : "No payments available"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or filters."
                  : "Get started by recording your first payment transaction."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowNewPayment(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Record First Payment
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Details Modal */}
        {showPaymentDetails && selectedPayment && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClosePaymentDetails();
              }
            }}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-black">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <EyeIcon className="h-5 w-5 text-blue-600" />
                    Payment Details
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClosePaymentDetails}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Payment Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          selectedPayment.paymentMethod === "cash"
                            ? "bg-green-100 text-green-600"
                            : selectedPayment.paymentMethod === "card"
                            ? "bg-blue-100 text-blue-600"
                            : selectedPayment.paymentMethod === "upi"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg capitalize">
                          {selectedPayment.paymentMethod.replace("_", " ")}{" "}
                          Payment
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedPayment.paymentType === "credit"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {selectedPayment.paymentType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-3xl font-bold ${getPaymentTypeColor(
                          selectedPayment.paymentType
                        )}`}
                      >
                        {selectedPayment.paymentType === "credit" ? "+" : "-"}
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        Transaction Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Description
                          </label>
                          <p className="text-foreground">
                            {selectedPayment.description}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Reference
                          </label>
                          <p className="text-foreground font-mono">
                            {selectedPayment.reference}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Customer
                          </label>
                          <p className="text-foreground">
                            {selectedPayment.customer}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        Payment Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Payment Method
                          </label>
                          <p className="text-foreground capitalize">
                            {selectedPayment.paymentMethod.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Payment Type
                          </label>
                          <p className="text-foreground capitalize">
                            {selectedPayment.paymentType}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Date
                          </label>
                          <p className="text-foreground">
                            {formatDate(selectedPayment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      Additional Information
                    </h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Branch:
                          </span>
                          <span className="ml-2 text-foreground capitalize">
                            {(() => {
                              if (typeof selectedPayment.branch === "string") {
                                return selectedPayment.branch || "Main Branch";
                              }
                              if (
                                selectedPayment.branch &&
                                typeof selectedPayment.branch === "object" &&
                                "name" in selectedPayment.branch
                              ) {
                                return (selectedPayment.branch as { name: string }).name;
                              }
                              return "Main Branch";
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Created By:
                          </span>
                          <span className="ml-2 text-foreground">
                            {(() => {
                              if (
                                typeof selectedPayment.createdBy === "string"
                              ) {
                                return (
                                  selectedPayment.createdBy || "Unknown User"
                                );
                              }
                              if (
                                selectedPayment.createdBy &&
                                typeof selectedPayment.createdBy === "object" &&
                                "name" in selectedPayment.createdBy
                              ) {
                                return (selectedPayment.createdBy as { name: string }).name;
                              }
                              return "Unknown User";
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Created At:
                          </span>
                          <span className="ml-2 text-foreground">
                            {formatDate(selectedPayment.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Updated At:
                          </span>
                          <span className="ml-2 text-foreground">
                            {formatDate(selectedPayment.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClosePaymentDetails}
                    className="border-2 border-gray-200 hover:border-gray-300"
                  >
                    Close
                  </Button>
                  {canEditPayment && (
                    <Button
                      onClick={() => {
                        setShowPaymentDetails(false);
                        handleEditPayment(selectedPayment);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Payment Modal */}
        {showEditPayment && editingPayment && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseEditPayment();
              }
            }}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-black">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <PencilIcon className="h-5 w-5 text-blue-600" />
                    Edit Payment
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseEditPayment}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <CardDescription className="text-muted-foreground">
                  Update payment transaction details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="edit-amount"
                      className="text-sm font-semibold text-foreground"
                    >
                      Amount
                    </Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      value={editPayment.amount}
                      onChange={(e) =>
                        setEditPayment((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="Enter amount"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-paymentMethod"
                      className="text-sm font-semibold text-foreground"
                    >
                      Payment Method
                    </Label>
                    <Select
                      id="edit-paymentMethod"
                      options={paymentMethodOptions}
                      value={editPayment.paymentMethod}
                      onChange={(value) =>
                        setEditPayment((prev) => ({
                          ...prev,
                          paymentMethod: value as
                            | "cash"
                            | "card"
                            | "upi"
                            | "bank_transfer",
                        }))
                      }
                      placeholder="Select payment method"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-paymentType"
                      className="text-sm font-semibold text-foreground"
                    >
                      Payment Type
                    </Label>
                    <Select
                      id="edit-paymentType"
                      options={paymentTypeOptions}
                      value={editPayment.paymentType}
                      onChange={(value) =>
                        setEditPayment((prev) => ({
                          ...prev,
                          paymentType: value as "credit" | "debit",
                        }))
                      }
                      placeholder="Select payment type"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-customer"
                      className="text-sm font-semibold text-foreground"
                    >
                      Customer
                    </Label>
                    <Input
                      id="edit-customer"
                      value={editPayment.customer}
                      onChange={(e) =>
                        setEditPayment((prev) => ({
                          ...prev,
                          customer: e.target.value,
                        }))
                      }
                      placeholder="Enter customer name"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="edit-description"
                      className="text-sm font-semibold text-foreground"
                    >
                      Description
                    </Label>
                    <Input
                      id="edit-description"
                      value={editPayment.description}
                      onChange={(e) =>
                        setEditPayment((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter payment description"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-reference"
                      className="text-sm font-semibold text-foreground"
                    >
                      Reference
                    </Label>
                    <Input
                      id="edit-reference"
                      value={editPayment.reference}
                      onChange={(e) =>
                        setEditPayment((prev) => ({
                          ...prev,
                          reference: e.target.value,
                        }))
                      }
                      placeholder="Transaction reference"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-notes"
                      className="text-sm font-semibold text-foreground"
                    >
                      Notes
                    </Label>
                    <Input
                      id="edit-notes"
                      value={editPayment.notes}
                      onChange={(e) =>
                        setEditPayment((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Additional notes"
                      size="lg"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseEditPayment}
                    className="border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdatePayment}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Update Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
