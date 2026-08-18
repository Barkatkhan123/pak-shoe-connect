import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  Users,
  ShoppingBag,
  FileText,
  Boxes,
  CreditCard,
  ShieldCheck,
  Truck,
  Star,
  AlertTriangle,
  Ticket,
  BarChart3,
  Settings,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  ArrowUpRight,
  Search,
  Clock,
  Key,
  LogOut,
  Shield,
  Mail,
  CheckCircle,
  Smartphone,
  Terminal,
  History,
  Fingerprint,
  Download,
  Send,
  LifeBuoy,
  Wifi,
  WifiOff,
  Zap,
  Globe,
  Database,
  Server,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Banknote,
  Scale,
  MessageSquareWarning,
  HeartPulse,
  SlidersHorizontal,
  X,
  Trash2,
  PackageCheck,
  Phone,
  MapPin,
  Calendar,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  PRODUCTS,
  Product,
  getStoredProducts,
  saveStoredProducts,
  resetStoredProducts,
} from "@/data/products";
import { AdminProductTable } from "@/components/admin/admin-product-table";
import { ProductManageModal } from "@/components/admin/product-manage-modal";
import {
  adminSecurityEngine,
  MASTER_ADMIN_EMAIL,
  AdminUserSession,
  AuditLogEntry,
  EMERGENCY_RECOVERY_CODES,
} from "@/lib/admin-auth";
import { apiClient } from "@/lib/api-client";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboardPage,
});

// Analytics Mock Data
const GMV_TREND_DATA = [
  { day: "Mon", gmv: 4200000, revenue: 126000 },
  { day: "Tue", gmv: 5800000, revenue: 174000 },
  { day: "Wed", gmv: 6100000, revenue: 183000 },
  { day: "Thu", gmv: 7900000, revenue: 237000 },
  { day: "Fri", gmv: 8400000, revenue: 252000 },
  { day: "Sat", gmv: 6800000, revenue: 204000 },
  { day: "Sun", gmv: 6600000, revenue: 198000 },
];

const CATEGORY_SHARE_DATA = [
  { name: "Men's Formal Leather", value: 42, color: "#1e3a8a" },
  { name: "Men's Casual Sneakers", value: 28, color: "#0284c7" },
  { name: "Women's Chappal & Sandals", value: 18, color: "#0d9488" },
  { name: "Kids Footwear", value: 12, color: "#f59e0b" },
];

const INITIAL_SUPPLIERS = [
  {
    id: "SUPP-001",
    factoryName: "Sialkot Master Syndicate Leather Works",
    city: "Sialkot",
    ntn: "4192837-1",
    capacity: "25,000 Pairs/Mo",
    status: "VERIFIED",
    badge: "Gold Factory",
    joinedAt: "2026-01-15",
  },
  {
    id: "SUPP-002",
    factoryName: "Lahore Footwear Craftsmen Syndicate",
    city: "Lahore",
    ntn: "7829104-3",
    capacity: "12,000 Pairs/Mo",
    status: "PENDING",
    badge: "Starter Workshop",
    joinedAt: "2026-08-03",
  },
  {
    id: "SUPP-003",
    factoryName: "Rawalpindi Traditional Peshawari Chappal Guild",
    city: "Rawalpindi",
    ntn: "9912044-8",
    capacity: "18,000 Pairs/Mo",
    status: "VERIFIED",
    badge: "Regional Master",
    joinedAt: "2026-02-20",
  },
];

const MOCK_ORDERS = [
  {
    id: "ORD-9821",
    buyer: "Karachi Leather Hub",
    amount: "PKR 148,000",
    items: "96 pairs (8 ctns)",
    biltiNo: "KHI-BLT-4091",
    status: "DISPATCHED",
  },
  {
    id: "ORD-9822",
    buyer: "Multan Footwear Traders",
    amount: "PKR 88,800",
    items: "48 pairs (4 ctns)",
    biltiNo: "MLT-BLT-1029",
    status: "PROCESSING",
  },
  {
    id: "ORD-9823",
    buyer: "Peshawar Shoe Mart",
    amount: "PKR 222,000",
    items: "144 pairs (12 ctns)",
    biltiNo: "PSH-BLT-8812",
    status: "DELIVERED",
  },
  {
    id: "ORD-9824",
    buyer: "Quetta Traders Syndicate",
    amount: "PKR 310,000",
    items: "240 pairs (20 ctns)",
    biltiNo: "QTA-BLT-7719",
    status: "PROCESSING",
  },
];

export interface ProductSample {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  productSku: string;
  productName: string;
  color: string;
  size: string;
  courier: string;
  trackingNo: string;
  sampleFee: number;
  paymentStatus: "PAID" | "PENDING_FEE" | "WAIVED_VIP";
  status:
    "REQUESTED" | "PREPARING" | "DISPATCHED" | "DELIVERED" | "CONVERTED_TO_BULK" | "CANCELLED";
  requestedDate: string;
  notes?: string;
}

const INITIAL_SAMPLES: ProductSample[] = [
  {
    id: "SMP-1081",
    buyerName: "Apex Retail Group",
    buyerPhone: "+92 300 8492019",
    buyerCity: "Lahore",
    productSku: "SHR-101",
    productName: "Presidential Oxford Leather Shoe",
    color: "Tan",
    size: "9",
    courier: "TCS Express",
    trackingNo: "TCS-9921048",
    sampleFee: 2500,
    paymentStatus: "PAID",
    status: "DISPATCHED",
    requestedDate: "2026-08-12",
    notes: "Requires sole cross-section sample piece inside box",
  },
  {
    id: "SMP-1082",
    buyerName: "Khyber Shoe Emporium",
    buyerPhone: "+92 333 4910283",
    buyerCity: "Peshawar",
    productSku: "SHR-104",
    productName: "Artisanal Peshawari Chappal Norozi Cut",
    color: "Dark Chocolate",
    size: "8",
    courier: "Leopard Courier",
    trackingNo: "LEO-4019283",
    sampleFee: 2800,
    paymentStatus: "PAID",
    status: "DELIVERED",
    requestedDate: "2026-08-09",
    notes: "Checking tyre sole density before placing 120 cartons order",
  },
  {
    id: "SMP-1083",
    buyerName: "Karachi Leather Footwear Hub",
    buyerPhone: "+92 321 9820194",
    buyerCity: "Karachi",
    productSku: "SHR-102",
    productName: "Executive Derby Brogue",
    color: "Black",
    size: "10",
    courier: "M&P Express",
    trackingNo: "Pending Dispatch",
    sampleFee: 2500,
    paymentStatus: "PAID",
    status: "PREPARING",
    requestedDate: "2026-08-14",
    notes: "Urgent sample pair needed for board review",
  },
  {
    id: "SMP-1084",
    buyerName: "Multan Bazaars Syndicate",
    buyerPhone: "+92 301 5519283",
    buyerCity: "Multan",
    productSku: "SHR-103",
    productName: "Monk Strap Hand-Burnished Loafer",
    color: "Burgundy",
    size: "8",
    courier: "TCS Express",
    trackingNo: "TCS-1102934",
    sampleFee: 2600,
    paymentStatus: "PAID",
    status: "CONVERTED_TO_BULK",
    requestedDate: "2026-08-02",
    notes: "Sample approved! Converted to 60 cartons bulk order ORD-9822.",
  },
];

// ── Mock data for Payments / Escrow tab ──
const MOCK_ESCROW_TRANSACTIONS = [
  {
    id: "ESC-4401",
    orderId: "ORD-9821",
    buyer: "Karachi Leather Hub",
    supplier: "Sialkot Master Syndicate",
    amount: "PKR 148,000",
    held: "PKR 4,440",
    status: "HELD",
    date: "2026-08-10",
  },
  {
    id: "ESC-4402",
    orderId: "ORD-9822",
    buyer: "Multan Footwear Traders",
    supplier: "Lahore Footwear Craftsmen",
    amount: "PKR 88,800",
    held: "PKR 2,664",
    status: "RELEASED",
    date: "2026-08-09",
  },
  {
    id: "ESC-4403",
    orderId: "ORD-9823",
    buyer: "Peshawar Shoe Mart",
    supplier: "Sialkot Master Syndicate",
    amount: "PKR 222,000",
    held: "PKR 6,660",
    status: "HELD",
    date: "2026-08-11",
  },
  {
    id: "ESC-4404",
    orderId: "ORD-9819",
    buyer: "Faisalabad Retail Chain",
    supplier: "Lahore Footwear Craftsmen",
    amount: "PKR 310,000",
    held: "PKR 9,300",
    status: "IN_DISPUTE",
    date: "2026-08-07",
  },
];

