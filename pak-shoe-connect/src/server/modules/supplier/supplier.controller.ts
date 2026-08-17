// @ts-ignore
import { Request, Response } from "express";
import { SupplierService } from "./supplier.service";
import {
  SubmitSupplierQuoteSchema,
  UpdateInventorySchema,
  UpdateOrderStatusSchema,
} from "./supplier.schema";

export class SupplierController {
  static async getProfile(req: Request, res: Response) {
    try {
      const supplierId = (req.query.supplierId as string) || "test-factory-sialkot";
      const profile = await SupplierService.getSupplierProfile(supplierId);
      return res.status(200).json({ success: true, profile });
    } catch (error: any) {
      return res.status(404).json({ success: false, error: error.message });
    }
  }

  static async getDashboard(req: Request, res: Response) {
    try {
      const supplierId = (req.query.supplierId as string) || "test-factory-sialkot";
      const dashboard = await SupplierService.getSupplierDashboardMetrics(supplierId);
      return res.status(200).json({ success: true, ...dashboard });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getRfqInbox(req: Request, res: Response) {
    try {
      const supplierId = (req.query.supplierId as string) || "test-factory-sialkot";
      const status = req.query.status as string;
      const rfqs = await SupplierService.getSupplierRfqInbox(supplierId, { status });
      return res.status(200).json({ success: true, rfqs });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async submitQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplierId = (req.body.supplierId as string) || "test-factory-sialkot";
      const input = SubmitSupplierQuoteSchema.parse(req.body);
      const result = await SupplierService.submitQuote(id, supplierId, input);
      return res.status(200).json({ success: true, rfq: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getInventory(req: Request, res: Response) {
    try {
      const supplierId = (req.query.supplierId as string) || "test-factory-sialkot";
      const inventory = await SupplierService.getSupplierInventory(supplierId);
      return res.status(200).json({ success: true, inventory });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateInventory(req: Request, res: Response) {
    try {
      const { sku } = req.params;
      const supplierId = (req.body.supplierId as string) || "test-factory-sialkot";
      const input = UpdateInventorySchema.parse(req.body);
      const updated = await SupplierService.updateSkuInventory(sku, supplierId, input);
      return res.status(200).json({ success: true, sku: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const supplierId = (req.query.supplierId as string) || "test-factory-sialkot";
      const orders = await SupplierService.getSupplierOrders(supplierId);
      return res.status(200).json({ success: true, orders });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplierId = (req.body.supplierId as string) || "test-factory-sialkot";
      const input = UpdateOrderStatusSchema.parse(req.body);
      const updated = await SupplierService.updateOrderStatus(id, supplierId, input);
      return res.status(200).json({ success: true, order: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const supplierId = (req.query.supplierId as string) || "test-factory-sialkot";
      const analytics = await SupplierService.getSupplierAnalytics(supplierId);
      return res.status(200).json({ success: true, analytics });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
