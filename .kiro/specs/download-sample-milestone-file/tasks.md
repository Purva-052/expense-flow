# Implementation Plan: Download Sample Milestone File

## Overview

This implementation plan breaks down the download sample file feature into discrete, incremental coding tasks. Each task builds on the previous ones, starting with the core download functionality, then adding UI elements, error handling, and finally comprehensive testing.

## Tasks

- [x] 1. Implement core download handler function
  - Create `handleDownloadSample` function using useCallback hook
  - Implement API call to milestone_sample endpoint with blob responseType
  - Add state management for isDownloading using useState
  - Implement blob URL creation and automatic download trigger
  - Add filename extraction from Content-Disposition header with fallback
  - Implement resource cleanup (URL revocation, DOM element removal)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1_

- [x] 2. Add error handling to download function
  - Create `extractErrorMessage` helper function
  - Implement error detection for network errors (ERR_NETWORK)
  - Implement error detection for authentication errors (401)
  - Implement error detection for server errors (5xx)
  - Add toast notifications for success and error states
  - Ensure loading state clears in finally block
  - _Requirements: 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [-] 3. Add Download Sample button to UI
  - Import necessary icons (Download, Loader2) from lucide-react
  - Import toast from sonner library
  - Add Button component above the Tabs component
  - Implement conditional rendering for loading state (spinner vs download icon)
  - Add disabled prop bound to isDownloading state
  - Style button with appropriate variant and size
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2, 3.3_

- [ ]* 4. Write unit tests for download functionality
  - [ ]* 4.1 Write test for button rendering
    - Test that button renders with "Download Sample" text
    - Test that button is present in the component
    - **Example 1: Button renders with correct text**
    - **Validates: Requirements 1.1**

  - [ ]* 4.2 Write test for button accessibility
    - Test that button is keyboard focusable
    - Test that button can be activated with Enter/Space keys
    - **Example 2: Button is keyboard accessible**
    - **Validates: Requirements 1.5**

  - [ ]* 4.3 Write test for API call on button click
    - Mock axios instance
    - Test that clicking button calls API with correct endpoint
    - Test that request has responseType: 'blob'
    - **Example 3: Button click triggers API call**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 4.4 Write test for successful download flow
    - Mock blob response and browser APIs
    - Test that URL.createObjectURL is called
    - Test that download link is created and clicked
    - Test that filename is set correctly
    - **Example 4: Successful download creates and triggers file link**
    - **Validates: Requirements 2.3, 2.4, 2.5**

  - [ ]* 4.5 Write test for filename extraction
    - Test filename extraction from Content-Disposition header
    - Test fallback to default filename when header is missing
    - **Example 5: Filename extraction from Content-Disposition header**
    - **Example 6: Default filename when header is missing**
    - **Validates: Requirements 2.5**

  - [ ]* 4.6 Write tests for loading state
    - Test that isDownloading becomes true on button click
    - Test that button shows loading indicator when downloading
    - Test that button is disabled when downloading
    - Test that loading state clears on success
    - Test that loading state clears on error
    - **Example 7: Loading state activates on button click**
    - **Example 8: Loading state clears on success**
    - **Example 9: Loading state clears on error**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 4.5**

  - [ ]* 4.7 Write tests for error handling
    - Test network error displays correct message
    - Test server error (500) displays correct message
    - Test authentication error (401) displays correct message
    - Test that toast.error is called with correct messages
    - Test that button remains enabled after error
    - **Example 10: Network error displays correct message**
    - **Example 11: Server error displays correct message**
    - **Example 12: Authentication error displays correct message**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [ ]* 4.8 Write integration tests
    - Test that correct API configuration is used
    - Test that API.projects.milestone_sample endpoint is used
    - Test that instance from correct path is imported
    - **Example 13: Uses correct API configuration**
    - **Validates: Requirements 6.1, 6.2**

- [~] 5. Checkpoint - Ensure all tests pass
  - Run all tests and verify they pass
  - Check TypeScript compilation for type errors
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [~] 6. Manual testing and refinement
  - Test download functionality in browser
  - Verify file downloads with correct name
  - Test error scenarios (disconnect network, etc.)
  - Verify loading states and button behavior
  - Test keyboard navigation and accessibility
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The checkpoint ensures incremental validation
- Unit tests validate specific examples and error conditions
- All TypeScript types should be properly defined to maintain type safety
- The implementation follows existing codebase patterns (React hooks, axios instance, UI components)
