import React from "react";
import debounce from "debounce";

export const useDebouncedValue = (value: string, ms: number) => {
  const [_value, _setValue] = React.useState(value);

  const setDebouncedValue = React.useMemo(() => {
    return debounce((v: string) => _setValue(v), ms);
  }, [ms]);

  React.useEffect(() => {
    setDebouncedValue(value);
  }, [value, setDebouncedValue]);

  return _value;
};
