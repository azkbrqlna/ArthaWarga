import { toast } from "sonner";

export function useNotify() {
    const notifySuccess = (title, description) => {
        toast.success(title, {
            description,
            duration: 3000,
            style: { background: "#10b981", color: "white" }, // hijau emerald
        });
    };

    const notifyError = (title, description) => {
        toast.error(title, {
            description,
            duration: 4000,
            style: { background: "#ef4444", color: "white" }, // merah error
        });
    };

    return { notifySuccess, notifyError };
}
