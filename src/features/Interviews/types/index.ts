/* eslint-disable @typescript-eslint/no-explicit-any */
import { InterviewFormValues } from "../schema";

export interface InterviewEvent {
  id: string;
  title: string;
  start: string;
  extendedProps: InterviewFormValues & { [key: string]: any };
}

