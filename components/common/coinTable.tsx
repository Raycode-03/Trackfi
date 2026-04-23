import React, { useState } from "react";
import { SlidersHorizontal, Download, Search } from "lucide-react";
import { WatchlistCoin } from "@/types/index";
import { CoinRowSection } from "./coinRowSection";
import { useWatchlistFilters } from "@/hooks/useWatchlistFilters";
import { FilterSection } from "./filterSection";
import { exportWatchlistToCSV } from "@/lib/helpers/watchlistExport";

interface CoinTableProps {
  coins: WatchlistCoin[];
  title: string;
  onToggleStar: (id: string) => void;
  onToggleAlert: (id: string) => void;
  showExport?: boolean;
  showHoldings?: boolean;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  isServerPaginated?: boolean;
}

function CoinTable({
  coins,
  title,
  onToggleStar,
  onToggleAlert,
  showExport = false,
  showHoldings = false,
  page = 1,
  total,
  limit = 20,
  onPageChange,
  onSearch,
  isServerPaginated = false,
}: CoinTableProps) {
  const CLIENT_PAGE_SIZE = 8;
  const [showFilter, setShowFilter] = useState(false);
  const [clientPage, setClientPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const { filters, setFilter, resetFilters, isActive, filtered } =
    useWatchlistFilters(coins);

  // client-side pagination (watchlist, no server pagination)
  const clientTotalPages = Math.ceil(filtered.length / CLIENT_PAGE_SIZE);
  const clientOffset = (clientPage - 1) * CLIENT_PAGE_SIZE;
  const clientPaginated = filtered.slice(clientOffset, clientOffset + CLIENT_PAGE_SIZE);

  // server-side pagination (markets)
  const serverTotalPages = total ? Math.ceil(total / limit) : 1;

  const displayedCoins = isServerPaginated ? coins : clientPaginated;
  const currentPage = isServerPaginated ? page : clientPage;
  const totalPages = isServerPaginated ? serverTotalPages : clientTotalPages;
  const totalCount = isServerPaginated ? (total ?? 0) : filtered.length;

  const handlePageChange = (newPage: number) => {
    if (isServerPaginated) {
      onPageChange?.(newPage);
    } else {
      setClientPage(newPage);
    }
  };

  const handleSearch = (val: string) => {
    setSearchValue(val);
    if (isServerPaginated) {
      onSearch?.(val);
      onPageChange?.(1);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          {/* search — only for server paginated (markets) */}
          {isServerPaginated && onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/20 w-36"
              />
            </div>
          )}

          <button
            onClick={() => setShowFilter((p) => !p)}
            className={`flex items-center gap-1.5 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors ${isActive ? "border-primary/40 text-primary" : ""}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter {isActive && "•"}
          </button>

          {showExport && (
            <button
              onClick={() => exportWatchlistToCSV(filtered)}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}

          {showFilter && (
            <FilterSection
              filters={filters}
              onChange={setFilter}
              onReset={resetFilters}
              onClose={() => setShowFilter(false)}
              totalCoins={coins.length}
              filteredCount={filtered.length}
            />
          )}
        </div>
      </div>

      <div
        className="overflow-x-auto scroll-smooth w-full"
        style={{ scrollbarColor: "#000000 transparent" }}
      >
        <table className="w-full min-w-[600px] bg-white/5">
          <thead>
            <tr className="text-[12px] text-white/30 uppercase tracking-widest">
              <th className="text-left pt-4 pb-4 font-bold pl-2">Coin</th>
              {showHoldings && (
                <th className="text-left pt-4 pb-4 font-bold">Holdings</th>
              )}
              <th className="text-left pt-4 pb-4 font-bold md:table-cell">Price</th>
              <th className="text-left pt-4 pb-4 font-bold">24H Change</th>
              <th className="text-left pt-4 pb-4 font-bold hidden md:table-cell">7D Change</th>
              <th className="text-left pt-4 pb-4 font-bold hidden lg:table-cell">Market Cap</th>
              <th className="text-left pt-4 pb-4 font-bold hidden lg:table-cell">Last 7 Days</th>
              <th className="text-left pt-4 pb-4 font-bold pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedCoins.map((coin) => (
              <CoinRowSection
                key={coin.id}
                coin={coin}
                onToggleStar={onToggleStar}
                onToggleAlert={onToggleAlert}
                showHoldings={showHoldings}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-white/5">
        <p className="text-xs text-white/30">
          Showing {(currentPage - 1) * (isServerPaginated ? limit : CLIENT_PAGE_SIZE) + 1}–
          {Math.min(currentPage * (isServerPaginated ? limit : CLIENT_PAGE_SIZE), totalCount)} of {totalCount}
          {isServerPaginated ? "+" : ""} assets
        </p>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >‹</button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            // show pages around current page
            const start = Math.max(1, currentPage - 2);
            return start + i;
          })
            .filter((n) => n <= totalPages)
            .map((n) => (
              <button
                key={n}
                onClick={() => handlePageChange(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                  ${currentPage === n ? "bg-primary text-black" : "text-white/40 hover:text-white hover:bg-white/10"}`}
              >{n}</button>
            ))}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="text-white/30 text-sm px-1">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 1 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className="w-8 h-8 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >{totalPages}</button>
          )}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || coins.length < limit}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >›</button>
        </div>
      </div>
    </div>
  );
}

export default CoinTable;