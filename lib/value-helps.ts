import { Role } from "@prisma/client";

import { APP_CODES, APP_DEFINITIONS, type AppCode } from "@/lib/apps";

export type ValueHelpOption<T extends string = string> = {
  value: T;
  label: string;
};

export type AppValueHelpOption = ValueHelpOption<AppCode> & {
  description: string;
};

export const ROLE_VALUE_HELP: ValueHelpOption<Role>[] = Object.values(Role).map(
  (role) => ({
    value: role,
    label: role === "ADMIN" ? "Admin" : "User",
  }),
);

export const APP_VALUE_HELP: AppValueHelpOption[] = APP_CODES.map((appCode) => ({
  value: appCode,
  label: APP_DEFINITIONS[appCode].label,
  description: APP_DEFINITIONS[appCode].description,
}));

export function isRoleValue(value: string): value is Role {
  return ROLE_VALUE_HELP.some((option) => option.value === value);
}
