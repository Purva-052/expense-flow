import { EnhancedError, ErrorResponse } from "@/types";

export const extractErrorInfo = (error: EnhancedError) => {
    const status = error.status ?? error.statusCode ?? error.response?.status;
    const responseData = error.response?.data;
    const errorCode = error.code ?? error.messageCode;

    // Default error info
    let title = "Something went wrong";
    let description = "Please try again later";
    let duration = 5000;

    // Handle different types of errors
    if (status) {
        switch (status) {
            case 400:
                title = "Invalid Request";
                description = getValidationMessage(responseData) ?? "Please check your input and try again";
                break;

            case 401:
                title = "Authentication Failed";
                description = responseData?.message ?? "Please check your credentials and try again";
                break;

            case 403:
                title = "Access Denied";
                description = "You don't have permission to perform this action";
                break;

            case 404:
                title = "Error";
                description = getValidationMessage(responseData) ?? "Please check your input and try again";
                break;

            case 422:
                title = "Validation Error";
                description = getValidationMessage(responseData) ?? "Please correct the highlighted fields";
                break;

            case 429:
                title = "Too Many Requests";
                description = "Please wait a moment before trying again";
                duration = 8000;
                break;

            case 500:
                title = "Server Error";
                description = "Our servers are experiencing issues. Please try again later";
                duration = 8000;
                break;

            case 502:
            case 503:
            case 504:
                title = "Service Unavailable";
                description = "The service is temporarily unavailable. Please try again later";
                duration = 8000;
                break;

            default:
                title = `Error ${status}`;
                description = responseData?.message ?? "An unexpected error occurred";
        }
    } else if (errorCode) {
        // Handle specific error codes
        switch (errorCode) {
            case "ERR_NETWORK":
                title = "Network Error";
                description = "Please check your internet connection and try again";
                duration = 6000;
                break;

            case "ECONNABORTED":
            case "ERR_TIMEOUT":
                title = "Request Timeout";
                description = "The request took too long. Please try again";
                duration = 6000;
                break;

            case "ERR_CANCELED":
                title = "Request Canceled";
                description = "The request was canceled";
                duration = 3000;
                break;

            case "ERR_BAD_REQUEST":
                title = "Bad Request";
                description = responseData?.message ?? "Please check your input and try again";
                break;

            default:
                title = "Request Failed";
                description = responseData?.message ?? error.message ?? "Please try again";
        }
    } else if (error.message) {
        // Fallback to error message
        title = "Error";
        description = error.message.includes("Network Error") ?
            "Please check your internet connection" :
            error.message;
    }

    return { title, description, duration };
};


const getValidationMessage = (responseData?: ErrorResponse): string | null => {
    if (!responseData) return null;

    // Handle different validation error formats
    if (responseData.errors) {
        if (Array.isArray(responseData.errors)) {
            return responseData.errors.join(", ");
        } else if (typeof responseData.errors === "object") {
            const messages = Object.values(responseData.errors).flat();
            return messages.join(", ");
        }
    }

    return responseData.message ?? responseData.error ?? null;
};