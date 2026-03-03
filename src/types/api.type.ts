import { ResultStatus } from "@/constants";

export type TResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus];

export interface TApiResponse<T> {
  status: TResultStatus;
  message: string;
  data: T;
}
