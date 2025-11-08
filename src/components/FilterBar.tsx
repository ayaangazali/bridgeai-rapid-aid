import { Category } from '@/types/request';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  activeFilter: Category | 'All';
  onFilterChange: (filter: Category | 'All') => void;
}

const filters: (Category | 'All')[] = ['All', 'Food', 'Shelter', 'Legal', 'Other'];

export const FilterBar = ({ activeFilter, onFilterChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={activeFilter === filter ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter)}
          className={cn(
            "min-w-[70px] rounded-2xl transition-all duration-300",
            activeFilter === filter 
              ? "glass-button" 
              : "glass-card hover:shadow-lg"
          )}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
};
