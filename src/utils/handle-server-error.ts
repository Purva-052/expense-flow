import { AxiosError } from "axios";
import { toast } from "sonner";

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  let errMsg = "Something went wrong!";

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    Number(error.status) === 204
  ) {
    errMsg = "Content not found.";
  }

  if (error instanceof AxiosError) {
    errMsg = error.response?.data?.message || error.response?.data?.title || error.message || errMsg;
  } else if (error instanceof Error) {
    errMsg = error.message || errMsg;
  }

  toast.error(errMsg);
}
