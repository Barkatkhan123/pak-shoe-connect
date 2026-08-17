import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Factory,
  Package,
  Building,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero, SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({ sku: z.string().optional() });

export const Route = createFileRoute("/bulk-order")({
  component: BulkOrder,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Bulk Order & Wholesale Quotation — Anamom Footwear" },
      {
        name: "description",
        content:
          "Request a wholesale quotation from Anamom. Bulk orders from 200 to 5,000+ pairs, with private label and custom branding options.",
      },
    ],
  }),
});

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function BulkOrder() {
  const { sku } = Route.useSearch();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessType: "",
    sku: sku || "",
    quantity: "",
    branding: "No",
    name: "",
    company: "",
    phone: "",
    email: "",
    requirements: "",
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Quotation Builder"
        title="Request a bulk wholesale quote."
        description="Build your custom order requirement in 3 simple steps."
      />
      <section className="mx-auto max-w-3xl px-4 py-14">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald/30 bg-cream p-12 text-center premium-shadow"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald/10 text-emerald mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="font-display text-3xl font-semibold">Quotation Requested</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              We received your bulk order request. Your dedicated account manager will respond via
              WhatsApp or Email within 1-2 business hours with pricing and lead times.
            </p>
            <Button className="mt-8" onClick={() => (window.location.href = "/products")}>
              Return to Catalog
            </Button>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 premium-shadow relative overflow-hidden">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <span>Step {step} of 3</span>
                <span>
                  {step === 1 ? "Business Profile" : step === 2 ? "Order Details" : "Contact Info"}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "33%" }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-display text-xl font-semibold mb-4">
                        What type of business are you?
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "Retailer", icon: ShoppingCart },
                          { id: "Wholesaler", icon: Package },
                          { id: "Distributor", icon: Truck },
                          { id: "Brand / OEM", icon: Factory },
                        ].map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => updateForm("businessType", type.id)}
                            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition ${
                              formData.businessType === type.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-background hover:border-primary/40 hover:bg-muted"
                            }`}
                          >
                            <type.icon className="h-8 w-8 mb-3 opacity-80" />
                            <span className="font-medium text-sm">{type.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!formData.businessType}
                        className="gap-2"
                      >
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-semibold mb-4">
                      Order Specifications
                    </h3>

                    <Field label="Product SKU (Optional)">
                      <input
                        value={formData.sku}
                        onChange={(e) => updateForm("sku", e.target.value)}
                        placeholder="e.g. ANM-PSH-101"
                        className={inp}
                      />
                    </Field>

                    <Field label="Estimated Quantity" required>
                      <select
                        required
                        value={formData.quantity}
                        onChange={(e) => updateForm("quantity", e.target.value)}
                        className={inp}
                      >
                        <option value="" disabled>
                          Select volume tier...
                        </option>
                        <option value="50-100">50 - 100 pairs (Minimum)</option>
                        <option value="100-500">100 - 500 pairs</option>
                        <option value="500-1000">500 - 1,000 pairs</option>
                        <option value="1000+">1,000+ pairs</option>
                      </select>
                    </Field>

                    <Field label="Private Label / Custom Branding?">
                      <select
                        value={formData.branding}
                        onChange={(e) => updateForm("branding", e.target.value)}
                        className={inp}
                      >
                        <option value="No">No, standard Anamom packaging</option>
                        <option value="Logo">Yes, custom logo on insole</option>
                        <option value="Full">Yes, full custom (box + tags + insole)</option>
                      </select>
                    </Field>

                    <Field label="Additional Requirements">
                      <textarea
                        rows={3}
                        value={formData.requirements}
                        onChange={(e) => updateForm("requirements", e.target.value)}
                        placeholder="Specific colors, sizes, target price, or delivery deadlines..."
                        className={inp}
                      />
                    </Field>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!formData.quantity}
                        className="gap-2"
                      >
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-semibold mb-4">Contact Details</h3>

                    <Row>
                      <Field label="Company / Shop Name" required>
                        <input
                          required
                          value={formData.company}
                          onChange={(e) => updateForm("company", e.target.value)}
                          className={inp}
                        />
                      </Field>
                      <Field label="Your Full Name" required>
                        <input
                          required
                          value={formData.name}
                          onChange={(e) => updateForm("name", e.target.value)}
                          className={inp}
                        />
                      </Field>
                    </Row>
                    <Row>
                      <Field label="Phone / WhatsApp" required>
                        <input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          placeholder="0300 1234567"
                          className={inp}
                        />
                      </Field>
                      <Field label="Email Address">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="you@company.com"
                          className={inp}
                        />
                      </Field>
                    </Row>

                    <div className="flex justify-between pt-6 border-t border-border mt-8">
                      <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={!formData.company || !formData.name || !formData.phone}
                        className="gap-2 bg-emerald text-white hover:bg-emerald-deep"
                      >
                        Submit Quotation Request <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

const inp =
  "w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>;
}
