import {
  buildProductPharmaDetailsFormDefaults,
  type ProductPharmaDetails,
} from "@/lib/util/product-pharma"

type ProductPharmaDetailsFieldsProps = {
  details?: ProductPharmaDetails | null
}

export default function ProductPharmaDetailsFields({
  details = null,
}: ProductPharmaDetailsFieldsProps) {
  const defaults = buildProductPharmaDetailsFormDefaults(details)

  return (
    <div className="space-y-6">
      <p className="text-xs font-medium leading-relaxed text-gray-500">
        These fields power the public single product page. Leave any field empty if it
        is not available yet.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Trade Name
          </label>
          <input
            name="pharma_trade_name"
            type="text"
            defaultValue={defaults.tradeName}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0"
            placeholder="e.g. Abamune, Ziagen"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Available Strength
          </label>
          <input
            name="pharma_available_strength"
            type="text"
            defaultValue={defaults.availableStrength}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0"
            placeholder="e.g. 300 mg, 600 mg"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Available Combination
          </label>
          <input
            name="pharma_available_combination"
            type="text"
            defaultValue={defaults.availableCombination}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0"
            placeholder="e.g. Aceclofenac + Paracetamol"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Packing
          </label>
          <input
            name="pharma_packing"
            type="text"
            defaultValue={defaults.packing}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0"
            placeholder="e.g. 30 Tablets / Bottle"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Pack Insert / Leaflet
          </label>
          <select
            name="pharma_pack_insert_leaflet"
            defaultValue={defaults.packInsertLeaflet}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0 bg-white"
          >
            <option value="">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Therapeutic Use
          </label>
          <input
            name="pharma_therapeutic_use"
            type="text"
            defaultValue={defaults.therapeuticUse}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0"
            placeholder="e.g. Anti HIV Medication"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Production Capacity
          </label>
          <input
            name="pharma_production_capacity"
            type="text"
            defaultValue={defaults.productionCapacity}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0"
            placeholder="e.g. 10 Million Tablet / Month"
          />
        </div>
      </div>

      {/* <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Brochure URL
        </label>
        <input
          name="pharma_brochure_url"
          type="url"
          defaultValue={defaults.brochureUrl}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium focus:border-black focus:ring-0"
          placeholder="https://..."
        />
      </div> */}
      
    </div>
  )
}
