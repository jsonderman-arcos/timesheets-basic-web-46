import { toast } from "@/hooks/use-toast";

export const showSuccessToast = (title: string, description?: string) => {
  return toast({
    variant: "success",
    title,
    description,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  return toast({
    variant: "destructive",
    title,
    description,
  });
};