import React from "react";
import { Toaster, toast } from "react-hot-toast";

export { toast };

export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
