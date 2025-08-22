"use client";

import { useState, useCallback } from "react";

// Interface for error response structure
interface ErrorResponse {
  status: number;
  data?: {
    errorType?: string;
    error?: string;
  };
}

export const useDisabledAccount = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState<string>("");

  const showDisabledMessage = useCallback((message?: string) => {
    setDisabledMessage(
      message || "You can't access the dashboard page, please contact admin"
    );
    setIsDisabled(true);
  }, []);

  const hideDisabledMessage = useCallback(() => {
    setIsDisabled(false);
    setDisabledMessage("");
  }, []);

  const handleDisabledAccount = useCallback(
    (errorResponse?: ErrorResponse) => {
      if (
        errorResponse?.status === 403 &&
        errorResponse?.data?.errorType === "ACCOUNT_DISABLED"
      ) {
        const message =
          errorResponse.data.error ||
          "You can't access the dashboard page, please contact admin";
        showDisabledMessage(message);
        return true; // Indicates that this was a disabled account error
      }
      return false; // Not a disabled account error
    },
    [showDisabledMessage]
  );

  return {
    isDisabled,
    disabledMessage,
    showDisabledMessage,
    hideDisabledMessage,
    handleDisabledAccount,
  };
};

export default useDisabledAccount;
