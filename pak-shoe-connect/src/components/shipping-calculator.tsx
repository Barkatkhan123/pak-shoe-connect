import { useState } from "react";
import { Truck, MapPin, Search } from "lucide-react";

export function ShippingCalculator() {
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("");
  
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-gray-400" />
        Shipping & Logistics
      </h3>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Ship to:</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="UAE">UAE</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Shipping Method:</label>
          <select className="w-full px-3 py-2 text-sm border border-border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
            <option>Express Air (5-7 days) - $125.00</option>
            <option>Standard Air (10-15 days) - $85.00</option>
            <option>Sea Freight (30-45 days) - $25.00</option>
          </select>
        </div>
        
        <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
          <span className="text-gray-600">Est. Delivery:</span>
          <span className="font-semibold text-gray-900">Oct 15 - Oct 17</span>
        </div>
        
        <button className="w-full py-2 text-sm font-semibold text-primary border border-primary rounded-md hover:bg-primary/5 transition">
          Update Shipping Cost
        </button>
      </div>
    </div>
  );
}
