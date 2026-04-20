import { useMemo, useState } from "react";
import { apartments as ALL, type Apartment } from "@/data/apartments";
import { type Filters, DEFAULT_FILTERS } from "@/components/apartment-filters";

export function useFilteredApartments(initial: Partial<Filters> = {}) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, ...initial });

  const filtered = useMemo<Apartment[]>(() => {
    return ALL.filter((a) => {
      if (filters.building !== "all" && a.building !== filters.building) return false;
      if (filters.rooms !== "all" && a.rooms !== filters.rooms) return false;
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (a.area < filters.minArea || a.area > filters.maxArea) return false;
      if (a.price > filters.maxPrice || a.price < filters.minPrice) return false;
      return true;
    });
  }, [filters]);

  const visibleIds = useMemo(() => new Set(filtered.map((a) => a.id)), [filtered]);

  return { filters, setFilters, filtered, visibleIds };
}
