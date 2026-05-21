import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

function toast({ title, description, variant, duration }: ToastOptions) {
  const message = title ?? description ?? "";
  const detail = title && description ? description : undefined;
  const opts = { description: detail, duration };

  if (variant === "destructive") {
    sonnerToast.error(message, opts);
  } else if (variant === "warning") {
    sonnerToast.warning(message, opts);
  } else if (variant === "info") {
    sonnerToast.info(message, opts);
  } else {
    sonnerToast.success(message, opts);
  }

  return { id: "", dismiss: () => {}, update: () => {} };
}

function useToast() {
  return {
    toast,
    dismiss: () => {},
    toasts: [] as never[],
  };
}

export { useToast, toast };
