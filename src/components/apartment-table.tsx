import { type Apartment, formatPrice } from "@/data/apartments";
import { StatusPill } from "./apartment-card";

export function ApartmentTable({
  apartments,
  onSelect,
}: {
  apartments: Apartment[];
  onSelect: (a: Apartment) => void;
}) {
  return (
    <div className="bg-card border border-graphite/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-graphite/60">
              <th className="text-left eyebrow font-medium px-6 py-4">Unit</th>
              <th className="text-left eyebrow font-medium px-3 py-4">Bldg</th>
              <th className="text-left eyebrow font-medium px-3 py-4">Floor</th>
              <th className="text-left eyebrow font-medium px-3 py-4">Rooms</th>
              <th className="text-left eyebrow font-medium px-3 py-4">Area</th>
              <th className="text-left eyebrow font-medium px-3 py-4">Aspect</th>
              <th className="text-left eyebrow font-medium px-3 py-4">Status</th>
              <th className="text-right eyebrow font-medium px-6 py-4">Price</th>
            </tr>
          </thead>
          <tbody>
            {apartments.map((a) => (
              <tr
                key={a.id}
                onClick={() => onSelect(a)}
                className={`border-b border-graphite/5 last:border-0 cursor-pointer hover:bg-mist transition-colors ${
                  a.status === "sold" ? "opacity-60" : ""
                }`}
              >
                <td className="px-6 py-4 font-serif text-graphite text-base">{a.number}</td>
                <td className="px-3 py-4 text-graphite/80">{a.building}</td>
                <td className="px-3 py-4 text-graphite/80 tabular-nums">{a.floor}</td>
                <td className="px-3 py-4 text-graphite/80 tabular-nums">{a.rooms}</td>
                <td className="px-3 py-4 text-graphite/80 tabular-nums">{a.area} m²</td>
                <td className="px-3 py-4 text-graphite/80">{a.orientation}</td>
                <td className="px-3 py-4"><StatusPill status={a.status} /></td>
                <td className="px-6 py-4 text-right font-serif text-graphite tabular-nums text-base">
                  {formatPrice(a.price)}
                </td>
              </tr>
            ))}
            {apartments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-graphite/50">
                  No residences match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
