import { ShieldCheck, Clock, MapPin, Factory, Award, Building, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

type SupplierProps = {
  name?: string;
  location?: string;
  years?: string;
  responseRate?: string;
  responseTime?: string;
  rating?: number;
};

export function SupplierCard({
  name = "Anamon Footwear Pvt. Ltd.",
  location = "Lahore, PK",
  years = "25+ YRS",
  responseRate = "98.5%",
  responseTime = "< 2h",
  rating = 4.9,
}: SupplierProps = {}) {
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden shrink-0 border border-gray-200">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">{name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Verified Manufacturer</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-1 rounded">
          <Award className="w-3 h-3" /> {years}
        </span>
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-[11px] font-medium px-2 py-1 rounded">
          <ShieldCheck className="w-3 h-3" /> Trade Assurance
        </span>
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-medium px-2 py-1 rounded">
          <Factory className="w-3 h-3" /> ISO 9001
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 text-sm border-t border-b border-border py-4">
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Response Rate</span>
          <span className="font-semibold text-gray-900">{responseRate}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Avg. Response Time</span>
          <span className="font-semibold text-gray-900">{responseTime}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Store Rating</span>
          <span className="font-semibold text-gray-900 flex items-center gap-1"><Star className="w-3 h-3 fill-gold text-gold" /> {rating}/5</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs">Location</span>
          <span className="font-semibold text-gray-900 flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/contact" className="w-full text-center py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-orange-600 transition">
          Contact Supplier
        </Link>
        <Link to="/products" search={{ category: undefined, gender: undefined }} className="w-full text-center py-2 text-sm font-semibold text-gray-700 border border-border rounded-md hover:bg-gray-50 transition flex items-center justify-center">
          Visit Store
        </Link>
      </div>
    </div>
  );
}
