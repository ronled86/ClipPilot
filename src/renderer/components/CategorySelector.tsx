import React from 'react'
import { useTranslation } from 'react-i18next'

interface CategorySelectorProps {
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  className?: string
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  className = ''
}) => {
  const { t } = useTranslation()
  
  const categories = [
    { id: '0', name: t('categories.all') },
    { id: '10', name: t('categories.music') },
    { id: '24', name: t('categories.entertainment') },
    { id: '23', name: t('categories.comedy') },
    { id: '27', name: t('categories.education') },
    { id: '28', name: t('categories.science_tech') },
    { id: '26', name: t('categories.howto_style') },
    { id: '25', name: t('categories.news_politics') },
    { id: '22', name: t('categories.people_blogs') },
    { id: '1', name: t('categories.film_animation') },
    { id: '20', name: t('categories.gaming') },
    { id: '17', name: t('categories.sports') },
    { id: '19', name: t('categories.travel_events') },
    { id: '15', name: t('categories.pets_animals') },
    { id: '2', name: t('categories.autos_vehicles') }
  ]

  return (
    <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:space-s-2 ${className}`}>
      <label htmlFor="category-select" className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap rtl:ml-3 ltr:mr-2">
        {t('categories.label')}
      </label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   hover:border-gray-400 dark:hover:border-gray-500 transition-colors
                   min-w-[140px]"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CategorySelector
