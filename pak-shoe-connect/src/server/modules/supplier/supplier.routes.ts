// @ts-ignore
import { Router } from "express";
import { SupplierController } from "./supplier.controller";

export const supplierRouter = Router();

supplierRouter.get("/profile", SupplierController.getProfile);
supplierRouter.get("/dashboard", SupplierController.getDashboard);
supplierRouter.get("/rfqs", SupplierController.getRfqInbox);
supplierRouter.post("/rfqs/:id/quote", SupplierController.submitQuote);
supplierRouter.get("/inventory", SupplierController.getInventory);
supplierRouter.patch("/inventory/:sku", SupplierController.updateInventory);
supplierRouter.get("/orders", SupplierController.getOrders);
supplierRouter.patch("/orders/:id/status", SupplierController.updateOrderStatus);
supplierRouter.get("/analytics", SupplierController.getAnalytics);
