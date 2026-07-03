"use client"

import { useState, useTransition } from "react"
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Loader2 } from "lucide-react"

import Modal from "@modules/common/components/modal"
import { Button } from "@modules/common/components/button"
import { useToast } from "@modules/common/context/toast-context"

type RemoveStaffAccessButtonProps = {
  userId: string
  staffName: string
  removeAction: (_userId: string) => Promise<void>
}

export default function RemoveStaffAccessButton({
  userId,
  staffName,
  removeAction,
}: RemoveStaffAccessButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  const closeModal = () => {
    if (!isPending) {
      setIsOpen(false)
    }
  }

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await removeAction(userId)
        setIsOpen(false)
        showToast(
          `${staffName} no longer has admin access.`,
          "success",
          "Staff Access Removed"
        )
      } catch (error) {
        console.error("Failed to remove staff access:", error)
        showToast(
          "Failed to remove staff access. Please try again.",
          "error",
          "Remove Failed"
        )
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove staff access"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <TrashIcon className="h-4 w-4" />
        )}
      </button>

      <Modal isOpen={isOpen} close={closeModal} size="small">
        <div className="space-y-5">
          <Modal.Title>
            <div className="flex items-center gap-x-2 text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <span>Remove Staff Access</span>
            </div>
          </Modal.Title>
          <Modal.Description>
            <span className="leading-relaxed text-gray-600">
              Are you sure you want to remove admin access for{" "}
              <span className="font-semibold text-gray-900">{staffName}</span>?
              This user will not be able to open the admin panel after signing
              out.
            </span>
          </Modal.Description>
          <Modal.Footer>
            <Button
              variant="secondary"
              size="small"
              onClick={closeModal}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={handleConfirm}
              isLoading={isPending}
              disabled={isPending}
            >
              Remove Access
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  )
}
