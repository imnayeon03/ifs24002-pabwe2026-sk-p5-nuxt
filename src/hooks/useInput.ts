import { ref, type Ref } from "vue";

export type InputChange = (eventOrValue: Event | string) => void;

/**
 * const [name, onNameChange, resetName] = useInput("");
 * <input :value="name" @input="onNameChange" />
 *
 * onChange menerima event DOM ATAU nilai langsung.
 */
export function useInput(
  initialValue = ""
): [Ref<string>, InputChange, () => void] {
  const value = ref(initialValue);

  const onChange: InputChange = (eventOrValue) => {
    value.value =
      typeof eventOrValue === "string"
        ? eventOrValue
        : (eventOrValue.target as HTMLInputElement).value;
  };

  const reset = () => {
    value.value = initialValue;
  };

  return [value, onChange, reset];
}
