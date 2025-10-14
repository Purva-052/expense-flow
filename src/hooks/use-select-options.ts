import { useMemo } from 'react';

type Option = {
  label: string;
  value: string | number;
};

type UseSelectOptionParams<T> = {
  listData: T[];
  labelKey?: keyof T;
  valueKey?: keyof T;
};

export const useSelectOptions = <T extends Record<string, any>>({
  listData,
  labelKey = 'label',
  valueKey = 'value',
}: UseSelectOptionParams<T>) => {
  const options: Option[] = useMemo(() => {
    if (Array.isArray(listData) && listData.length > 0) {
      return listData.map((item) => ({
        label: String(item[labelKey]),
        value: item[valueKey] as string | number,
      }));
    }
    return [];
  }, [listData, labelKey, valueKey]);

  return { options };
};