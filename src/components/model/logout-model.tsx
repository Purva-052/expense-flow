import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, LogOut } from 'lucide-react'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: Readonly<LogoutModalProps>) {
  const handleConfirm = async () => {
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='rounded-xl bg-white shadow-2xl sm:max-w-[425px] dark:bg-gray-800'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30'>
                <AlertTriangle className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
              </div>
              <DialogTitle className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                Confirm Logout
              </DialogTitle>
            </div>
            <DialogDescription className='mt-2 text-gray-600 dark:text-gray-300'>
              Are you sure you want to log out? You’ll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-6 flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={onClose}
              disabled={loading}
              className='border-gray-300 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirm}
              disabled={loading}
              className='flex items-center gap-2 bg-red-600 text-white transition-colors hover:bg-red-700'
            >
              <AnimatePresence mode='wait'>
                {loading ? (
                  <motion.div
                    key='loading'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'
                  />
                ) : (
                  <motion.div
                    key='icon'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <LogOut className='h-4 w-4' />
                  </motion.div>
                )}
              </AnimatePresence>
              <span>{loading ? 'Logging out...' : 'Log out'}</span>
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}