import React from 'react'
import { useTranslation } from 'react-i18next'

interface ExitConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  const { t } = useTranslation()
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('exit_modal.title')}
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('exit_modal.message')}
        </p>
        
        <div className="flex justify-end space-x-4 rtl:space-x-reverse rtl:space-x-0 rtl:space-r-4 gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                     bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                     rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 
                     focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                     min-w-[80px] whitespace-nowrap"
          >
            {t('exit_modal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-white 
                     bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                     dark:focus:ring-offset-gray-800
                     min-w-[120px] whitespace-nowrap"
          >
            {t('exit_modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExitConfirmationModal
