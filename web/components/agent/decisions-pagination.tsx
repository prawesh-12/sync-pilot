import Link from "next/link";

const FIRST_PAGE = 1;
const PAGE_WINDOW = 1;
const GAP = "gap";

type PageSlot = number | typeof GAP;

type DecisionsPaginationProps = {
  currentPage: number;
  totalPages: number;
};

const baseClass =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-xs transition-colors";
const idleClass = `${baseClass} border-white/8 bg-white/3 text-sp-muted hover:bg-white/8 hover:text-sp-text`;
const currentClass = `${baseClass} border-sp-cobalt/40 bg-sp-cobalt/20 text-sp-text`;
const disabledClass = `${baseClass} border-white/5 bg-transparent text-sp-muted/40`;

export function DecisionsPagination({
  currentPage,
  totalPages,
}: DecisionsPaginationProps) {
  if (totalPages <= FIRST_PAGE) {
    return null;
  }

  return (
    <nav
      aria-label="Decision pages"
      className="mt-4 flex flex-wrap items-center justify-center gap-1.5"
    >
      <PageLink page={currentPage - 1} isDisabled={currentPage === FIRST_PAGE}>
        Previous
      </PageLink>

      {buildPageSlots(currentPage, totalPages).map((slot, index) => (
        <PageSlotItem
          key={slot === GAP ? `${GAP}-${index}` : slot}
          slot={slot}
          currentPage={currentPage}
        />
      ))}

      <PageLink page={currentPage + 1} isDisabled={currentPage === totalPages}>
        Next
      </PageLink>
    </nav>
  );
}

function PageSlotItem({
  slot,
  currentPage,
}: {
  slot: PageSlot;
  currentPage: number;
}) {
  if (slot === GAP) {
    return <span className="px-1 text-xs text-sp-muted">...</span>;
  }

  return (
    <PageLink page={slot} isCurrent={slot === currentPage}>
      {slot}
    </PageLink>
  );
}

function PageLink({
  page,
  isCurrent = false,
  isDisabled = false,
  children,
}: {
  page: number;
  isCurrent?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}) {
  if (isDisabled) {
    return (
      <span aria-disabled className={disabledClass}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`/agent?page=${page}`}
      aria-current={isCurrent ? "page" : undefined}
      className={isCurrent ? currentClass : idleClass}
    >
      {children}
    </Link>
  );
}

// Always keep the first and last page reachable, with a window around the
// current one, so 36 pages do not render 36 links.
function buildPageSlots(currentPage: number, totalPages: number): PageSlot[] {
  const wanted = new Set<number>([FIRST_PAGE, totalPages]);

  for (let offset = -PAGE_WINDOW; offset <= PAGE_WINDOW; offset += 1) {
    const page = currentPage + offset;

    if (page >= FIRST_PAGE && page <= totalPages) {
      wanted.add(page);
    }
  }

  const slots: PageSlot[] = [];
  let previous = 0;

  for (const page of [...wanted].sort((a, b) => a - b)) {
    if (previous && page - previous > 1) {
      slots.push(GAP);
    }

    slots.push(page);
    previous = page;
  }

  return slots;
}