// ── Mock data for Disputes tab ──
const INITIAL_DISPUTES = [
  {
    id: "DIS-1101",
    orderId: "ORD-9819",
    buyer: "Faisalabad Retail Chain",
    supplier: "Lahore Footwear Craftsmen",
    amount: "PKR 310,000",
    reason: "Wrong color delivered (Brown instead of Black)",
    status: "OPEN",
    opened: "2026-08-08",
  },
  {
    id: "DIS-1102",
    orderId: "ORD-9810",
    buyer: "Rawalpindi Wholesale",
    supplier: "Sialkot Master Syndicate",
    amount: "PKR 74,400",
    reason: "Quality below agreed specification — sole delamination",
    status: "IN_REVIEW",
    opened: "2026-08-04",
  },
  {
    id: "DIS-1103",
    orderId: "ORD-9805",
    buyer: "Quetta Footwear Hub",
    supplier: "Lahore Footwear Craftsmen",
    amount: "PKR 192,000",
    reason: "Late delivery — 12 days beyond agreed lead time",
    status: "RESOLVED",
    opened: "2026-07-28",
  },
];

// ── Mock data for System Health tab ──
const SYSTEM_SERVICES = [
  {
    name: "API Gateway",
    status: "OPERATIONAL",
    latency: 42,
    uptime: "99.97%",
    lastChecked: "2 min ago",
    icon: Server,
  },
  {
    name: "Supabase Database",
    status: "OPERATIONAL",
    latency: 18,
    uptime: "99.99%",
    lastChecked: "1 min ago",
    icon: Database,
  },
  {
    name: "Payment Gateway",
    status: "DEGRADED",
    latency: 380,
    uptime: "98.21%",
    lastChecked: "3 min ago",
    icon: CreditCard,
  },
  {
    name: "CDN & Media",
    status: "OPERATIONAL",
    latency: 12,
    uptime: "100%",
    lastChecked: "1 min ago",
    icon: Globe,
  },
  {
    name: "Bilti Tracking",
    status: "OPERATIONAL",
    latency: 95,
    uptime: "99.80%",
    lastChecked: "5 min ago",
    icon: Truck,
  },
  {
    name: "Email Notifications",
    status: "OPERATIONAL",
    latency: 210,
    uptime: "99.65%",
    lastChecked: "4 min ago",
    icon: Mail,
  },
];

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [productsList, setProductsList] = useState<Product[]>(() => getStoredProducts());

  useEffect(() => {
    const handleProductsUpdate = () => {
      setProductsList(getStoredProducts());
    };
    window.addEventListener("shersha_products_update", handleProductsUpdate);
    window.addEventListener("storage", handleProductsUpdate);
    return () => {
      window.removeEventListener("shersha_products_update", handleProductsUpdate);
      window.removeEventListener("storage", handleProductsUpdate);
    };
  }, []);

  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [ordersList, setOrdersList] = useState(MOCK_ORDERS);
  const [escrowList, setEscrowList] = useState(MOCK_ESCROW_TRANSACTIONS);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  // Supplier modal temp state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newFactoryName, setNewFactoryName] = useState("");
  const [newFactoryCity, setNewFactoryCity] = useState("Lahore");
  const [newFactoryNtn, setNewFactoryNtn] = useState("");
  const [newFactoryCapacity, setNewFactoryCapacity] = useState("15,000 Pairs/Mo");

  // Order modal temp state
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrderBuyer, setNewOrderBuyer] = useState("");
  const [newOrderAmount, setNewOrderAmount] = useState("PKR 120,000");
  const [newOrderItems, setNewOrderItems] = useState("60 pairs (5 ctns)");
  const [newOrderBilti, setNewOrderBilti] = useState("");

  // Sample Product state
  const [samplesList, setSamplesList] = useState<ProductSample[]>(INITIAL_SAMPLES);
  const [sampleSearch, setSampleSearch] = useState("");
  const [sampleFilter, setSampleFilter] = useState<string>("ALL");
  const [isAddSampleOpen, setIsAddSampleOpen] = useState(false);
  const [newSampleBuyer, setNewSampleBuyer] = useState("");
  const [newSamplePhone, setNewSamplePhone] = useState("+92 300 ");
  const [newSampleCity, setNewSampleCity] = useState("Lahore");
  const [newSampleSku, setNewSampleSku] = useState("SHR-101");
  const [newSampleColor, setNewSampleColor] = useState("Tan");
  const [newSampleSize, setNewSampleSize] = useState("9");
  const [newSampleCourier, setNewSampleCourier] = useState("TCS Express");
  const [newSampleTracking, setNewSampleTracking] = useState("");
  const [newSampleFee, setNewSampleFee] = useState(2500);
  const [newSamplePayment, setNewSamplePayment] = useState<"PAID" | "PENDING_FEE" | "WAIVED_VIP">(
    "PAID",
  );
  const [newSampleNotes, setNewSampleNotes] = useState("");

  // Edit Tracking Modal state
  const [editingSample, setEditingSample] = useState<ProductSample | null>(null);
  const [editTrackingNo, setEditTrackingNo] = useState("");
  const [editCourier, setEditCourier] = useState("TCS Express");

  // Settings state for Platform Settings tab
  const [commissionRate, setCommissionRate] = useState(3);
  const [editingCommission, setEditingCommission] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    escrowProtection: true,
    rfqSystem: true,
    biltiTracking: true,
    supplierVerification: true,
  });

  // Production Auth & 2FA State
  const [session, setSession] = useState<AdminUserSession | null>(() =>
    adminSecurityEngine.getStoredSession(),
  );
  const [loginStep, setLoginStep] = useState<"CREDENTIALS" | "2FA_OTP" | "RECOVERY">("CREDENTIALS");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutState, setLockoutState] = useState(adminSecurityEngine.getFailedAttempts());

  // Load audit logs — try Supabase first, fall back to localStorage cache
  useEffect(() => {
    if (!session) return;
    setAuditLogsLoading(true);
    adminSecurityEngine.getAuditLogsAsync().then((logs) => {
      setAuditLogs(logs);
      setAuditLogsLoading(false);
    });
  }, [session]);

  // Step 1: Submit Credentials & Issue OTP
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // BUG-19 FIX: Validate that password field is not empty.
    if (!passwordInput.trim()) {
      toast.error("Password is required.");
      return;
    }

    const failedStatus = adminSecurityEngine.getFailedAttempts();
    if (failedStatus.lockedUntil && Date.now() < failedStatus.lockedUntil) {
      toast.error("Too many failed attempts. Please try again in 15 minutes.");
      return;
    }

    if (!emailInput.trim()) {
      toast.error("Email is required.");
      return;
    }

    const normalizedEmail = emailInput.trim().toLowerCase();
    setEmailInput(normalizedEmail);

    const authCheck = await adminSecurityEngine.verifyServerAuthorization(
      normalizedEmail,
      passwordInput,
    );

    if (!authCheck.authorized) {
      adminSecurityEngine.recordFailedAttempt();
      setLockoutState(adminSecurityEngine.getFailedAttempts());
      adminSecurityEngine.logActivity({
        adminEmail: normalizedEmail,
        role: "USER",
        action: "UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT",
        target: "Admin Portal",
        ipAddress: "[resolved server-side]",
        status: "DENIED",
        details: authCheck.reason || "Unauthorized email",
      });
      toast.error("Invalid credentials or unauthorized account.");
      return;
    }

    // Successful Master Admin password authentication -> establish session directly
    adminSecurityEngine.resetFailedAttempts();
    const newSession = adminSecurityEngine.createSession(normalizedEmail, true);
    setSession(newSession);
    toast.success("Welcome back, Master Admin! Signed in successfully.");
  };

  // Step 2: Submit 2FA OTP
  const handle2faSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = (emailInput.trim() || MASTER_ADMIN_EMAIL).toLowerCase();
    const result = adminSecurityEngine.verifyDynamicOtp(targetEmail, otpInput);
    if (!result.valid) {
      adminSecurityEngine.recordFailedAttempt();
      setLockoutState(adminSecurityEngine.getFailedAttempts());
      toast.error(result.reason || "Invalid verification code");
      return;
    }

    adminSecurityEngine.resetFailedAttempts();
    const newSession = adminSecurityEngine.createSession(targetEmail, true);
    setSession(newSession);
    toast.success("Authenticated successfully as Master Admin");
  };

  // Step 3: Backup Recovery Code Verification
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!EMERGENCY_RECOVERY_CODES.includes(recoveryCodeInput.trim().toUpperCase())) {
      toast.error("Invalid emergency recovery code");
      return;
    }

    adminSecurityEngine.resetFailedAttempts();
    const newSession = adminSecurityEngine.createSession(emailInput, true);
    setSession(newSession);
    toast.success("Emergency recovery code verified");
  };

  const handleAdminLogout = () => {
    adminSecurityEngine.clearSession();
    setSession(null);
    setLoginStep("CREDENTIALS");
    setEmailInput("");
    setPasswordInput("");
    setOtpInput("");
    setRecoveryCodeInput("");
    toast.info("Signed out");
  };

  // Export Audit Logs as CSV
  const handleExportAuditLogs = () => {
    const logs = adminSecurityEngine.getAuditLogs();
    const rows = [
      "Log ID,Request ID,Timestamp,Admin Email,Role,Action,Target,IP,Status,Details",
      ...logs.map((l) =>
        // BUG-18 FIX: Use Blob + createObjectURL so commas, quotes, and
        // Unicode characters (e.g. Urdu product names) don't corrupt the CSV.
        [
          l.id,
          l.requestId,
          l.timestamp,
          l.adminEmail,
          l.role,
          `"${l.action.replace(/"/g, '""')}"`,
          `"${l.target.replace(/"/g, '""')}"`,
          l.ipAddress,
          l.status,
          `"${(l.details || "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `anamon_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Audit Trail exported to CSV");
  };

  // Protected Product Actions
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsManageModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsManageModalOpen(true);
  };

  const handleDeleteProduct = async (productSlug: string) => {
    // BUG-09 FIX: Guard against undefined product before passing to API.
    const targetProduct = productsList.find((p) => p.slug === productSlug);
    if (!targetProduct) {
      toast.error("Product not found.");
      return;
    }

    const apiRes = await apiClient.admin.performProductAction("DELETE", targetProduct);

    if (!apiRes.success) {
      toast.error(apiRes.error || "Access Denied");
      return;
    }

    const updated = productsList.filter((p) => p.slug !== productSlug);
    setProductsList(updated);
    saveStoredProducts(updated);
    setAuditLogs(adminSecurityEngine.getAuditLogs());
    toast.success(`Product deleted`);
  };

  const handleToggleStockStatus = async (productSlug: string) => {
    // BUG-10 FIX: Guard against undefined product before spreading into update.
    const targetProduct = productsList.find((p) => p.slug === productSlug);
    if (!targetProduct) {
      toast.error("Product not found.");
      return;
    }

    const updatedProduct = { ...targetProduct, inStock: !targetProduct.inStock };
    const apiRes = await apiClient.admin.performProductAction("UPDATE", updatedProduct);

    if (!apiRes.success) {
      toast.error(apiRes.error || "Access Denied");
      return;
    }

    const updated = productsList.map((p) =>
      p.slug === productSlug ? { ...p, inStock: !p.inStock } : p,
    );
    setProductsList(updated);
    saveStoredProducts(updated);
    setAuditLogs(adminSecurityEngine.getAuditLogs());
    toast.success("Stock status updated");
  };

  const handleSaveProduct = async (updatedFields: Partial<Product>) => {
    const isEdit = !!productToEdit;
    const actionType = isEdit ? "UPDATE" : "CREATE";

    const apiRes = await apiClient.admin.performProductAction(actionType, updatedFields);
    if (!apiRes.success) {
      toast.error(apiRes.error || "Forbidden");
      return;
    }

    if (isEdit) {
      const targetSlug = productToEdit.slug;
      const updated = productsList.map((p) =>
        p.slug === targetSlug || p.sku === productToEdit.sku
          ? ({ ...p, ...updatedFields } as Product)
          : p,
      );
      setProductsList(updated);
      saveStoredProducts(updated);
      toast.success(`Product "${updatedFields.name || productToEdit.name}" updated successfully`);
    } else {
      const generatedSlug =
        updatedFields.slug ||
        (updatedFields.sku
          ? updatedFields.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : `prod-${Date.now()}`);

      const newProd: Product = {
        slug: generatedSlug,
        sku: updatedFields.sku || `SHR-PROD-${Math.floor(100 + Math.random() * 900)}`,
        name: updatedFields.name || "New Wholesale Footwear",
        nameUrdu: updatedFields.nameUrdu || "",
        categorySlug: updatedFields.categorySlug || "men-formal",
        gender: updatedFields.gender || "men",
        material: updatedFields.material || "Full-grain genuine leather",
        soleType: updatedFields.soleType || "Rubber",
        image:
          updatedFields.image ||
          "https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800",
        images:
          updatedFields.images && updatedFields.images.length > 0
            ? updatedFields.images
            : [
                updatedFields.image ||
                  "https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800",
              ],
        video:
          updatedFields.video ||
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        colorVariants: updatedFields.colorVariants || [
          { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 1000 },
          { name: "Tan", hex: "#C4906B", inStock: true, stockUnits: 800 },
        ],
        colors: updatedFields.colors || ["Black", "Tan"],
        sizes: updatedFields.sizes || ["6", "7", "8", "9", "10", "11", "12"],
        moq: updatedFields.moq || 12,
        cartonQty: 12,
        priceTiers: updatedFields.priceTiers || [
          { moq: 12, pricePerPair: 1850, label: "Starter (1-4 Ctns)" },
          { moq: 60, pricePerPair: 1650, label: "Dealer (5-19 Ctns)" },
          { moq: 240, pricePerPair: 1450, label: "Wholesale (20-49 Ctns)" },
          { moq: 600, pricePerPair: 1250, label: "Bulk Master (50+ Ctns)" },
        ],
        leadTimeDays: updatedFields.leadTimeDays || "10–14 days",
        priceLabel: updatedFields.priceLabel || "PKR 1,250–1,850",
        productionCapacity: updatedFields.productionCapacity || "10,000 pairs/month",
        sampleAvailable: updatedFields.sampleAvailable !== false,
        samplePrice: updatedFields.samplePrice || 2500,
        sampleLeadDays: updatedFields.sampleLeadDays || "2–4 days express courier",
        sampleRefundable: updatedFields.sampleRefundable !== false,
        customization: updatedFields.customization || [
          "Custom Branding Embossing",
          "Color Dye Matching",
          "Custom Inner Sole",
        ],
        inStock: updatedFields.inStock !== false,
        featured: updatedFields.featured !== false,
        bestseller: !!updatedFields.bestseller,
        trending: updatedFields.trending !== false,
        newArrival: updatedFields.newArrival !== false,
        description:
          updatedFields.description ||
          "High quality footwear manufactured to Anamon wholesale standards.",
        specifications: updatedFields.specifications || {
          "Upper Material": updatedFields.material || "Genuine Leather",
          "Sole Material": updatedFields.soleType || "Rubber",
          "Minimum Order": `${updatedFields.moq || 12} pairs (1 carton)`,
          Packaging: "12 pairs per carton (Single color)",
        },
        shippingInfo:
          updatedFields.shippingInfo ||
          "Shipped in standard cartons of 12 pairs. Single color per carton.",
        reviews: updatedFields.reviews || [],
        stats: updatedFields.stats || {
          unitsSold: 0,
          ordersCompleted: 0,
          activeBuyers: 0,
          repeatPurchasePct: 100,
        },
      };
      const updated = [newProd, ...productsList.filter((p) => p.slug !== newProd.slug)];
      setProductsList(updated);
      saveStoredProducts(updated);
      toast.success(`New product "${newProd.name}" created and published!`);
    }

    setAuditLogs(adminSecurityEngine.getAuditLogs());
  };

  // ━━━━━━ 1. CLEAN MINIMAL ENTERPRISE AUTHENTICATION GATEWAY ━━━━━━
  if (!session) {
    const isLocked = lockoutState.lockedUntil && Date.now() < lockoutState.lockedUntil;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm space-y-6 relative z-10">
          {/* Logo & Clean Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 mb-1">
              <Shield className="h-6 w-6 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Anamon Admin Portal</h1>
            <p className="text-xs text-slate-400">
              Sign in to access your administration workspace
            </p>
          </div>

          {/* Rate Limiter Lock Alert */}
          {isLocked ? (
            <Card className="border-rose-500/30 bg-rose-500/10 p-5 text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto" />
              <h2 className="text-sm font-bold text-rose-300">Account Temporarily Locked</h2>
              <p className="text-xs text-slate-300">
                Too many failed attempts. Please try again in 15 minutes.
              </p>
            </Card>
          ) : (
            <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl">
              {loginStep === "CREDENTIALS" && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="name@company.com"
                        className="pl-9 bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info("Password reset instructions sent if account exists");
                        }}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 pr-10 bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-10 shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    Sign In
                  </Button>

                  {/* BUG-02 FIX: "Direct Master Admin Quick Login" backdoor button removed.
                      It granted zero-credential admin access to any visitor and must
                      never exist in production code. */}
                </form>
              )}

              {loginStep === "2FA_OTP" && (
                <form onSubmit={handle2faSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-sm font-bold text-slate-100">Two-Step Verification</h2>
                    <p className="text-xs text-slate-400">
                      Enter the 6-digit verification code sent to your device
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="092841"
                      className="text-center font-mono text-xl tracking-[0.4em] bg-slate-950 border-slate-800 text-amber-400 focus:border-amber-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-10 shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    Verify Code
                  </Button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setLoginStep("CREDENTIALS")}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // BUG-01b FIX: Resend never leaks the OTP code in the toast.
                        adminSecurityEngine.generateDynamicOtp(emailInput || MASTER_ADMIN_EMAIL);
                        toast.success(
                          `Resent verification code to ${emailInput || MASTER_ADMIN_EMAIL}`,
                          {
                            description: "Check your authenticator app or registered email.",
                            duration: 6000,
                          },
                        );
                      }}
                      className="text-amber-400 hover:underline font-medium cursor-pointer"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              )}

              {loginStep === "RECOVERY" && (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-sm font-bold text-slate-100">Emergency Recovery</h2>
                    <p className="text-xs text-slate-400">Enter your backup recovery code</p>
                  </div>

                  <div className="space-y-1.5">
                    <Input
                      type="text"
                      value={recoveryCodeInput}
                      onChange={(e) => setRecoveryCodeInput(e.target.value)}
                      placeholder="SHER-XXXX-XXXX"
                      className="font-mono text-center bg-slate-950 border-slate-800 text-amber-400"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLoginStep("2FA_OTP")}
                      className="border-slate-800 text-slate-400 text-xs h-10"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-amber-500 text-slate-950 font-bold text-xs h-10"
                    >
                      Verify
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}

          <div className="text-center text-[11px] text-slate-600">
            Protected by Anamon Enterprise Identity
          </div>
        </div>
      </div>
    );
  }

  // ━━━━━━ 2. AUTHORIZED PRODUCTION WORKSPACE ━━━━━━
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Controls */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-black text-lg tracking-wider">
            ANAMON
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Marketplace Admin Console
            </h1>
            <p className="text-xs text-slate-400">Catalog Management & Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Admin</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAdminLogout}
            className="border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900 text-xs h-9 gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Control Plane Body */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 space-y-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Core Modules
            </p>

            <SidebarItem
              icon={Package}
              label="Product Management"
              id="products"
              active={activeTab}
              onClick={setActiveTab}
              badge={productsList.length}
            />
            <SidebarItem
              icon={PackageCheck}
              label="Product Samples"
              id="samples"
              active={activeTab}
              onClick={setActiveTab}
              badge={
                samplesList.filter((s) => ["REQUESTED", "PREPARING"].includes(s.status)).length
              }
            />
            <SidebarItem
              icon={LayoutDashboard}
              label="Overview & GMV"
              id="overview"
              active={activeTab}
              onClick={setActiveTab}
            />
            <SidebarItem
              icon={Building2}
              label="Suppliers Queue"
              id="suppliers"
              active={activeTab}
              onClick={setActiveTab}
              badge={suppliers.filter((s) => s.status === "PENDING").length}
            />
            <SidebarItem
              icon={ShoppingBag}
              label="Orders & Bilti"
              id="orders"
              active={activeTab}
              onClick={setActiveTab}
              badge={ordersList.length}
            />
            <SidebarItem
              icon={CreditCard}
              label="Escrow & Payments"
              id="payments"
              active={activeTab}
              onClick={setActiveTab}
            />
            <SidebarItem
              icon={ShieldAlert}
              label="Disputes Center"
              id="disputes"
              active={activeTab}
              onClick={setActiveTab}
              badge={disputes.filter((d) => d.status === "OPEN").length}
            />

            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">
              Governance & Audit
            </p>
            <SidebarItem
              icon={History}
              label="Audit Trail Logs"
              id="audit"
              active={activeTab}
              onClick={setActiveTab}
              badge={auditLogs.length}
            />
            <SidebarItem
              icon={Activity}
              label="System Health"
              id="health"
              active={activeTab}
              onClick={setActiveTab}
            />
            <SidebarItem
              icon={Settings}
              label="Platform Settings"
              id="settings"
              active={activeTab}
              onClick={setActiveTab}
            />
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-medium">Session Status</div>
            <p className="text-[11px] text-emerald-400 font-bold">Secure Session Active</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
          {/* TAB 1: PRODUCT MANAGEMENT CRUD TAB */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Product Management & Catalog Operations
                  </h2>
                  <p className="text-xs text-slate-400">
                    Create, edit, delete, set volume prices, MOQ rules, color/size runs, and
                    promotional badges
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to reset all products to factory defaults? Any custom product pictures or edits will be restored to initial state.",
                        )
                      ) {
                        const defs = resetStoredProducts();
                        setProductsList(defs);
                        toast.success("Products reset to factory catalog defaults");
                      }
                    }}
                    className="border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-amber-400 text-xs h-9"
                    title="Reset to factory catalog defaults"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset Catalog Defaults
                  </Button>
                </div>
              </div>

              <AdminProductTable
                products={productsList}
                onEditProduct={handleOpenEditModal}
                onDeleteProduct={handleDeleteProduct}
                onToggleStatus={handleToggleStockStatus}
                onAddNewClick={handleOpenAddModal}
              />
            </div>
          )}

          {/* TAB 2: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    Marketplace Executive Overview
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live transaction volume, platform commission, and operational queue KPIs
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-800 gap-2"
                  onClick={() => toast.info("Refreshing telemetry...")}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  title="Total Marketplace GMV"
                  value="PKR 45,800,000"
                  change="+18.4%"
                  icon={BarChart3}
                  color="amber"
                />
                <KpiCard
                  title="Platform Commission (3%)"
                  value="PKR 1,374,000"
                  change="+14.2%"
                  icon={CreditCard}
                  color="emerald"
                />
                <KpiCard
                  title="Active Catalog Items"
                  value={`${productsList.length} Products`}
                  change="Live in Catalog"
                  icon={Package}
                  color="amber"
                />
                <KpiCard
                  title="Verified Factories"
                  value={`${suppliers.filter((s) => s.status === "VERIFIED").length} Active`}
                  change="98% Uptime"
                  icon={ShieldCheck}
                  color="blue"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-100">
                      GMV & Platform Revenue Trend (7 Days)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Gross Merchandise Value vs 3% Platform Earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={GMV_TREND_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            color: "#f8fafc",
                          }}
                        />
                        <Bar dataKey="gmv" name="GMV (PKR)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar
                          dataKey="revenue"
                          name="Revenue (PKR)"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-100">Category GMV Share</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Footwear volume distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={CATEGORY_SHARE_DATA}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label
                        >
                          {CATEGORY_SHARE_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-xs text-slate-400 text-center font-medium">
                      Formal Leather leads with 42% market share
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: IMMUTABLE AUDIT TRAIL LOGS TAB */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-amber-400" /> Immutable Audit Trail Logs
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cryptographically append-only audit trail recording every admin operation with
                    Request ID & User Agent
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportAuditLogs}
                    className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs h-9 gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5 text-amber-400" /> Export Audit CSV
                  </Button>
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono">
                    {auditLogs.length} Records Logged
                  </Badge>
                </div>
              </div>

              <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900 border-b border-slate-800">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400 text-xs">
                        Request ID & Timestamp
                      </TableHead>
                      <TableHead className="text-slate-400 text-xs">Admin Email & Role</TableHead>
                      <TableHead className="text-slate-400 text-xs">Action Executed</TableHead>
                      <TableHead className="text-slate-400 text-xs">Target Resource</TableHead>
                      <TableHead className="text-slate-400 text-xs">IP & User Agent</TableHead>
                      <TableHead className="text-slate-400 text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {auditLogsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-slate-800/60">
                          {Array.from({ length: 6 }).map((__, j) => (
                            <TableCell key={j}>
                              <div className="h-3 bg-slate-800 rounded animate-pulse w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-10 text-xs">
                          No audit logs yet. Actions you take will appear here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="border-slate-800/60 hover:bg-slate-900/80"
                        >
                          <TableCell>
                            <div className="font-bold text-amber-400">{log.requestId}</div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-slate-200 font-bold">{log.adminEmail}</div>
                            <Badge
                              variant="outline"
                              className="text-[9px] border-slate-800 bg-slate-950 text-slate-400"
                            >
                              {log.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-slate-100">{log.action}</span>
                            {log.details && (
                              <span className="text-[10px] text-slate-400 block font-sans">
                                {log.details}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300">{log.target}</TableCell>
                          <TableCell className="text-slate-400 text-[10px]">
                            <div>{log.ipAddress}</div>
                            <div className="text-[9px] text-slate-500 truncate max-w-[140px]">
                              {log.userAgent}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {log.status === "SUCCESS" && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                SUCCESS
                              </Badge>
                            )}
                            {log.status === "DENIED" && (
                              <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]">
                                DENIED
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* SUPPLIERS TAB (Full CRUD) */}
          {activeTab === "suppliers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-400" /> Supplier Syndicate & Factory
                    Queue
                  </h2>
                  <p className="text-xs text-slate-400">
                    KYC verification, capacity monitoring, and factory syndicate management
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddSupplierOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Syndicate Factory
                </Button>
              </div>

              {/* Add Supplier Modal */}
              {isAddSupplierOpen && (
                <Card className="border-amber-500/30 bg-slate-900/90 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-100">
                      Register New Syndicate Manufacturer
                    </h3>
                    <button
                      onClick={() => setIsAddSupplierOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Factory / Workshop Name
                      </label>
                      <Input
                        value={newFactoryName}
                        onChange={(e) => setNewFactoryName(e.target.value)}
                        placeholder="e.g. Gujranwala Sole Masters"
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Industrial City
                      </label>
                      <select
                        value={newFactoryCity}
                        onChange={(e) => setNewFactoryCity(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Gujranwala">Gujranwala</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Peshawar">Peshawar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        NTN / STRN Number
                      </label>
                      <Input
                        value={newFactoryNtn}
                        onChange={(e) => setNewFactoryNtn(e.target.value)}
                        placeholder="e.g. 8831920-4"
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Monthly Capacity
                      </label>
                      <Input
                        value={newFactoryCapacity}
                        onChange={(e) => setNewFactoryCapacity(e.target.value)}
                        placeholder="e.g. 20,000 Pairs/Mo"
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddSupplierOpen(false)}
                      className="text-xs border-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!newFactoryName.trim()) {
                          toast.error("Factory name is required");
                          return;
                        }
                        const newSup = {
                          id: `SUPP-${Math.floor(100 + Math.random() * 900)}`,
                          factoryName: newFactoryName.trim(),
                          city: newFactoryCity,
                          ntn: newFactoryNtn.trim() || "Pending-FBR",
                          capacity: newFactoryCapacity || "10,000 Pairs/Mo",
                          status: "VERIFIED",
                          badge: "Gold Factory",
                          joinedAt: new Date().toISOString().split("T")[0],
                        };
                        setSuppliers((prev) => [newSup, ...prev]);
                        setIsAddSupplierOpen(false);
                        setNewFactoryName("");
                        setNewFactoryNtn("");
                        toast.success(`Registered supplier: ${newSup.factoryName}`);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                    >
                      Save & Verify Factory
                    </Button>
                  </div>
                </Card>
              )}

              <Card className="border-slate-800 bg-slate-900/50 p-6 overflow-hidden">
                <div className="space-y-4">
                  {suppliers.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950 gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-100 text-sm">{s.factoryName}</div>
                          <span className="text-[10px] font-mono bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800">
                            {s.id}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          City: <span className="text-slate-200">{s.city}</span> • NTN:{" "}
                          <span className="text-slate-200">{s.ntn}</span> • Capacity:{" "}
                          <span className="text-slate-200">{s.capacity}</span> • Joined:{" "}
                          <span className="text-slate-400">{s.joinedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        <Badge
                          className={
                            s.status === "VERIFIED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : s.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }
                        >
                          {s.status}
                        </Badge>
                        {s.status !== "VERIFIED" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSuppliers((prev) =>
                                prev.map((x) => (x.id === s.id ? { ...x, status: "VERIFIED" } : x)),
                              );
                              toast.success(`Factory ${s.factoryName} verified and approved`);
                            }}
                            className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Approve
                          </Button>
                        )}
                        {s.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSuppliers((prev) =>
                                prev.map((x) => (x.id === s.id ? { ...x, status: "REJECTED" } : x)),
                              );
                              toast.error(`Factory ${s.factoryName} suspended`);
                            }}
                            className="h-7 text-[10px] border-slate-800 text-rose-400 hover:bg-rose-500/10"
                          >
                            Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
                            toast.success(`Removed factory: ${s.factoryName}`);
                          }}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ORDERS TAB (Full CRUD) */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-amber-400" /> Wholesale Orders & Bilti
                    Logistics
                  </h2>
                  <p className="text-xs text-slate-400">
                    Order processing, carrier bilti consignment tracking, and dispatch status
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddOrderOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Create Wholesale Order
                </Button>
              </div>

              {/* Add Order Dialog */}
              {isAddOrderOpen && (
                <Card className="border-amber-500/30 bg-slate-900/90 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-100">
                      Create Manual Wholesale Order
                    </h3>
                    <button
                      onClick={() => setIsAddOrderOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Buyer / Retailer Name
                      </label>
                      <Input
                        value={newOrderBuyer}
                        onChange={(e) => setNewOrderBuyer(e.target.value)}
                        placeholder="e.g. Lahore Shoes Mart"
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Quantity & Cartons
                      </label>
                      <Input
                        value={newOrderItems}
                        onChange={(e) => setNewOrderItems(e.target.value)}
                        placeholder="e.g. 72 pairs (6 ctns)"
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Order Amount
                      </label>
                      <Input
                        value={newOrderAmount}
                        onChange={(e) => setNewOrderAmount(e.target.value)}
                        placeholder="e.g. PKR 111,000"
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Bilti Consignment No.
                      </label>
                      <Input
                        value={newOrderBilti}
                        onChange={(e) => setNewOrderBilti(e.target.value)}
                        placeholder="e.g. LHR-BLT-5012"
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddOrderOpen(false)}
                      className="text-xs border-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!newOrderBuyer.trim()) {
                          toast.error("Buyer name is required");
                          return;
                        }
                        const newOrd = {
                          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                          buyer: newOrderBuyer.trim(),
                          amount: newOrderAmount || "PKR 100,000",
                          items: newOrderItems || "48 pairs (4 ctns)",
                          biltiNo:
                            newOrderBilti.trim() ||
                            `PK-BLT-${Math.floor(1000 + Math.random() * 9000)}`,
                          status: "PROCESSING",
                        };
                        setOrdersList((prev) => [newOrd, ...prev]);
                        setIsAddOrderOpen(false);
                        setNewOrderBuyer("");
                        setNewOrderBilti("");
                        toast.success(`Created wholesale order ${newOrd.id}`);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                    >
                      Create Order
                    </Button>
                  </div>
                </Card>
              )}

              <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900 border-b border-slate-800">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Order ID & Buyer</TableHead>
                      <TableHead className="text-slate-400">Quantity & Volume</TableHead>
                      <TableHead className="text-slate-400">Bilti Tracking No.</TableHead>
                      <TableHead className="text-slate-400">Total Price</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersList.map((ord) => (
                      <TableRow key={ord.id} className="border-slate-800">
                        <TableCell className="font-bold text-slate-200">
                          <div>{ord.buyer}</div>
                          <div className="font-mono text-[10px] text-slate-500">{ord.id}</div>
                        </TableCell>
                        <TableCell className="text-slate-300 text-xs">{ord.items}</TableCell>
                        <TableCell className="text-amber-400 font-mono text-xs">
                          {ord.biltiNo}
                        </TableCell>
                        <TableCell className="text-emerald-400 font-bold text-xs">
                          {ord.amount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ord.status === "DELIVERED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                                : ord.status === "DISPATCHED"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                            }
                          >
                            {ord.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === "PROCESSING" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setOrdersList((prev) =>
                                    prev.map((x) =>
                                      x.id === ord.id ? { ...x, status: "DISPATCHED" } : x,
                                    ),
                                  );
                                  toast.success(`Order ${ord.id} marked as DISPATCHED`);
                                }}
                                className="h-6 text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/40 px-2"
                              >
                                Dispatch
                              </Button>
                            )}
                            {ord.status === "DISPATCHED" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setOrdersList((prev) =>
                                    prev.map((x) =>
                                      x.id === ord.id ? { ...x, status: "DELIVERED" } : x,
                                    ),
                                  );
                                  toast.success(`Order ${ord.id} marked as DELIVERED`);
                                }}
                                className="h-6 text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/40 px-2"
                              >
                                Mark Delivered
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setOrdersList((prev) => prev.filter((x) => x.id !== ord.id));
                                toast.success(`Deleted order ${ord.id}`);
                              }}
                              className="h-6 w-6 p-0 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* TAB: PAYMENTS & ESCROW (Full CRUD) */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-amber-400" /> Escrow & Payments Management
                  </h2>
                  <p className="text-xs text-slate-400">
                    Wholesale transaction escrow, fund releases and settlement requests
                  </p>
                </div>
              </div>

              {/* Escrow KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                  title="Total Funds Held"
                  value={`PKR ${escrowList.filter((e) => e.status === "HELD").length * 50000 + 55000}`}
                  change={`${escrowList.filter((e) => e.status === "HELD").length} active holds`}
                  icon={Shield}
                  color="amber"
                />
                <KpiCard
                  title="Released This Month"
                  value={`PKR ${escrowList.filter((e) => e.status === "RELEASED").length * 88800}`}
                  change={`${escrowList.filter((e) => e.status === "RELEASED").length} transactions`}
                  icon={CheckCircle2}
                  color="emerald"
                />
                <KpiCard
                  title="In Dispute"
                  value={`PKR ${escrowList.filter((e) => e.status === "IN_DISPUTE").length * 310000}`}
                  change={`${escrowList.filter((e) => e.status === "IN_DISPUTE").length} dispute open`}
                  icon={AlertTriangle}
                  color="amber"
                />
              </div>

              <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900 border-b border-slate-800">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400 text-xs">Escrow ID</TableHead>
                      <TableHead className="text-slate-400 text-xs">Order & Parties</TableHead>
                      <TableHead className="text-slate-400 text-xs">Order Amount</TableHead>
                      <TableHead className="text-slate-400 text-xs">Platform Fee Held</TableHead>
                      <TableHead className="text-slate-400 text-xs">Date</TableHead>
                      <TableHead className="text-slate-400 text-xs text-right">
                        Status & Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-800/60">
                    {escrowList.map((tx) => (
                      <TableRow key={tx.id} className="border-slate-800/60 hover:bg-slate-900/80">
                        <TableCell className="font-mono text-amber-400 text-xs">{tx.id}</TableCell>
                        <TableCell>
                          <div className="text-xs font-bold text-slate-100">{tx.orderId}</div>
                          <div className="text-[10px] text-slate-400">
                            {tx.buyer} → {tx.supplier}
                          </div>
                        </TableCell>
                        <TableCell className="text-emerald-400 font-bold text-xs font-mono">
                          {tx.amount}
                        </TableCell>
                        <TableCell className="text-amber-400 text-xs font-mono">
                          {tx.held}
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs">{tx.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Badge
                              className={
                                tx.status === "HELD"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                                  : tx.status === "RELEASED"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]"
                              }
                            >
                              {tx.status}
                            </Badge>
                            {tx.status === "HELD" && (
                              <Button
                                size="sm"
                                className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 font-bold"
                                onClick={() => {
                                  setEscrowList((prev) =>
                                    prev.map((x) =>
                                      x.id === tx.id ? { ...x, status: "RELEASED" } : x,
                                    ),
                                  );
                                  toast.success(`Funds released to manufacturer for ${tx.id}`);
                                }}
                              >
                                Release
                              </Button>
                            )}
                            {tx.status === "IN_DISPUTE" && (
                              <Button
                                size="sm"
                                className="h-7 text-[10px] bg-rose-600 hover:bg-rose-700 text-white px-2.5 font-bold"
                                onClick={() => {
                                  setEscrowList((prev) =>
                                    prev.map((x) =>
                                      x.id === tx.id ? { ...x, status: "RELEASED" } : x,
                                    ),
                                  );
                                  toast.success(`Dispute settled: refunded to buyer for ${tx.id}`);
                                }}
                              >
                                Settle Refund
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* TAB: DISPUTES CENTER (Full CRUD) */}
          {activeTab === "disputes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <MessageSquareWarning className="h-5 w-5 text-rose-400" /> Disputes &
                    Arbitration Queue
                  </h2>
                  <p className="text-xs text-slate-400">
                    Buyer-supplier dispute resolution and trade arbitration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                  title="Open Disputes"
                  value={`${disputes.filter((d) => d.status === "OPEN").length}`}
                  change="Requires attention"
                  icon={AlertCircle}
                  color="amber"
                />
                <KpiCard
                  title="In Review"
                  value={`${disputes.filter((d) => d.status === "IN_REVIEW").length}`}
                  change="Being investigated"
                  icon={Scale}
                  color="amber"
                />
                <KpiCard
                  title="Resolved"
                  value={`${disputes.filter((d) => d.status === "RESOLVED").length}`}
                  change="This period"
                  icon={CheckCircle2}
                  color="emerald"
                />
              </div>

              <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900 border-b border-slate-800">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400 text-xs">Dispute</TableHead>
                      <TableHead className="text-slate-400 text-xs">Parties</TableHead>
                      <TableHead className="text-slate-400 text-xs">Amount at Risk</TableHead>
                      <TableHead className="text-slate-400 text-xs">Reason</TableHead>
                      <TableHead className="text-slate-400 text-xs">Opened</TableHead>
                      <TableHead className="text-slate-400 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-800/60">
                    {disputes.map((d) => (
                      <TableRow key={d.id} className="border-slate-800/60 hover:bg-slate-900/80">
                        <TableCell>
                          <div className="font-mono text-amber-400 text-xs">{d.id}</div>
                          <div className="text-[10px] text-slate-400">{d.orderId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-200">{d.buyer}</div>
                          <div className="text-[10px] text-slate-500">vs {d.supplier}</div>
                        </TableCell>
                        <TableCell className="text-rose-400 font-bold text-xs font-mono">
                          {d.amount}
                        </TableCell>
                        <TableCell
                          className="text-slate-300 text-xs max-w-[200px] truncate"
                          title={d.reason}
                        >
                          {d.reason}
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs">{d.opened}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Badge
                              className={
                                d.status === "OPEN"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]"
                                  : d.status === "IN_REVIEW"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                              }
                            >
                              {d.status}
                            </Badge>
                            {d.status !== "RESOLVED" && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/40 px-2"
                                  onClick={() => {
                                    setDisputes((prev) =>
                                      prev.map((x) =>
                                        x.id === d.id ? { ...x, status: "RESOLVED" } : x,
                                      ),
                                    );
                                    toast.success(`Dispute ${d.id} resolved`);
                                  }}
                                >
                                  Resolve
                                </Button>
                                {d.status === "OPEN" && (
                                  <Button
                                    size="sm"
                                    className="h-6 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/40 px-2"
                                    onClick={() => {
                                      setDisputes((prev) =>
                                        prev.map((x) =>
                                          x.id === d.id ? { ...x, status: "IN_REVIEW" } : x,
                                        ),
                                      );
                                      toast.info(`Dispute ${d.id} marked as in review`);
                                    }}
                                  >
                                    Review
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* TAB: PRODUCT SAMPLES MANAGEMENT (Full CRUD) */}
          {activeTab === "samples" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-amber-400" /> Product Samples Management
                  </h2>
                  <p className="text-xs text-slate-400">
                    Process single-pair sample inspection requests, courier dispatch tracking, and
                    bulk conversion analytics
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddSampleOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Record Sample Dispatch
                </Button>
              </div>

              {/* Sample Metrics KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-slate-800 bg-slate-900/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Samples
                  </div>
                  <div className="text-2xl font-black text-slate-100 mt-1">
                    {samplesList.length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Inspection requests</div>
                </Card>
                <Card className="border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    In Preparation
                  </div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {
                      samplesList.filter((s) => ["REQUESTED", "PREPARING"].includes(s.status))
                        .length
                    }
                  </div>
                  <div className="text-[10px] text-amber-400/70 mt-1">
                    Awaiting factory dispatch
                  </div>
                </Card>
                <Card className="border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    In Transit
                  </div>
                  <div className="text-2xl font-black text-blue-400 mt-1">
                    {samplesList.filter((s) => s.status === "DISPATCHED").length}
                  </div>
                  <div className="text-[10px] text-blue-400/70 mt-1">Courier tracking active</div>
                </Card>
                <Card className="border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Converted to Bulk
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {samplesList.filter((s) => s.status === "CONVERTED_TO_BULK").length}
                  </div>
                  <div className="text-[10px] text-emerald-400/70 mt-1">
                    {samplesList.length > 0
                      ? `${Math.round((samplesList.filter((s) => s.status === "CONVERTED_TO_BULK").length / samplesList.length) * 100)}% conversion rate`
                      : "0%"}
                  </div>
                </Card>
              </div>

              {/* Add New Sample Request Modal / Card */}
              {isAddSampleOpen && (
                <Card className="border-amber-500/40 bg-slate-900/95 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-slate-100">
                        Record New Sample Pair Dispatch
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsAddSampleOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Buyer / Retailer Name *
                      </label>
                      <Input
                        value={newSampleBuyer}
                        onChange={(e) => setNewSampleBuyer(e.target.value)}
                        placeholder="e.g. Royal Footwear Boutique"
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        WhatsApp / Phone *
                      </label>
                      <Input
                        value={newSamplePhone}
                        onChange={(e) => setNewSamplePhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="bg-slate-950 border-slate-800 text-xs font-mono text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Destination City *
                      </label>
                      <select
                        value={newSampleCity}
                        onChange={(e) => setNewSampleCity(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Quetta">Quetta</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Gujranwala">Gujranwala</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Select Footwear Model *
                      </label>
                      <select
                        value={newSampleSku}
                        onChange={(e) => {
                          setNewSampleSku(e.target.value);
                          const prod = productsList.find((p) => p.sku === e.target.value);
                          if (prod && prod.colorVariants?.[0]) {
                            setNewSampleColor(prod.colorVariants[0].name);
                          }
                        }}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                      >
                        {productsList.map((p) => (
                          <option key={p.sku} value={p.sku}>
                            {p.sku} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Color Variant
                      </label>
                      <Input
                        value={newSampleColor}
                        onChange={(e) => setNewSampleColor(e.target.value)}
                        placeholder="e.g. Tan / Black / Dark Brown"
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Sample Shoe Size
                      </label>
                      <select
                        value={newSampleSize}
                        onChange={(e) => setNewSampleSize(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none font-mono"
                      >
                        {["6", "7", "8", "9", "10", "11", "12"].map((sz) => (
                          <option key={sz} value={sz}>
                            Size EU {sz} (UK {sz})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Courier Service
                      </label>
                      <select
                        value={newSampleCourier}
                        onChange={(e) => setNewSampleCourier(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="TCS Express">TCS Express</option>
                        <option value="Leopard Courier">Leopard Courier</option>
                        <option value="M&P Express">M&P Express</option>
                        <option value="Trax Logistics">Trax Logistics</option>
                        <option value="Call Courier">Call Courier</option>
                        <option value="Factory Direct Pickup">Factory Direct Pickup</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Courier Tracking ID
                      </label>
                      <Input
                        value={newSampleTracking}
                        onChange={(e) => setNewSampleTracking(e.target.value)}
                        placeholder="e.g. TCS-8829104"
                        className="bg-slate-950 border-slate-800 text-xs font-mono text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Sample Fee (PKR)
                      </label>
                      <Input
                        type="number"
                        value={newSampleFee}
                        onChange={(e) => setNewSampleFee(parseInt(e.target.value, 10) || 0)}
                        placeholder="2500"
                        className="bg-slate-950 border-slate-800 text-xs font-mono font-bold text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Payment Status
                      </label>
                      <select
                        value={newSamplePayment}
                        onChange={(e) => setNewSamplePayment(e.target.value as any)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="PAID">Paid (Fee Received)</option>
                        <option value="PENDING_FEE">Pending Sample Fee</option>
                        <option value="WAIVED_VIP">Waived (VIP Buyer / Partner)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Sample Notes / Custom Requests
                      </label>
                      <Input
                        value={newSampleNotes}
                        onChange={(e) => setNewSampleNotes(e.target.value)}
                        placeholder="e.g. Inspecting leather softness and sole grip"
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddSampleOpen(false)}
                      className="text-xs border-slate-800 text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!newSampleBuyer.trim()) {
                          toast.error("Buyer name is required");
                          return;
                        }
                        const prod = productsList.find((p) => p.sku === newSampleSku);
                        const newSample: ProductSample = {
                          id: `SMP-${Math.floor(1000 + Math.random() * 9000)}`,
                          buyerName: newSampleBuyer.trim(),
                          buyerPhone: newSamplePhone.trim(),
                          buyerCity: newSampleCity,
                          productSku: newSampleSku,
                          productName: prod ? prod.name : "Custom Footwear Sample",
                          color: newSampleColor || "Standard",
                          size: newSampleSize || "9",
                          courier: newSampleCourier,
                          trackingNo: newSampleTracking.trim() || "Pending Dispatch",
                          sampleFee: newSampleFee || 2500,
                          paymentStatus: newSamplePayment,
                          status: newSampleTracking.trim() ? "DISPATCHED" : "PREPARING",
                          requestedDate: new Date().toISOString().split("T")[0],
                          notes: newSampleNotes.trim() || undefined,
                        };
                        setSamplesList((prev) => [newSample, ...prev]);
                        setIsAddSampleOpen(false);
                        setNewSampleBuyer("");
                        setNewSampleTracking("");
                        setNewSampleNotes("");
                        toast.success(
                          `Registered sample dispatch ${newSample.id} for ${newSample.buyerName}`,
                        );
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                    >
                      Save Sample Dispatch
                    </Button>
                  </div>
                </Card>
              )}

              {/* Edit Tracking Modal */}
              {editingSample && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-slate-100">
                        Update Tracking: {editingSample.id} ({editingSample.buyerName})
                      </h3>
                      <button
                        onClick={() => setEditingSample(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Courier Carrier
                        </label>
                        <select
                          value={editCourier}
                          onChange={(e) => setEditCourier(e.target.value)}
                          className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100"
                        >
                          <option value="TCS Express">TCS Express</option>
                          <option value="Leopard Courier">Leopard Courier</option>
                          <option value="M&P Express">M&P Express</option>
                          <option value="Trax Logistics">Trax Logistics</option>
                          <option value="Call Courier">Call Courier</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Consignment Tracking Number
                        </label>
                        <Input
                          value={editTrackingNo}
                          onChange={(e) => setEditTrackingNo(e.target.value)}
                          placeholder="e.g. TCS-9948123"
                          className="bg-slate-950 border-slate-800 text-xs font-mono text-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSample(null)}
                        className="text-xs border-slate-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!editTrackingNo.trim()) {
                            toast.error("Please enter a tracking number");
                            return;
                          }
                          setSamplesList((prev) =>
                            prev.map((s) =>
                              s.id === editingSample.id
                                ? {
                                    ...s,
                                    trackingNo: editTrackingNo.trim(),
                                    courier: editCourier,
                                    status: "DISPATCHED",
                                  }
                                : s,
                            ),
                          );
                          toast.success(
                            `Updated tracking for ${editingSample.id} and marked as DISPATCHED`,
                          );
                          setEditingSample(null);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                      >
                        Update & Dispatch
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={sampleSearch}
                    onChange={(e) => setSampleSearch(e.target.value)}
                    placeholder="Search by buyer, city, SKU, tracking..."
                    className="pl-9 bg-slate-900 border-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    "ALL",
                    "REQUESTED",
                    "PREPARING",
                    "DISPATCHED",
                    "DELIVERED",
                    "CONVERTED_TO_BULK",
                  ].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSampleFilter(st)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                        sampleFilter === st
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {st === "ALL" ? "All Samples" : st.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Samples Table */}
              <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900 border-b border-slate-800">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400 text-xs">Sample ID & Date</TableHead>
                      <TableHead className="text-slate-400 text-xs">Buyer & City</TableHead>
                      <TableHead className="text-slate-400 text-xs">
                        Footwear Model & Spec
                      </TableHead>
                      <TableHead className="text-slate-400 text-xs">Courier & Tracking</TableHead>
                      <TableHead className="text-slate-400 text-xs">Fee & Payment</TableHead>
                      <TableHead className="text-slate-400 text-xs">Status</TableHead>
                      <TableHead className="text-slate-400 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-800/60">
                    {samplesList
                      .filter((s) => {
                        if (sampleFilter !== "ALL" && s.status !== sampleFilter) return false;
                        if (!sampleSearch) return true;
                        const query = sampleSearch.toLowerCase();
                        return (
                          s.id.toLowerCase().includes(query) ||
                          s.buyerName.toLowerCase().includes(query) ||
                          s.buyerCity.toLowerCase().includes(query) ||
                          s.productSku.toLowerCase().includes(query) ||
                          s.productName.toLowerCase().includes(query) ||
                          s.trackingNo.toLowerCase().includes(query)
                        );
                      })
                      .map((sample) => (
                        <TableRow
                          key={sample.id}
                          className="border-slate-800/60 hover:bg-slate-900/80"
                        >
                          <TableCell>
                            <div className="font-mono text-amber-400 font-bold text-xs">
                              {sample.id}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" /> {sample.requestedDate}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs font-bold text-slate-200">
                              {sample.buyerName}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-slate-500" /> {sample.buyerCity}
                              <span className="text-slate-600">•</span>
                              <Phone className="h-3 w-3 text-slate-500" /> {sample.buyerPhone}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs font-semibold text-slate-200">
                              {sample.productName}
                            </div>
                            <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                              SKU: {sample.productSku} • Color: {sample.color} • Size: EU{" "}
                              {sample.size}
                            </div>
                            {sample.notes && (
                              <div
                                className="text-[10px] text-slate-400 italic mt-0.5 max-w-[220px] truncate"
                                title={sample.notes}
                              >
                                Note: {sample.notes}
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="text-xs text-slate-300 font-medium">
                              {sample.courier}
                            </div>
                            <div className="text-[10px] font-mono text-amber-400 mt-0.5 flex items-center gap-1.5">
                              <span>{sample.trackingNo}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSample(sample);
                                  setEditTrackingNo(
                                    sample.trackingNo === "Pending Dispatch"
                                      ? ""
                                      : sample.trackingNo,
                                  );
                                  setEditCourier(sample.courier);
                                }}
                                className="text-slate-500 hover:text-amber-400"
                                title="Edit tracking"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-xs font-bold text-emerald-400 font-mono">
                              PKR {sample.sampleFee.toLocaleString()}
                            </div>
                            <div className="mt-0.5">
                              <Badge
                                className={
                                  sample.paymentStatus === "PAID"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0"
                                    : sample.paymentStatus === "WAIVED_VIP"
                                      ? "bg-purple-500/10 text-purple-400 border-purple-500/30 text-[9px] px-1.5 py-0"
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] px-1.5 py-0"
                                }
                              >
                                {sample.paymentStatus}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={
                                sample.status === "CONVERTED_TO_BULK"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                                  : sample.status === "DELIVERED"
                                    ? "bg-teal-500/10 text-teal-400 border-teal-500/30 text-[10px]"
                                    : sample.status === "DISPATCHED"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]"
                                      : sample.status === "PREPARING"
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]"
                              }
                            >
                              {sample.status.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {sample.status === "REQUESTED" && (
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/40 px-2"
                                  onClick={() => {
                                    setSamplesList((prev) =>
                                      prev.map((s) =>
                                        s.id === sample.id ? { ...s, status: "PREPARING" } : s,
                                      ),
                                    );
                                    toast.success(`Sample ${sample.id} moved to PREPARING`);
                                  }}
                                >
                                  Prepare
                                </Button>
                              )}

                              {sample.status === "PREPARING" && (
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/40 px-2"
                                  onClick={() => {
                                    setEditingSample(sample);
                                    setEditTrackingNo("");
                                    setEditCourier(sample.courier);
                                  }}
                                >
                                  Dispatch
                                </Button>
                              )}

                              {sample.status === "DISPATCHED" && (
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] bg-teal-600/20 text-teal-400 border border-teal-600/30 hover:bg-teal-600/40 px-2"
                                  onClick={() => {
                                    setSamplesList((prev) =>
                                      prev.map((s) =>
                                        s.id === sample.id ? { ...s, status: "DELIVERED" } : s,
                                      ),
                                    );
                                    toast.success(
                                      `Sample ${sample.id} marked as DELIVERED to ${sample.buyerName}`,
                                    );
                                  }}
                                >
                                  Mark Delivered
                                </Button>
                              )}

                              {sample.status === "DELIVERED" && (
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/40 px-2 font-bold"
                                  onClick={() => {
                                    setSamplesList((prev) =>
                                      prev.map((s) =>
                                        s.id === sample.id
                                          ? { ...s, status: "CONVERTED_TO_BULK" }
                                          : s,
                                      ),
                                    );
                                    toast.success(
                                      `🎉 Sample ${sample.id} converted to wholesale bulk order!`,
                                    );
                                  }}
                                >
                                  Convert to Bulk
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSamplesList((prev) => prev.filter((s) => s.id !== sample.id));
                                  toast.success(`Deleted sample record ${sample.id}`);
                                }}
                                className="h-6 w-6 p-0 text-slate-500 hover:text-rose-400"
                                title="Delete sample record"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* TAB: SYSTEM HEALTH */}
          {activeTab === "health" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-emerald-400" /> System Health Monitor
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time service status, latency, and uptime tracking
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-800 gap-2 text-xs"
                  onClick={() => toast.info("Refreshing health checks...")}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
              </div>

              {/* Overall health score */}
              <Card className="border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                    <span className="text-xl font-black text-emerald-400">98</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">Platform Health Score</div>
                    <div className="text-xs text-slate-400">
                      5 of 6 services fully operational — Payment Gateway experiencing elevated
                      latency
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SYSTEM_SERVICES.map((svc) => {
                  const isOperational = svc.status === "OPERATIONAL";
                  const isDegraded = svc.status === "DEGRADED";
                  const SvcIcon = svc.icon;
                  return (
                    <Card
                      key={svc.name}
                      className={`border p-5 ${
                        isOperational
                          ? "border-slate-800 bg-slate-900/50"
                          : isDegraded
                            ? "border-amber-500/30 bg-amber-500/5"
                            : "border-rose-500/30 bg-rose-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-lg ${
                              isOperational
                                ? "bg-slate-950 border border-slate-800"
                                : isDegraded
                                  ? "bg-amber-500/10 border border-amber-500/20"
                                  : "bg-rose-500/10 border border-rose-500/20"
                            }`}
                          >
                            <SvcIcon
                              className={`h-4 w-4 ${
                                isOperational
                                  ? "text-emerald-400"
                                  : isDegraded
                                    ? "text-amber-400"
                                    : "text-rose-400"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-100">{svc.name}</div>
                            <div className="text-[10px] text-slate-500">
                              Checked {svc.lastChecked}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full animate-pulse ${
                              isOperational
                                ? "bg-emerald-400"
                                : isDegraded
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                            }`}
                          />
                          <Badge
                            className={`text-[10px] ${
                              isOperational
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : isDegraded
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {svc.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                            Latency
                          </div>
                          <div
                            className={`font-bold font-mono ${
                              svc.latency < 100
                                ? "text-emerald-400"
                                : svc.latency < 300
                                  ? "text-amber-400"
                                  : "text-rose-400"
                            }`}
                          >
                            {svc.latency}ms
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                            Uptime
                          </div>
                          <div className="font-bold text-slate-100">{svc.uptime}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PLATFORM SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-amber-400" /> Platform Settings
                </h2>
                <p className="text-xs text-slate-400">
                  Commission rates, MOQ rules, feature toggles and notification configuration
                </p>
              </div>

              {/* Commission Rate */}
              <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Banknote className="h-4 w-4 text-amber-400" /> Commission & Fee Structure
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Platform Commission Rate
                    </label>
                    {editingCommission ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          step={0.5}
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 3)}
                          className="w-28 bg-slate-950 border-slate-700 text-amber-400 font-mono font-bold text-lg"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                          onClick={() => {
                            setEditingCommission(false);
                            toast.success(`Commission rate updated to ${commissionRate}%`);
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-400 text-xs h-9"
                          onClick={() => setEditingCommission(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-amber-400 font-mono">
                          {commissionRate}%
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-400 text-xs h-8"
                          onClick={() => setEditingCommission(true)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Applied to every completed wholesale transaction GMV.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      MOQ Rules (Factory Standard)
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { label: "Minimum Order", value: "12 pairs (1 carton)" },
                        { label: "Carton Pack", value: "12 pairs / single colour" },
                        { label: "Order Multiples", value: "12, 24, 36, 48..." },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{r.label}</span>
                          <span className="font-mono font-bold text-slate-100 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                            {r.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Feature Flags */}
              <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Zap className="h-4 w-4 text-amber-400" /> Feature Flags
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(
                    [
                      {
                        key: "escrowProtection",
                        label: "Escrow Protection",
                        desc: "Hold platform fee until buyer confirms delivery",
                      },
                      {
                        key: "rfqSystem",
                        label: "RFQ Negotiation Engine",
                        desc: "Buyers can submit request-for-quote to suppliers",
                      },
                      {
                        key: "biltiTracking",
                        label: "Bilti Tracking",
                        desc: "Real-time logistics tracking via carrier bilti number",
                      },
                      {
                        key: "supplierVerification",
                        label: "Supplier Verification Queue",
                        desc: "Manual KYC review before factory goes live",
                      },
                    ] as const
                  ).map((flag) => {
                    const isOn = featureFlags[flag.key];
                    return (
                      <button
                        key={flag.key}
                        onClick={() => {
                          setFeatureFlags((prev) => ({ ...prev, [flag.key]: !prev[flag.key] }));
                          toast.success(`${flag.label} ${!isOn ? "enabled" : "disabled"}`);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                          isOn
                            ? "border-amber-500/30 bg-amber-500/5"
                            : "border-slate-800 bg-slate-950/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${isOn ? "text-amber-300" : "text-slate-400"}`}
                          >
                            {flag.label}
                          </span>
                          <div
                            className={`relative h-5 w-9 rounded-full transition-colors ${isOn ? "bg-amber-500" : "bg-slate-700"}`}
                          >
                            <div
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0.5"}`}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{flag.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Notification Email */}
              <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Mail className="h-4 w-4 text-amber-400" /> Admin Notification Email
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    defaultValue="anamoontotrade@gmail.com"
                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs max-w-sm"
                    readOnly
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-400 text-xs h-9"
                    onClick={() => toast.info("Contact support to change the master admin email.")}
                  >
                    Change
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  All platform alerts, dispute notifications and settlement requests are sent to
                  this address.
                </p>
              </Card>
            </div>
          )}
        </main>
      </div>

      <ProductManageModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

// Subcomponents
function SidebarItem({ icon: Icon, label, id, active, onClick, badge }: any) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
        isActive
          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isActive ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">{title}</span>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            <Icon className="h-4 w-4 text-amber-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-100 font-mono">{value}</div>
          <span className="text-xs font-semibold text-emerald-400">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
