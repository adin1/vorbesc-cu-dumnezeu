'use client';

import { Button } from './Button';

type PlanCategoryFilterProps = {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
};

export function PlanCategoryFilter({ categories, activeCategory, onChange }: PlanCategoryFilterProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button
        type="button"
        variant={activeCategory === 'TOATE' ? 'primary' : 'secondary'}
        onClick={() => onChange('TOATE')}
      >
        Toate
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          type="button"
          variant={activeCategory === category ? 'primary' : 'secondary'}
          onClick={() => onChange(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
