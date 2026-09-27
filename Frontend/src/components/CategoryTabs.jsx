// Kept local to this component since it's the only place categories are listed
// (no separate constants/categories.js in this project's file structure).
const CATEGORIES = [
  { id: '', label: 'Top' },
  { id: 'politics', label: 'Politics' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'science', label: 'Science' },
  { id: 'health', label: 'Health' },
  { id: 'world', label: 'World' },
]

export default function CategoryTabs({ value, onChange }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="News category">
      {CATEGORIES.map((c) => (
        <button
          key={c.id || 'top'}
          role="tab"
          aria-selected={value === c.id}
          className={`category-tabs__tab ${value === c.id ? 'category-tabs__tab--active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
