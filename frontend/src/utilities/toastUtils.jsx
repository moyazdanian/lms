import { toast } from "sonner";

export const showError = (message) => {
  toast(message, {
    className: "bg-red-500 text-white border border-red-600",
  });
};

export const showSuccess = (message) => {
  toast(message, {
    className: "bg-green-500 text-white border border-green-600",
  });
};

export const showInfo = (message) => {
  toast(message, {
    className: "bg-blue-500 text-white border border-blue-600",
  });
};
