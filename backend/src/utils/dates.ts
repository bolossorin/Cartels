import { MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual } from "typeorm";
import { format } from "date-fns";

export const futureDate = (addSeconds) =>
  new Date(new Date().getTime() + addSeconds * 1000);

export const pastDate = (removeSeconds) =>
  new Date(new Date().getTime() - removeSeconds * 1000);

export const futureDateISOString = (addSeconds) =>
  futureDate(addSeconds).toISOString();

export const beforeNow = (dateObject) => dateObject < new Date();

export const afterNow = (dateObject) => dateObject < new Date();

export const diff = (startDate: Date, endDate: Date): number =>
  (endDate.getTime() - startDate.getTime()) / 1000;

export const diffFromNow = (endDate: Date): number => diff(new Date(), endDate);

export const formatDate = (date) =>
  date === null ? null : new Date(date).toJSON();

export const dateFromTime = (time: number | string): Date => {
  const date = new Date();
  date.setTime(parseInt(`${time}`));

  return date;
};

const defaultDateFormat = "yyyy-MM-dd HH:mm:ss.SSS";

export const MoreThanDate = (date: Date) =>
  MoreThan(format(date, defaultDateFormat));

export const MoreThanOrEqualDate = (date: Date) =>
  MoreThanOrEqual(format(date, defaultDateFormat));

export const LessThanDate = (date: Date) =>
  LessThan(format(date, defaultDateFormat));

export const LessThanOrEqualDate = (date: Date) =>
  LessThanOrEqual(format(date, defaultDateFormat));
