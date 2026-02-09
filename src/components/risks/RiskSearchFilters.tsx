import React from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { RiskFilter, RiskLevel, RiskStatus } from "../../services/riskService";

type LevelOption = RiskLevel | "all";
type StatusOption = RiskStatus | "all";

export type SavedFilter = {
  name: string;
  payload: RiskFilter & {
    status: StatusOption;
    level: LevelOption;
    category?: string;
    search?: string;
  };
};

type Props = {
  search: string;
  status: StatusOption;
  level: LevelOption;
  category: string;

  onSearchChange: (v: string) => void;
  onStatusChange: (v: StatusOption) => void;
  onLevelChange: (v: LevelOption) => void;
  onCategoryChange: (v: string) => void;

  onApply: () => void;
  onClear: () => void;
  onSave: (name: string) => void;
  onLoadByName: (name: string) => void;

  savedFilters: SavedFilter[];

  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
};

const statusOrder: RiskStatus[] = [
  "identified",
  "assessed",
  "treating",
  "monitoring",
  "accepted",
  "transferred",
  "avoided",
  "closed",
];

const RiskSearchFilters: React.FC<Props> = ({
  search,
  status,
  level,
  category,
  onSearchChange,
  onStatusChange,
  onLevelChange,
  onCategoryChange,
  onApply,
  onClear,
  onSave,
  onLoadByName,
  savedFilters,
  showFilters,
  setShowFilters,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search risks by title, description, category…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onApply();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search risks"
            />
          </div>
        </div>

        {/* Toggle filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-expanded={showFilters}
          aria-controls="risk-filters-panel"
          type="button"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>

        <div className="flex items-center gap-2">
          {/* Saved filters dropdown (optional quick load) */}
          <div className="hidden md:block">
            <select
              onChange={(e) => {
                const name = e.target.value;
                if (!name) return;
                onLoadByName(name);
              }}
              defaultValue=""
              className="px-3 py-2 border border-gray-300 rounded-lg"
              title="Saved filters"
              aria-label="Saved filters"
            >
              <option value="" disabled>
                Saved filters…
              </option>
              {savedFilters.map((sf) => (
                <option key={sf.name} value={sf.name}>
                  {sf.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            type="button"
          >
            Apply
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Clear filters"
            type="button"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const name = prompt("Save current filters as name:", "Default");
              if (!name) return;
              onSave(name);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Save current filters"
            type="button"
          >
            Save
          </button>
          <button
            onClick={() => {
              const names = savedFilters.map((k) => k.name);
              if (names.length === 0) {
                alert("No saved filters");
                return;
              }
              const name = prompt(`Load filters. Available: ${names.join(", ")}`);
              if (!name) return;
              onLoadByName(name);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Load saved filters"
            type="button"
          >
            Load
          </button>
        </div>
      </div>

      {showFilters && (
        <div id="risk-filters-panel" className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="sr-only" htmlFor="risk-status">
              Status
            </label>
            <select
              id="risk-status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as StatusOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusOrder.map((s) => (
                <option key={s} value={s}>
                  {s
                    .split("_")
                    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
                    .join(" ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="sr-only" htmlFor="risk-level">
              Level
            </label>
            <select
              id="risk-level"
              value={level}
              onChange={(e) => onLevelChange(e.target.value as LevelOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="sr-only" htmlFor="risk-category">
              Category
            </label>
            <input
              id="risk-category"
              type="text"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="Filter by Category"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskSearchFilters;