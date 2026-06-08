'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function DeleteDocumentButton() {
  const { pending } = useFormStatus()

  return (
    <Button 
      variant="outline" 
      size="sm" 
      type="submit" 
      disabled={pending}
      className="h-8 text-xs rounded-full text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 cursor-pointer w-[125px]"
    >
      {pending ? (
        <>
          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
          Deleting...
        </>
      ) : (
        'Delete Document'
      )}
    </Button>
  )
}
