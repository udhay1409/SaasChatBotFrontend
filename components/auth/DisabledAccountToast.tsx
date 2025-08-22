"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';

export const DisabledAccountToast = () => {
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleDisabledAccount = (event: CustomEvent) => {
      const { message } = event.detail;
      
      toast.error('Account Disabled', {
        description: message,
        duration: Infinity, // Keep toast until user clicks OK
        action: {
          label: 'OK',
          onClick: () => {
            // Only dismiss the toast, don't redirect
            toast.dismiss();
          },
        },
        onDismiss: () => {
          // Don't redirect when dismissed - just remove from screen
          console.log('Disabled account toast dismissed');
        },
        // Custom styling for this specific toast
        className: 'border-2 border-red-500 bg-red-50 text-red-900',
        style: {
          background: 'rgb(254 242 242)', // red-50
          color: 'rgb(127 29 29)', // red-900
          border: '2px solid rgb(239 68 68)', // red-500
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '16px 20px',
          minWidth: '400px',
          maxWidth: '500px',
        },
      });
    };

    // Listen for the custom disabled account event
    window.addEventListener('disabledAccount', handleDisabledAccount as EventListener);

    // Cleanup event listener
    return () => {
      window.removeEventListener('disabledAccount', handleDisabledAccount as EventListener);
    };
  }, []);

  // This component doesn't render anything visible - it only listens for events and triggers toasts
  return null;
};

export default DisabledAccountToast;