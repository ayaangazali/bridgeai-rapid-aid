import { Category } from '@/types/request';
import { Button } from '@/components/ui/button';

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
          className="min-w-[70px]"
        >
          {filter}
        </Button>
      ))}
    </div>
  );
};
