"use client";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useEffect } from "react";

const AuthHeader = () => {
  const { user, isLoading, error } = useUser();

  useEffect(() => {
    if (error) {
      console.error("Auth Error:", error);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex flex-col">
        {isLoading ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        ) : user ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Welcome back!
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Click to sign in with Civic Auth
          </div>
        )}
        {error && (
          <div className="text-xs text-red-500 mt-1">
            {error.message || "Authentication error occurred"}
          </div>
        )}
      </div>
      <UserButton />
    </div>
  );
};

export { AuthHeader };
