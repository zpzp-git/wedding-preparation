export const GUEST_PAGE_SIZE = 10;
export const EMPTY_RELATION = "__empty__";

export type GuestListFilters = {
  query: string;
  side: string;
  relation: string;
  status: string;
  giftAmount: string;
  giftSettled: string;
  accommodation: string;
};

type FilterableGuest = {
  name: string;
  side: "groom" | "bride";
  relation: string;
  confirmed: boolean;
  giftAmountCents: number;
  giftSettled: boolean;
  needsAccommodation: boolean;
  note: string;
};

function matchesBoolean(value: boolean, filter: string) {
  if (filter === "yes") return value;
  if (filter === "no") return !value;
  return true;
}

export function filterGuestList<T extends FilterableGuest>(
  guests: T[],
  filters: GuestListFilters,
) {
  const query = filters.query.trim().toLowerCase();
  return guests.filter((guest) => {
    if (filters.side && guest.side !== filters.side) return false;
    if (
      filters.relation &&
      (filters.relation === EMPTY_RELATION
        ? guest.relation.trim() !== ""
        : guest.relation !== filters.relation)
    )
      return false;
    if (filters.status === "confirmed" && !guest.confirmed) return false;
    if (filters.status === "pending" && guest.confirmed) return false;
    if (filters.giftAmount === "with" && guest.giftAmountCents <= 0)
      return false;
    if (filters.giftAmount === "none" && guest.giftAmountCents > 0)
      return false;
    if (!matchesBoolean(guest.giftSettled, filters.giftSettled)) return false;
    if (!matchesBoolean(guest.needsAccommodation, filters.accommodation))
      return false;
    return !query || guest.name.toLowerCase().includes(query);
  });
}

export function getGuestRelationships(guests: FilterableGuest[]) {
  return [
    ...new Set(guests.map((guest) => guest.relation.trim()).filter(Boolean)),
  ].sort((left, right) => left.localeCompare(right, "zh-CN"));
}

export function paginateGuests<T>(guests: T[], requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(guests.length / GUEST_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * GUEST_PAGE_SIZE;
  return {
    page,
    totalPages,
    items: guests.slice(start, start + GUEST_PAGE_SIZE),
  };
}
